import React, { useState, useEffect } from 'react';
import FormularioSolicitud from './features/vecino/FormularioSolicitud';
import PanelAdmin from './features/junta/PanelAdmin';
import DetalleRevision from './features/junta/DetalleRevision';
import ConfiguracionJunta from './features/administracion/ConfiguracionJunta';

const entidadesPreconfiguradas = {
  jjvv19: {
    id: 'jjvv19',
    nombreJunta: 'Junta de Vecinos "Universidad" N° 19',
    rutJunta: '65.033.930-4',
    personalidadJuridica: 'RNPJSFL 211394',
    direccionOficina: 'Av. José Pedro Alessandri 1036',
    sitioWeb: 'www.unconunoa.cl',
    emailContacto: 'jvuniversidad19@gmail.com',
    telefono: '+56 2 2894 5764',
    correlativoInicial: '006889',
    valorCertificado: '1000',
    cabeceraTexto: 'JUNTA DE VECINOS "UNIVERSIDAD"\nUNIDAD VECINAL N° 19\nÑUÑOA',
    pieFirmaTexto: 'LA DIRECTIVA\nJunta de Vecinos Universidad UV 19',
    comuna: 'Ñuñoa',
    banco: 'Banco del Estado de Chile',
    tipoCuenta: 'Cuenta Corriente',
    numeroCuenta: '987654321'
  },
  unionComunal: {
    id: 'unionComunal',
    nombreJunta: 'Unión Comunal de Juntas de Vecinos de Ñuñoa',
    rutJunta: '71.564.900-4',
    personalidadJuridica: 'RNPJSFL 211394',
    direccionOficina: 'Av. Irarrázaval 085, Ñuñoa',
    sitioWeb: 'www.unioncomunalnunoa.cl',
    emailContacto: 'unioncomunalnunoa@gmail.com',
    telefono: '+56 2 2322 2985',
    correlativoInicial: '03489',
    valorCertificado: '1500',
    cabeceraTexto: 'UNIÓN COMUNAL DE JUNTAS DE VECINOS DE ÑUÑOA\nRUT 71.564.900-4 - RNPJSFL 211394\nAV. IRARRÁZAVAL 085 ÑUÑOA',
    pieFirmaTexto: 'Presidente o director de turno\nUNIÓN COMUNAL DE JJ.VV. ÑUÑOA',
    comuna: 'Ñuñoa',
    banco: 'Banco de Chile',
    tipoCuenta: 'Cuenta Corriente',
    numeroCuenta: '112233445'
  },
  nuevaJunta: {
    id: 'nuevaJunta',
    nombreJunta: '',
    rutJunta: '',
    personalidadJuridica: '',
    direccionOficina: '',
    sitioWeb: '',
    emailContacto: '',
    telefono: '',
    correlativoInicial: '',
    valorCertificado: '',
    cabeceraTexto: '',
    pieFirmaTexto: '',
    comuna: 'Ñuñoa',
    banco: '',
    tipoCuenta: 'Cuenta Corriente',
    numeroCuenta: ''
  }
};

function App() {
  const [resetKey, setResetKey] = useState(0);
  const [vista, setVista] = useState('vecino');
  const [solicitudActivaToken, setSolicitudActivaToken] = useState(null);

  const [juntas, setJuntas] = useState(() => {
    const guardadas = localStorage.getItem('saas_juntas');
    return guardadas ? JSON.parse(guardadas) : entidadesPreconfiguradas;
  });

  const [juntaConfig, setJuntaConfig] = useState(() => {
    const guardadas = localStorage.getItem('saas_juntas');
    const pooljuntas = guardadas ? JSON.parse(guardadas) : entidadesPreconfiguradas;
    return pooljuntas.jjvv19;
  });

  const [solicitudes, setSolicitudes] = useState([]);

  // ✅ FIX PROBLEMA 1: El useEffect ya NO depende de `vista`.
  // Solo se dispara al entrar al panel (resetKey) o cambiar el arancel.
  // Se controla con un flag `debeCargar` para no interferir con token-view.
  const [debeCargar, setDebeCargar] = useState(false);

  useEffect(() => {
    if (!debeCargar) return;

    const cargarSolicitudesDesdeBD = async () => {
      try {
        const respuesta = await fetch('https://backend-junta-vecinos.onrender.com/api/residentes');
        const datos = await respuesta.json();

        const solicitudesMapeadas = (Array.isArray(datos) ? datos : datos.data || []).map(sol => ({
          id: sol._id,
          folioTexto: `FOLIO-${sol.correlativoSolicitud || '1000'}`,
          nombre: sol.nombre,
          rut: sol.rut,
          email: sol.correo,
          direccion: typeof sol.direccion === 'object'
            ? `${sol.direccion.calle} ${sol.direccion.numero}, ${sol.direccion.comuna}`
            : sol.direccion,
          calidadResidente: sol.tipoResidente || 'Propietario',
          destino: sol.destino || 'Trámites Generales',
          montoPago: juntaConfig.valorCertificado || '1000',
          estado: sol.estado || 'Pendiente',
          ingreso: sol.createdAt ? new Date(sol.createdAt).toLocaleDateString('es-CL') : 'Reciente',
          urls: sol.urls || { cedula: '', domicilio: '', pago: '' }
        }));

        setSolicitudes(solicitudesMapeadas);
      } catch (error) {
        console.error("Error de sincronización con la API de MongoDB:", error);
      } finally {
        setDebeCargar(false);
      }
    };

    cargarSolicitudesDesdeBD();
  }, [debeCargar, resetKey, juntaConfig.valorCertificado]);

  const agregarSolicitud = () => {
    alert('¡Solicitud procesada exitosamente en el sistema seguro!');
    setDebeCargar(true);
    setVista('junta');
  };

  // ✅ FIX PROBLEMA 2 y 3: Llama al backend con PATCH y actualiza
  // solicitudActivaToken con el objeto ya aprobado ANTES de cambiar vista,
  // así token-view siempre tiene el estado correcto sin depender del array.
  const actualizarEstadoSolicitud = async (id, nuevoEstado, motivo = '') => {
    const fechaEmision = new Date().toLocaleDateString('es-CL');

    // FIX PROBLEMA 3: Persistir en MongoDB
    try {
      await fetch(`https://backend-junta-vecinos.onrender.com/api/residentes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado, motivoRechazo: motivo, juntaConfig })
      });
    } catch (error) {
      console.error("Error al persistir estado en MongoDB:", error);
      // Continuamos igual — el estado local igual se actualiza
    }

    // Actualizamos el array local
    setSolicitudes(prev => prev.map(sol =>
      sol.id === id
        ? { ...sol, estado: nuevoEstado, motivoRechazo: motivo, fechaEmision }
        : sol
    ));

    // FIX PROBLEMA 2: Construimos el token desde el array ANTES del setSolicitudes
    // usando la referencia directa, no la búsqueda posterior
    const solicitudBase = solicitudes.find(s => s.id === id);
    if (solicitudBase) {
      const copiaActualizada = {
        ...solicitudBase,
        estado: nuevoEstado,
        motivoRechazo: motivo,
        fechaEmision
      };
      // Guardamos el objeto completo y ya aprobado como token activo
      setSolicitudActivaToken(copiaActualizada);

      if (nuevoEstado === 'Aprobado') {
        setVista('token-view');
      }
    }
  };

  const simularClicEnlaceCorreo = (solicitud) => {
    setSolicitudActivaToken(solicitud);
    setVista('token-view');
  };

  const handleCambioEntidadDemo = (e) => {
    setJuntaConfig(juntas[e.target.value]);
  };

  const handleGuardarConfiguracion = (nuevaConfig) => {
    const esNueva = nuevaConfig.id === 'nuevaJunta';
    const idTenant = esNueva ? `junta-${Date.now()}` : nuevaConfig.id;
    const configConId = { ...nuevaConfig, id: idTenant };

    setJuntas((prevJuntas) => {
      const limpiadas = esNueva
        ? { ...prevJuntas, nuevaJunta: entidadesPreconfiguradas.nuevaJunta }
        : prevJuntas;
      const diccionarioActualizado = { ...limpiadas, [idTenant]: configConId };
      localStorage.setItem('saas_juntas', JSON.stringify(diccionarioActualizado));
      return diccionarioActualizado;
    });

    setJuntaConfig(configConId);
  };

  const irAlPanelJunta = () => {
    setDebeCargar(true);
    if (vista === 'junta') {
      setResetKey(prev => prev + 1);
    } else {
      setVista('junta');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Arial' }}>
      <nav style={{ backgroundColor: '#2d3436', padding: '12px 20px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', flexWrap: 'wrap' }}>
        <span style={{ color: '#fff', fontWeight: 'bold', marginRight: '10px' }}>🛠️ PLATAFORMA JJVV SAAS</span>

        <div style={{ backgroundColor: '#4b4b4b', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#00d2d3', fontSize: '12px', fontWeight: 'bold' }}>Entidad Activa:</span>
          <select
            onChange={handleCambioEntidadDemo}
            value={juntaConfig.id}
            style={{ backgroundColor: '#2d3436', color: '#fff', border: '1px solid #636e72', padding: '4px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', maxWidth: '250px' }}
          >
            {Object.values(juntas).map((junta) => (
              <option key={junta.id} value={junta.id}>
                {junta.id === 'nuevaJunta'
                  ? '＋ Registrar Nueva Junta de Vecinos...'
                  : `${junta.nombreJunta || 'Sin Nombre'} (Arancel $${junta.valorCertificado || 0})`}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setVista('vecino')}
          style={{ padding: '8px 14px', backgroundColor: vista === 'vecino' ? '#007bff' : '#636e72', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
        >
          1. Formulario Vecino
        </button>

        <button
          onClick={irAlPanelJunta}
          style={{ padding: '8px 14px', backgroundColor: vista === 'junta' ? '#28a745' : '#636e72', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
        >
          2. Panel Operador Junta ({solicitudes.filter(s => s.estado === 'Pendiente').length} Real/es)
        </button>

        <button
          onClick={() => setVista('config')}
          style={{ padding: '8px 14px', backgroundColor: vista === 'config' ? '#3498db' : '#636e72', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
        >
          ⚙️ 3. Configuración Institucional
        </button>

        {solicitudActivaToken && (
          <button
            onClick={() => setVista('token-view')}
            style={{ padding: '8px 14px', backgroundColor: vista === 'token-view' ? '#e67e22' : '#d35400', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto', fontSize: '13px' }}
          >
            🔓 Simular Enlace Correo del Vecino
          </button>
        )}
      </nav>

      <main style={{ padding: '15px' }}>
        {vista === 'vecino' && (
          <FormularioSolicitud onEnviar={agregarSolicitud} juntaConfig={juntaConfig} />
        )}

        {vista === 'junta' && (
          <PanelAdmin
            key={resetKey}
            listaSolicitudes={solicitudes}
            onActualizarEstado={actualizarEstadoSolicitud}
            onSimularEmail={simularClicEnlaceCorreo}
          />
        )}

        {vista === 'config' && (
          <ConfiguracionJunta
            configActual={juntaConfig}
            onGuardarConfig={handleGuardarConfiguracion}
          />
        )}

        {/* ✅ FIX CLAVE: token-view usa solicitudActivaToken DIRECTAMENTE,
            no busca en el array de solicitudes. Así el estado aprobado
            nunca se sobreescribe por una recarga de MongoDB. */}
        {vista === 'token-view' && solicitudActivaToken && (
          <div style={{ padding: '10px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff3cd', border: '1px solid #ffeeba', padding: '12px', borderRadius: '5px', marginBottom: '15px', fontSize: '13px', color: '#856404' }}>
              <strong>Seguridad Token Link Activa:</strong> Acceso seguro concedido al residente. El documento inferior se adaptará estructuralmente según los parámetros de <strong>{juntaConfig.nombreJunta}</strong>.
            </div>
            <DetalleRevision
              solicitud={solicitudActivaToken}
              soloLecturaVecino={true}
              onVolver={() => setVista('vecino')}
              juntaConfig={juntaConfig}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
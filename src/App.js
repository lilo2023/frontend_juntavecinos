import React, { useState } from 'react';
import FormularioSolicitud from './features/vecino/FormularioSolicitud';
import PanelAdmin from './features/junta/PanelAdmin';
import DetalleRevision from './features/junta/DetalleRevision';
import ConfiguracionJunta from './features/administracion/ConfiguracionJunta'; // Importamos el nuevo módulo SaaS

// Bases de datos pre-cargadas basadas exactamente en los documentos reales adjuntos de Danilo
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
  const [resetKey, setResetKey] = useState(0); // ✨ Estado para limpiar el componente interno
  const [vista, setVista] = useState('vecino'); // 'vecino', 'junta', 'config' o 'token-view'
  const [solicitudActivaToken, setSolicitudActivaToken] = useState(null);

  // 1. CAPA DE PERSISTENCIA LOCAL: Carga las juntas del almacenamiento del navegador o usa las predefinidas
  const [juntas, setJuntas] = useState(() => {
    const guardadas = localStorage.getItem('saas_juntas');
    return guardadas ? JSON.parse(guardadas) : entidadesPreconfiguradas;
  });

  // Estado que define cuál es la Junta/Entidad activa en la sesión del software
  const [juntaConfig, setJuntaConfig] = useState(() => {
    const guardadas = localStorage.getItem('saas_juntas');
    const pooljuntas = guardadas ? JSON.parse(guardadas) : entidadesPreconfiguradas;
    return pooljuntas.jjvv19;
  });

  const [solicitudes, setSolicitudes] = useState([
    {
      id: 'FOLIO-006888',
      nombre: 'María Elena Silva',
      rut: '15.223.441-K',
      email: 'm.silva@gmail.com',
      direccion: 'Av. José Pedro Alessandri 1036',
      calidadResidente: 'Arrendatario',
      destino: 'Trámites Municipales',
      montoPago: '1000',
      estado: 'Pendiente',
      ingreso: 'Hace 3 horas'
    }
  ]);

  const agregarSolicitud = (nuevaSolicitud) => {
    setSolicitudes([nuevaSolicitud, ...solicitudes]);
    alert(`¡Solicitud enviada! Se ha registrado el correo ${nuevaSolicitud.email} para el envío de su enlace seguro de acceso.`);
  };

  const actualizarEstadoSolicitud = (id, nuevoEstado, motivo = '') => {
    setSolicitudes(solicitudes.map(sol =>
      sol.id === id ? { ...sol, estado: nuevoEstado, motivoRechazo: motivo, fechaEmision: new Date().toLocaleDateString('es-CL') } : sol
    ));
  };

  const simularClicEnlaceCorreo = (solicitud) => {
    setSolicitudActivaToken(solicitud);
    setVista('token-view');
  };

  // Cambia dinámicamente todo el entorno de datos al seleccionar otra entidad del listado reactivo
  const handleCambioEntidadDemo = (e) => {
    const seleccionada = e.target.value;
    setJuntaConfig(juntas[seleccionada]);
  };

  // 2. FUNCIÓN MOTOR SAAS: Añade de verdad el nuevo tenant a la memoria y persiste en disco duro local
  const handleGuardarConfiguracion = (nuevaConfig) => {
    // Si es una junta totalmente nueva, le generamos un ID único en el sistema
    const esNueva = nuevaConfig.id === 'nuevaJunta';
    const idTenant = esNueva ? `junta-${Date.now()}` : nuevaConfig.id;

    const configConId = { ...nuevaConfig, id: idTenant };

    setJuntas((prevJuntas) => {
      // Si era nueva, restauramos la opción vacía "nuevaJunta" para posteriores registros
      const limpiadas = esNueva ? { ...prevJuntas, nuevaJunta: entidadesPreconfiguradas.nuevaJunta } : prevJuntas;

      const diccionarioActualizado = {
        ...limpiadas,
        [idTenant]: configConId
      };

      localStorage.setItem('saas_juntas', JSON.stringify(diccionarioActualizado));
      return diccionarioActualizado;
    });

    // Cambiamos la sesión de inmediato a la junta que se acaba de configurar o guardar
    setJuntaConfig(configConId);
  };
  const irAlPanelJunta = () => {
    if (vista === 'junta') {
      // Si ya estás ahí metido en las fotos, incrementamos la key para forzar 
      // a PanelAdmin a destruir su estado 'solicitudSeleccionada' y volver a la lista
      setResetKey(prev => prev + 1);
    } else {
      setVista('junta');
    }
  };
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Arial' }}>

      {/* Barra de Navegación del Entorno de Desarrollo (SaaS Multi-Entidad) */}
      <nav style={{ backgroundColor: '#2d3436', padding: '12px 20px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', flexWrap: 'wrap' }}>
        <span style={{ color: '#fff', fontWeight: 'bold', marginRight: '10px' }}>🛠️ PLATAFORMA JJVV SAAS</span>

        {/* Selector de Entidad Dinámico enlazado al estado persistente */}
        <div style={{ backgroundColor: '#4b4b4b', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#00d2d3', fontSize: '12px', fontWeight: 'bold' }}>Entidad Activa:</span>
          <select
            onChange={handleCambioEntidadDemo}
            value={juntaConfig.id}
            style={{ backgroundColor: '#2d3436', color: '#fff', border: '1px solid #636e72', padding: '4px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', maxWidth: '250px' }}
          >
            {/* Mapea dinámicamente todas las Juntas creadas en el LocalStorage */}
            {Object.values(juntas).map((junta) => (
              <option key={junta.id} value={junta.id}>
                {junta.id === 'nuevaJunta' ? '＋ Registrar Nueva Junta de Vecinos...' : `${junta.nombreJunta || 'Sin Nombre'} (Arancel $${junta.valorCertificado || 0})`}
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
          onClick={irAlPanelJunta} // ✨ Modificado para que use la función limpiadora
          style={{ padding: '8px 14px', backgroundColor: vista === 'junta' ? '#28a745' : '#636e72', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
        >
          2. Panel Operador Junta ({solicitudes.filter(s => s.estado === 'Pendiente').length} Pendientes)
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

      {/* Ruteador Condicional de Vistas */}
      <main style={{ padding: '15px' }}>

        {/* Vista 1: Formulario Vecino */}
        {vista === 'vecino' && (
          <FormularioSolicitud onEnviar={agregarSolicitud} juntaConfig={juntaConfig} />
        )}

        {/* Vista 2: Panel de Administración Operativa */}
        {vista === 'junta' && (
          <PanelAdmin
            key={resetKey} // ✨ Esto destruirá el estado 'solicitudSeleccionada' volviéndolo a null instantáneamente
            listaSolicitudes={solicitudes}
            onActualizarEstado={actualizarEstadoSolicitud}
            onSimularEmail={simularClicEnlaceCorreo}
          />
        )}

        {/* Vista 3: Módulo de Configuración SaaS */}
        {vista === 'config' && (
          <ConfiguracionJunta
            configActual={juntaConfig}
            onGuardarConfig={handleGuardarConfiguracion}
          />
        )}

        {/* Vista 4: Token Link del Vecino */}
        {vista === 'token-view' && solicitudActivaToken && (
          <div style={{ padding: '10px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff3cd', border: '1px solid #ffeeba', padding: '12px', borderRadius: '5px', marginBottom: '15px', fontSize: '13px', color: '#856404' }}>
              <strong>Seguridad Token Link Activa:</strong> Acceso seguro concedido al residente. El documento inferior se adaptará estructuralmente según los parámetros de <strong>{juntaConfig.nombreJunta}</strong>.
            </div>
            <DetalleRevision
              solicitud={solicitudes.find(s => s.id === solicitudActivaToken.id)}
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
import React, { useState, useEffect } from 'react';
import FormularioSolicitud from './features/vecino/FormularioSolicitud';
import PanelAdmin from './features/junta/PanelAdmin';
import DetalleRevision from './features/junta/DetalleRevision';
import ConfiguracionJunta from './features/administracion/ConfiguracionJunta';
import LandingPage from './features/autenticacion/LandingPage';
import LoginRegister from './features/autenticacion/LoginRegister';
import MisSolicitudes from './features/vecino/MisSolicitudes';
import IdentificadorJunta from './features/vecino/IdentificadorJunta';

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

const getApiUrl = () => {
  return window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api/residentes'
    : 'https://backend-junta-vecinos.onrender.com/api/residentes';
};

function App() {
  const [resetKey, setResetKey] = useState(0);
  const [authRole, setAuthRole] = useState(null);
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [vista, setVista] = useState(() => {
    const saved = localStorage.getItem('user_session');
    if (!saved) return 'landing';
    const user = JSON.parse(saved);
    if (user.role === 'vecino') return 'vecino';
    // Para junta: verificar si ya tiene config completa
    const guardadas = localStorage.getItem('saas_juntas');
    const guardadasParsed = guardadas ? JSON.parse(guardadas) : {};
    const poolCompleto = { ...entidadesPreconfiguradas, ...guardadasParsed };
    const configJunta = poolCompleto[user.idJunta];
    const esNueva = !configJunta || !configJunta.rutJunta;
    return esNueva ? 'config' : 'junta';
  });
  const [solicitudActivaToken, setSolicitudActivaToken] = useState(null);
  const [juntaConfirmada, setJuntaConfirmada] = useState(false);
  const [solicitudAEditar, setSolicitudAEditar] = useState(null);

  const [juntas, setJuntas] = useState(() => {
    const guardadas = localStorage.getItem('saas_juntas');
    const guardadasParsed = guardadas ? JSON.parse(guardadas) : {};
    // Siempre fusionar: las preconfiguradas son la base, localStorage las complementa/sobreescribe
    return { ...entidadesPreconfiguradas, ...guardadasParsed };
  });

  const [juntaConfig, setJuntaConfig] = useState(() => {
    const guardadas = localStorage.getItem('saas_juntas');
    const guardadasParsed = guardadas ? JSON.parse(guardadas) : {};
    const pooljuntas = { ...entidadesPreconfiguradas, ...guardadasParsed };
    return pooljuntas.jjvv19;
  });

  const [solicitudes, setSolicitudes] = useState([]);
  // Iniciar en true si hay sesión de junta activa para disparar el fetch al cargar
  const [debeCargar, setDebeCargar] = useState(() => {
    const saved = localStorage.getItem('user_session');
    if (!saved) return false;
    const user = JSON.parse(saved);
    return user.role === 'junta';
  });

  // Sincroniza juntas y carga la configuración de la junta activa al iniciar sesión
  useEffect(() => {
    const guardadas = localStorage.getItem('saas_juntas');
    const guardadasParsed = guardadas ? JSON.parse(guardadas) : {};
    // Fusionar siempre para no perder las preconfiguradas
    const pooljuntas = { ...entidadesPreconfiguradas, ...guardadasParsed };
    setJuntas(pooljuntas);

    if (session && session.role === 'junta') {
      const idActive = session.idJunta || 'jjvv19';
      const configActiva = pooljuntas[idActive];
      if (configActiva) {
        setJuntaConfig(configActiva);
      }
    }
  }, [session]);

  useEffect(() => {
    if (!debeCargar) return;

    const cargarSolicitudesDesdeBD = async () => {
      try {
        const respuesta = await fetch(getApiUrl());
        const datos = await respuesta.json();

        const solicitudesMapeadas = (Array.isArray(datos) ? datos : datos.data || []).map(sol => ({
          id: sol._id,
          idJunta: sol.idJunta || 'jjvv19',
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
          motivoRechazo: sol.motivoRechazo || '',
          ingreso: sol.createdAt 
            ? `${new Date(sol.createdAt).toLocaleDateString('es-CL')} ${new Date(sol.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}` 
            : 'Reciente',
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
    setSolicitudAEditar(null);
    setDebeCargar(true);
    setVista('mis-solicitudes');
  };

  // ✅ FIX PROBLEMA 2 y 3: Llama al backend con PATCH y actualiza
  // solicitudActivaToken con el objeto ya aprobado ANTES de cambiar vista,
  // así token-view siempre tiene el estado correcto sin depender del array.
  const actualizarEstadoSolicitud = async (id, nuevoEstado, motivo = '') => {
    const fechaEmision = new Date().toLocaleDateString('es-CL');

    // FIX PROBLEMA 3: Persistir en MongoDB
    try {
      await fetch(`${getApiUrl()}/${id}`, {
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

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    setSession(null);
    setJuntaConfirmada(false);
    setVista('landing');
  };

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
        {vista === 'landing' && (
          <LandingPage onSelectRole={(role) => { setAuthRole(role); setVista('login'); }} />
        )}
        {vista === 'login' && (
          <LoginRegister 
            role={authRole} 
            onBack={() => setVista('landing')} 
            onLoginSuccess={(user) => {
              localStorage.setItem('user_session', JSON.stringify(user));
              setSession(user);
              setJuntaConfirmada(false);
              if (user.role === 'vecino') {
                setVista('vecino');
              } else {
                // Fusionar preconfiguradas + localStorage para no perder jjvv19
                const guardadas = localStorage.getItem('saas_juntas');
                const guardadasParsed = guardadas ? JSON.parse(guardadas) : {};
                const poolCompleto = { ...entidadesPreconfiguradas, ...guardadasParsed };
                const configJunta = poolCompleto[user.idJunta];
                const esNueva = !configJunta || !configJunta.rutJunta;
                if (esNueva) {
                  setVista('config');
                } else {
                  setVista('junta');
                  setDebeCargar(true);
                }
              }
            }} 
          />
        )}
      </div>
    );
  }

  // Filtrar solicitudes por rol y por junta activa
  // Las solicitudes sin idJunta (legacy) se asignan por defecto a jjvv19
  const solicitudesFiltradas = session.role === 'vecino'
    ? solicitudes.filter(s => s.rut === session.rut)
    : solicitudes.filter(s => (s.idJunta || 'jjvv19') === (session.idJunta || 'jjvv19'));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
      <nav style={{ 
        backgroundColor: '#0f172a', 
        padding: '14px 24px', 
        display: 'flex', 
        gap: '16px', 
        alignItems: 'center', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
        flexWrap: 'wrap',
        fontFamily: "'Outfit', sans-serif" 
      }}>
        <span 
          style={{ color: '#fff', fontWeight: '800', marginRight: '16px', fontSize: '18px', cursor: 'pointer' }}
          onClick={() => {
            if (session.role === 'vecino') setVista('vecino');
            else irAlPanelJunta();
          }}
        >
          🏘️ JJVV SAAS
        </span>

        {session.role === 'junta' && (
          <div style={{ backgroundColor: '#1e293b', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #334155' }}>
            <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 'bold' }}>Entidad Activa:</span>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {juntaConfig?.nombreJunta || 'Sin nombre'}
            </span>
          </div>
        )}

        {session.role === 'vecino' && (
          <>
            <button
              onClick={() => setVista('vecino')}
              style={{ 
                padding: '10px 18px', 
                backgroundColor: vista === 'vecino' ? '#2563eb' : 'transparent', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              📝 Solicitar Certificado
            </button>
            <button
              onClick={() => { setDebeCargar(true); setVista('mis-solicitudes'); }}
              style={{ 
                padding: '10px 18px', 
                backgroundColor: vista === 'mis-solicitudes' ? '#2563eb' : 'transparent', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              📋 Mis Solicitudes ({solicitudesFiltradas.length})
            </button>
          </>
        )}

        {session.role === 'junta' && (
          <>
            <button
              onClick={irAlPanelJunta}
              style={{ 
                padding: '10px 18px', 
                backgroundColor: vista === 'junta' ? '#10b981' : 'transparent', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              📥 Bandeja de Entrada ({solicitudesFiltradas.filter(s => s.estado === 'Pendiente').length} Pendientes)
            </button>
            <button
              onClick={() => setVista('config')}
              style={{ 
                padding: '10px 18px', 
                backgroundColor: vista === 'config' ? '#0ea5e9' : 'transparent', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              🏛️ Datos de mi Junta
            </button>
          </>
        )}



        {/* Info de usuario y Cierre de Sesión */}
        <div style={{ 
          marginLeft: solicitudActivaToken ? '12px' : 'auto', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '14px' 
        }}>
          <span style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>
            👤 {session.nombre}
          </span>
          <button
            onClick={handleLogout}
            style={{ 
              padding: '8px 14px', 
              backgroundColor: '#334155', 
              color: '#f8fafc', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: '600', 
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main style={{ padding: '24px 15px' }}>
        {vista === 'vecino' && (
          !juntaConfirmada ? (
            <IdentificadorJunta 
              onConfirmarJunta={(jConfig) => {
                setJuntaConfig(jConfig);
                setJuntaConfirmada(true);
              }} 
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                onClick={() => { setSolicitudAEditar(null); setJuntaConfirmada(false); }}
                style={{
                  alignSelf: 'flex-start',
                  maxWidth: '600px',
                  width: '100%',
                  margin: '0 auto 15px auto',
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← Volver a buscar / cambiar Junta de Vecinos
              </button>
              <FormularioSolicitud 
                onEnviar={agregarSolicitud} 
                juntaConfig={juntaConfig} 
                userSession={session} 
                solicitudAEditar={solicitudAEditar}
              />
            </div>
          )
        )}

        {vista === 'mis-solicitudes' && (
          <MisSolicitudes 
            solicitudes={solicitudesFiltradas} 
            onVerDetalle={(sol) => { setSolicitudActivaToken(sol); setVista('token-view'); }} 
            onNuevaSolicitud={() => { setSolicitudAEditar(null); setVista('vecino'); }} 
            onEditarSolicitud={(sol) => {
              setSolicitudAEditar(sol);
              setVista('vecino');
              setJuntaConfirmada(true); // Saltarse la selección y mostrar directamente el formulario
            }}
          />
        )}

        {vista === 'junta' && (
          <PanelAdmin
            key={resetKey}
            listaSolicitudes={solicitudesFiltradas}
            onActualizarEstado={actualizarEstadoSolicitud}
            onSimularEmail={simularClicEnlaceCorreo}
            juntas={juntas}
          />
        )}

        {vista === 'config' && (
          <ConfiguracionJunta
            configActual={juntaConfig}
            onGuardarConfig={handleGuardarConfiguracion}
            onConfigCompleta={() => { setVista('junta'); setDebeCargar(true); }}
          />
        )}

        {vista === 'token-view' && solicitudActivaToken && (
          <div style={{ padding: '10px' }}>
            <DetalleRevision
              solicitud={solicitudActivaToken}
              soloLecturaVecino={true}
              onVolver={() => {
                if (session.role === 'vecino') setVista('mis-solicitudes');
                else setVista('junta');
              }}
              juntaConfig={juntas[solicitudActivaToken.idJunta || 'jjvv19']}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
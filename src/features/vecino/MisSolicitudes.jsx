import React, { useState } from 'react';

export default function MisSolicitudes({ solicitudes, cargando, onVerDetalle, onNuevaSolicitud, onEditarSolicitud, userSession, onCerrarSesion }) {
    const [showModalSupresion, setShowModalSupresion] = useState(false);
    const [textoConfirmacion, setTextoConfirmacion] = useState('');
    const [cargandoSupresion, setCargandoSupresion] = useState(false);
    const [errorSupresion, setErrorSupresion] = useState('');

    const handleEjecutarSupresion = async () => {
        if (textoConfirmacion.trim().toUpperCase() !== 'ELIMINAR') return;
        setCargandoSupresion(true);
        setErrorSupresion('');

        const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const urlApi = isLocalHost
            ? 'http://localhost:5000/api/vecinos/eliminar-cuenta'
            : 'https://backend-junta-vecinos.onrender.com/api/vecinos/eliminar-cuenta';

        try {
            const resp = await fetch(urlApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: userSession?.id,
                    rut: userSession?.rut,
                    correo: userSession?.email
                })
            });

            const data = await resp.json();
            setCargandoSupresion(false);

            if (data.ok) {
                alert('¡Tu cuenta y datos personales han sido eliminados de acuerdo a la Ley N° 21.719!');
                if (typeof onCerrarSesion === 'function') {
                    onCerrarSesion();
                }
            } else {
                setErrorSupresion(data.mensaje || 'No se pudo eliminar la cuenta. Inténtalo de nuevo.');
            }
        } catch (err) {
            setCargandoSupresion(false);
            console.error('Error al suprimir cuenta:', err);
            setErrorSupresion('Error de conexión con el servidor. Inténtalo de nuevo.');
        }
    };
    return (
        <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '25px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
            border: '1px solid #e2e8f0',
            fontFamily: "'Outfit', sans-serif"
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #eff6ff',
                paddingBottom: '16px',
                marginBottom: '24px'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1e3a8a' }}>
                        Mis Solicitudes de Residencia
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                        Historial y estado de tus trámites ingresados en el sistema.
                    </p>
                </div>
                <button
                    onClick={onNuevaSolicitud}
                    style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)',
                        transition: 'background-color 0.2s'
                    }}
                >
                    ＋ Nueva Solicitud
                </button>
            </div>

            {cargando ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #eff6ff',
                    color: '#64748b'
                }}>
                    <span style={{
                        width: '32px',
                        height: '32px',
                        border: '4px solid #e2e8f0',
                        borderTop: '4px solid #2563eb',
                        borderRadius: '50%',
                        display: 'inline-block',
                        boxSizing: 'border-box',
                        animation: 'listSpin 0.8s linear infinite',
                        marginBottom: '16px'
                    }} />
                    <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0', color: '#1e3a8a' }}>
                        Cargando tus solicitudes...
                    </p>
                    <p style={{ fontSize: '13px', margin: 0, color: '#94a3b8' }}>
                        Consultando estado en tiempo real...
                    </p>
                    <style>{`
                        @keyframes listSpin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            ) : solicitudes.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '50px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px dashed #cbd5e1',
                    color: '#64748b'
                }}>
                    <span style={{ fontSize: '40px', display: 'block', marginBottom: '16px' }}>📄</span>
                    <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0', color: '#334155' }}>
                        No tienes solicitudes registradas
                    </p>
                    <p style={{ fontSize: '14px', margin: '0 0 20px 0', color: '#64748b' }}>
                        Comienza solicitando tu primer certificado de residencia.
                    </p>
                    <button
                        onClick={onNuevaSolicitud}
                        style={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Solicitar Certificado
                    </button>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '14px', fontWeight: '600' }}>
                                <th style={{ padding: '12px 16px' }}>Folio</th>
                                <th style={{ padding: '12px 16px' }}>Fecha Ingreso</th>
                                <th style={{ padding: '12px 16px' }}>Destino</th>
                                <th style={{ padding: '12px 16px' }}>Estado</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitudes.map((sol) => {
                                const isAprobada = sol.estado === 'Aprobado' || sol.estado === 'Aprobada';
                                const isRechazada = sol.estado === 'Rechazado' || sol.estado === 'Rechazada';
                                
                                return (
                                    <tr key={sol.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '15px', color: '#334155' }}>
                                        <td style={{ padding: '16px', fontWeight: '600', color: '#0f172a' }}>
                                            {sol.folioTexto}
                                        </td>
                                        <td style={{ padding: '16px', color: '#64748b' }}>
                                            {sol.ingreso}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {sol.destino}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '30px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: isAprobada ? '#15803d' : isRechazada ? '#b91c1c' : '#b45309',
                                                backgroundColor: isAprobada ? '#dcfce7' : isRechazada ? '#fee2e2' : '#fef3c7'
                                            }}>
                                                {sol.estado}
                                            </span>
                                            {sol.evidenciasCaducadas && (
                                                <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: '600', marginTop: '4px' }}>
                                                    🕒 Evidencias Caducadas
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            {isAprobada && (
                                                <button
                                                    onClick={() => onVerDetalle(sol)}
                                                    style={{
                                                        backgroundColor: '#10b981',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '6px 12px',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)'
                                                    }}
                                                >
                                                    📄 Ver Certificado
                                                </button>
                                            )}
                                            {isRechazada && (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => onVerDetalle(sol)}
                                                        style={{
                                                            backgroundColor: '#64748b',
                                                            color: '#ffffff',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '6px 12px',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        ❌ Ver Motivo
                                                    </button>
                                                    <button
                                                        onClick={() => onEditarSolicitud(sol)}
                                                        style={{
                                                            backgroundColor: '#d97706',
                                                            color: '#ffffff',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '6px 12px',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 2px 6px rgba(217, 119, 6, 0.2)'
                                                        }}
                                                    >
                                                        ✏️ Corregir
                                                    </button>
                                                </div>
                                            )}
                                            {!isAprobada && !isRechazada && (
                                                <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                                                    En revisión por la Junta
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Sección y Botón para Derechos ARCOP (Ley 21.719 - Supresión de Datos) */}
            <div style={{
                marginTop: '32px',
                paddingTop: '20px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#991b1b' }}>
                        🛡️ Derechos ARCOP — Ley N° 21.719
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Puedes solicitar la eliminación total de tu cuenta, perfil y evidencias adjuntas en cualquier momento.
                    </p>
                </div>
                <button
                    onClick={() => setShowModalSupresion(true)}
                    style={{
                        backgroundColor: '#fff1f2',
                        color: '#991b1b',
                        border: '1px solid #fecdd3',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    🗑️ Eliminar Mi Cuenta y Datos
                </button>
            </div>

            {/* Modal de Confirmación de Supresión de Datos */}
            {showModalSupresion && (
                <div 
                    className="ds-modal-overlay" 
                    onClick={() => setShowModalSupresion(false)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '16px'
                    }}
                >
                    <div 
                        className="ds-modal-content" 
                        onClick={(e) => e.stopPropagation()} 
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            maxWidth: '540px',
                            width: '100%',
                            padding: '24px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #fee2e2'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid #fee2e2', paddingBottom: '12px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#991b1b' }}>
                                    ⚠️ Confirmar Supresión de Datos Personales
                                </h3>
                                <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>Ley N° 21.719 (Derecho de Supresión / Olvido)</span>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setShowModalSupresion(false)}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}
                            >
                                &times;
                            </button>
                        </div>

                        <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
                            <p style={{ fontWeight: '600', color: '#1e293b', marginTop: 0 }}>
                                Esta acción es irreversible y ejecutará de forma inmediata lo siguiente:
                            </p>
                            <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                                <li><strong>Eliminación de tu cuenta:</strong> Tu contraseña, RUT, correo y teléfono serán borrados permanentemente.</li>
                                <li><strong>Eliminación de evidencias en la nube:</strong> Fotos de Cédula de Identidad y Comprobantes de Domicilio serán destruidos de Cloudinary.</li>
                                <li><strong>Cierre de sesión:</strong> Tus credenciales actuales dejarán de funcionar inmediatamente.</li>
                                <li><strong>Re-registro futuro:</strong> Si vuelves a requerir un certificado de residencia, deberás registrarte como nuevo usuario.</li>
                            </ul>

                            <p style={{ marginTop: '16px', fontSize: '13px', color: '#64748b' }}>
                                Para confirmar la eliminación, por favor escribe la palabra <strong style={{ color: '#991b1b' }}>ELIMINAR</strong> en el siguiente campo:
                            </p>

                            <input 
                                type="text" 
                                value={textoConfirmacion} 
                                onChange={(e) => setTextoConfirmacion(e.target.value)}
                                placeholder="Escribe ELIMINAR aquí"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '14px',
                                    marginTop: '6px',
                                    boxSizing: 'border-box'
                                }}
                            />

                            {errorSupresion && (
                                <div style={{ marginTop: '10px', color: '#dc2626', fontSize: '13px', fontWeight: '500' }}>
                                    ❌ {errorSupresion}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button 
                                type="button" 
                                onClick={() => { setShowModalSupresion(false); setTextoConfirmacion(''); setErrorSupresion(''); }}
                                disabled={cargandoSupresion}
                                style={{
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 16px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={handleEjecutarSupresion}
                                disabled={textoConfirmacion.trim().toUpperCase() !== 'ELIMINAR' || cargandoSupresion}
                                style={{
                                    backgroundColor: textoConfirmacion.trim().toUpperCase() === 'ELIMINAR' ? '#dc2626' : '#fca5a5',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 18px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: textoConfirmacion.trim().toUpperCase() === 'ELIMINAR' ? 'pointer' : 'not-allowed',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                {cargandoSupresion ? 'Eliminando...' : 'Sí, Eliminar Definitivamente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

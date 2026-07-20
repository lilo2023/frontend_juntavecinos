import React from 'react';

export default function MisSolicitudes({ solicitudes, onVerDetalle, onNuevaSolicitud, onEditarSolicitud }) {
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

            {solicitudes.length === 0 ? (
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
        </div>
    );
}

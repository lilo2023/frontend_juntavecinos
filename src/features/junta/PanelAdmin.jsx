import React, { useState } from 'react';
import DetalleRevision from './DetalleRevision';

export default function PanelAdmin({ listaSolicitudes, onActualizarEstado, onSimularEmail, juntas }) {
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

    if (solicitudSeleccionada) {
        const idBuscado = solicitudSeleccionada._id || solicitudSeleccionada.id;
        const solicitudActualizada = listaSolicitudes.find(s => (s._id === idBuscado || s.id === idBuscado));
        return (
            <DetalleRevision
                solicitud={solicitudActualizada || solicitudSeleccionada}
                onActualizarEstado={onActualizarEstado}
                onVolver={() => setSolicitudSeleccionada(null)}
                juntaConfig={juntas ? juntas[(solicitudActualizada || solicitudSeleccionada).idJunta || 'jjvv19'] : null}
            />
        );
    }

    const pendientes  = listaSolicitudes.filter(s => s.estado === 'Pendiente').length;
    const aprobadas   = listaSolicitudes.filter(s => s.estado === 'Aprobado').length;
    const rechazadas  = listaSolicitudes.filter(s => s.estado === 'Rechazado').length;

    const thStyle = {
        padding: '12px 14px',
        textAlign: 'left',
        fontWeight: '600',
        fontSize: '13px',
        letterSpacing: '0.02em'
    };

    const tdStyle = {
        padding: '12px 14px',
        fontSize: '13px',
        verticalAlign: 'middle'
    };

    return (
        <div style={{ padding: '24px', fontFamily: "'Outfit', 'Segoe UI', sans-serif" }}>

            {/* Título y resumen */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
                        📥 Bandeja de Entrada — Control de Casos
                    </h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                        Revisa y gestiona las solicitudes de certificados de tu Junta de Vecinos.
                    </p>
                </div>

                {/* Contadores */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Total',      value: listaSolicitudes.length, color: '#1e40af', bg: '#eff6ff' },
                        { label: 'Pendientes', value: pendientes,              color: '#b45309', bg: '#fffbeb' },
                        { label: 'Aprobadas',  value: aprobadas,               color: '#166534', bg: '#f0fdf4' },
                        { label: 'Rechazadas', value: rechazadas,              color: '#991b1b', bg: '#fef2f2' },
                    ].map(({ label, value, color, bg }) => (
                        <div key={label} style={{
                            background: bg, border: `1px solid ${color}30`,
                            borderRadius: '8px', padding: '8px 16px', textAlign: 'center', minWidth: '72px'
                        }}>
                            <div style={{ fontSize: '20px', fontWeight: '800', color }}>{value}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabla o estado vacío */}
            {listaSolicitudes.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px dashed #e2e8f0'
                }}>
                    <div style={{ fontSize: '52px', marginBottom: '16px' }}>📭</div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '18px', fontWeight: '700' }}>
                        Sin solicitudes aún
                    </h3>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                        Cuando un vecino envíe una solicitud de certificado de residencia,<br />
                        aparecerá aquí para que puedas revisarla y aprobarla o rechazarla.
                    </p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>
                                <th style={thStyle}>Folio</th>
                                <th style={thStyle}>Fecha y Hora</th>
                                <th style={thStyle}>Vecino</th>
                                <th style={thStyle}>Correo Electrónico</th>
                                <th style={thStyle}>Estado</th>
                                <th style={thStyle}>Monto Pagado</th>
                                <th style={thStyle}>Acción del Operador</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaSolicitudes.map((sol) => {
                                const keyUnica = sol._id || sol.id || `sol-${sol.correlativoSolicitud}`;
                                const esPendiente = sol.estado === 'Pendiente';
                                const esAprobado  = sol.estado === 'Aprobado';

                                return (
                                    <tr
                                        key={keyUnica}
                                        style={{
                                            borderBottom: '1px solid #f1f5f9',
                                            backgroundColor: esAprobado ? '#f0fdf4' : esPendiente ? '#fffbeb' : sol.estado === 'Rechazado' ? '#fef2f2' : '#fff',
                                            transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.97)'}
                                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                                    >
                                        <td style={{ ...tdStyle, fontWeight: '700', color: '#1e40af', fontFamily: 'monospace' }}>
                                            {sol.folioTexto || `FOLIO-${sol.correlativoSolicitud}`}
                                        </td>

                                        <td style={{ ...tdStyle, color: '#475569', whiteSpace: 'nowrap' }}>
                                            {sol.ingreso || '—'}
                                        </td>

                                        <td style={{ ...tdStyle, fontWeight: '600', color: '#0f172a' }}>
                                            {sol.nombre}
                                        </td>

                                        <td style={{ ...tdStyle, color: '#64748b' }}>
                                            {sol.correo || sol.email}
                                        </td>

                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                                backgroundColor: esAprobado ? '#dcfce7' : esPendiente ? '#fef3c7' : '#fee2e2',
                                                color: esAprobado ? '#166534' : esPendiente ? '#92400e' : '#991b1b'
                                            }}>
                                                {sol.estado}
                                            </span>
                                        </td>

                                        <td style={{ ...tdStyle, fontWeight: '700', color: '#16a34a' }}>
                                            ${(sol.montoPago || 1000).toLocaleString('es-CL')}
                                        </td>

                                        <td style={{ ...tdStyle, display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => setSolicitudSeleccionada(sol)}
                                                style={{
                                                    background: esPendiente ? '#2563eb' : sol.estado === 'Rechazado' ? '#dc3545' : '#64748b',
                                                    color: 'white', padding: '6px 14px', border: 'none',
                                                    cursor: 'pointer', borderRadius: '6px', fontWeight: '600',
                                                    fontSize: '12px', whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {esPendiente ? '🔍 Evaluar Evidencias' : sol.estado === 'Rechazado' ? '❌ Ver Rechazo' : '📄 Ver Certificado'}
                                            </button>
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
import React, { useState } from 'react';
import DetalleRevision from './DetalleRevision';

export default function PanelAdmin({ listaSolicitudes, onActualizarEstado, onSimularEmail }) {
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

    if (solicitudSeleccionada) {
        const solicitudActualizada = listaSolicitudes.find(s => s.id === solicitudSeleccionada.id);
        return (
            <DetalleRevision
                solicitud={solicitudActualizada}
                onActualizarEstado={onActualizarEstado}
                onVolver={() => setSolicitudSeleccionada(null)}
            />
        );
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h2>Bandeja de Entrada Operador: Control de Casos</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <thead>
                    <tr style={{ backgroundColor: '#2d3436', color: 'white', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Folio</th>
                        <th style={{ padding: '12px' }}>Vecino</th>
                        <th style={{ padding: '12px' }}>Correo Electrónico</th>
                        <th style={{ padding: '12px' }}>Estado</th>
                        <th style={{ padding: '12px' }}>Monto</th>
                        <th style={{ padding: '12px' }}>Acción del Operador / Simulación</th>
                    </tr>
                </thead>
                <tbody>
                    {listaSolicitudes.map((sol) => (
                        <tr key={sol.id} style={{ borderBottom: '1px solid #ddd', backgroundColor: sol.estado === 'Aprobado' ? '#e8f5e9' : sol.estado === 'Rechazado' ? '#ffebee' : '#fff' }}>
                            <td style={{ padding: '12px' }}>{sol.id}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{sol.nombre}</td>
                            <td style={{ padding: '12px', color: '#555' }}>{sol.email}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{
                                    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                                    backgroundColor: sol.estado === 'Aprobado' ? '#2e7d32' : sol.estado === 'Rechazado' ? '#c62828' : '#ef6c00', color: 'white'
                                }}>{sol.estado}</span>
                            </td>
                            <td style={{ padding: '12px' }}>${sol.montoPago}</td>
                            <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                                {sol.estado === 'Pendiente' ? (
                                    <button onClick={() => setSolicitudSeleccionada(sol)} style={{ background: '#007bff', color: 'white', padding: '6px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                        Evaluar Evidencias
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
                                        <span style={{ fontSize: '12px', color: '#333', fontStyle: 'italic' }}>Procesado por la Junta.</span>
                                        <button
                                            onClick={() => onSimularEmail(sol)}
                                            style={{ background: '#00cfd5', color: '#111', padding: '4px 8px', border: '1px solid #009da0', cursor: 'pointer', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}
                                        >
                                            📧 Simular Email enviado a: {sol.email}
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
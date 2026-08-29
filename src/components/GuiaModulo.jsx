import React, { useState } from 'react';

export default function GuiaModulo({ tipo = 'vecino' }) {
    const [desplegado, setDesplegado] = useState(false);

    const esVecino = tipo === 'vecino';

    return (
        <div style={{
            backgroundColor: desplegado ? '#f0f9ff' : '#f8fafc',
            border: `1px solid ${desplegado ? '#bae6fd' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '20px',
            transition: 'all 0.3s ease',
            fontFamily: "'Outfit', sans-serif",
            boxShadow: desplegado ? '0 4px 14px rgba(2, 132, 199, 0.08)' : 'none'
        }}>
            {/* Cabecera Plegada del Banner */}
            <div 
                onClick={() => setDesplegado(!desplegado)}
                style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>💡</span>
                    <div>
                        <strong style={{ fontSize: '14px', color: desplegado ? '#0369a1' : '#334155', fontWeight: '700' }}>
                            {esVecino 
                                ? '¿Primera vez solicitando un certificado? Haz clic para ver la guía rápida del trámite'
                                : '¿Cómo gestionar las solicitudes? Haz clic para ver la guía rápida para operadores'}
                        </strong>
                        {!desplegado && (
                            <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                Guía paso a paso integrada en la plataforma web
                            </span>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    style={{
                        background: desplegado ? '#0284c7' : '#e2e8f0',
                        color: desplegado ? '#ffffff' : '#475569',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '5px 14px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {desplegado ? '▲ Ocultar Guía' : '▼ Ver Guía Rápida'}
                </button>
            </div>

            {/* Contenido Desplegable */}
            {desplegado && (
                <div style={{
                    marginTop: '14px',
                    paddingTop: '14px',
                    borderTop: '1px solid #e0f2fe',
                    animation: 'fadeIn 0.3s ease-in-out'
                }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0369a1', fontWeight: '700' }}>
                        {esVecino ? '📖 Manual del Vecino — 3 Pasos Simples:' : '📖 Manual del Operador de Junta — 4 Etapas del Proceso:'}
                    </h4>

                    {esVecino ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                                <div style={{ fontWeight: '700', fontSize: '13px', color: '#0284c7', marginBottom: '4px' }}>
                                    1️⃣ Identifica tu Junta de Vecinos
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                                    Si no la conoces, búscala por tu dirección o ubicación en el mapa. Si la conoces, selecciónala de la lista desplegable.
                                </div>
                            </div>

                            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                                <div style={{ fontWeight: '700', fontSize: '13px', color: '#0284c7', marginBottom: '4px' }}>
                                    2️⃣ Formulario y Evidencias
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                                    Ingresa tu RUT, datos de residencia y sube fotos de tu Cédula de Identidad y Comprobante de Domicilio.
                                </div>
                            </div>

                            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                                <div style={{ fontWeight: '700', fontSize: '13px', color: '#0284c7', marginBottom: '4px' }}>
                                    3️⃣ Descarga tu Certificado
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                                    Una vez validado por la Junta de Vecinos, descarga tu certificado PDF firmado digitalmente con folio único.
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                                <div style={{ fontWeight: '700', fontSize: '13px', color: '#0284c7', marginBottom: '4px' }}>
                                    🔍 1. Evaluar Evidencias
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                                    Haz clic en `Evaluar Evidencias` para inspeccionar la cédula y comprobante de domicilio.
                                </div>
                            </div>

                            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                                <div style={{ fontWeight: '700', fontSize: '13px', color: '#0284c7', marginBottom: '4px' }}>
                                    🗺️ 2. Verificación Territorial
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                                    Revisa el visor geográfico para verificar si la dirección pertenece a la jurisdicción de la Junta.
                                </div>
                            </div>

                            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                                <div style={{ fontWeight: '700', fontSize: '13px', color: '#0284c7', marginBottom: '4px' }}>
                                    ✅ 3. Emisión Autogestionada
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                                    Al hacer clic en `Aprobar`, el backend genera y almacena automáticamente el documento PDF oficial.
                                </div>
                            </div>

                            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                                <div style={{ fontWeight: '700', fontSize: '13px', color: '#0284c7', marginBottom: '4px' }}>
                                    🛡️ 4. Protección Ley 21.719
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                                    Las solicitudes suprimidas por vecinos muestran `Motivo Supresión` con datos totalmente anonimizados.
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '12px', fontSize: '11px', color: '#0369a1', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🛡️</span>
                        <span>
                            {esVecino 
                                ? 'Tus archivos están protegidos por la Ley N° 21.719 y serán depurados automáticamente tras 90 días de conservación legal.'
                                : 'El sistema ejecuta purga de evidencias a los 90 días e historia clínica de supresión de datos conforme a la Ley N° 21.719.'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

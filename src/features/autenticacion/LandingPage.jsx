import React from 'react';

export default function LandingPage({ onSelectRole }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '85vh',
            padding: '20px',
            fontFamily: "'Outfit', sans-serif",
            color: '#1e293b'
        }}>
            {/* Header del Sistema */}
            <div style={{
                textAlign: 'center',
                marginBottom: '45px',
                maxWidth: '800px'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    padding: '8px 16px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 8px rgba(14, 165, 233, 0.1)'
                }}>
                    🏘️ Plataforma Oficial JJVV SaaS
                </div>
                <h1 style={{
                    fontSize: '38px',
                    fontWeight: '800',
                    lineHeight: '1.25',
                    color: '#0f172a',
                    marginBottom: '16px',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px'
                }}>
                    Solución web para solicitar y generar certificados de residencia
                </h1>
                <p style={{
                    fontSize: '18px',
                    color: '#64748b',
                    lineHeight: '1.6',
                    fontWeight: '400',
                    maxWidth: '650px',
                    margin: '0 auto'
                }}>
                    Simplificamos y digitalizamos el trámite de residencia ante tu Junta de Vecinos. Rápido, seguro y 100% en línea.
                </p>
            </div>

            {/* Selector de Perfiles (Botones Grandes) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '28px',
                width: '100%',
                maxWidth: '880px',
                marginTop: '10px'
            }}>
                {/* CARD VECINO */}
                <div 
                    onClick={() => onSelectRole('vecino')}
                    style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '20px',
                        padding: '35px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)';
                        e.currentTarget.style.borderColor = '#93c5fd';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.03)';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                >
                    <div style={{
                        width: '70px',
                        height: '70px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        marginBottom: '24px',
                        boxShadow: 'inset 0 2px 4px rgba(59, 130, 246, 0.06)'
                    }}>
                        👤
                    </div>
                    <div>
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: '#1e3a8a',
                            marginBottom: '12px'
                        }}>
                            Portal del Vecino
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: '#64748b',
                            lineHeight: '1.5',
                            marginBottom: '28px',
                            padding: '0 10px'
                        }}>
                            Solicita tu certificado, adjunta tus comprobantes de domicilio e identidad, realiza el pago y haz el seguimiento de tu trámite en tiempo real.
                        </p>
                    </div>
                    <button style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '14px 28px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'background-color 0.2s',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                    }}>
                        SOY VECINO
                    </button>
                </div>

                {/* CARD JUNTA */}
                <div 
                    onClick={() => onSelectRole('junta')}
                    style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '20px',
                        padding: '35px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)';
                        e.currentTarget.style.borderColor = '#6ee7b7';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.03)';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                >
                    <div style={{
                        width: '70px',
                        height: '70px',
                        backgroundColor: '#ecfdf5',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        marginBottom: '24px',
                        boxShadow: 'inset 0 2px 4px rgba(16, 185, 129, 0.06)'
                    }}>
                        🏢
                    </div>
                    <div>
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: '#065f46',
                            marginBottom: '12px'
                        }}>
                            Portal Junta de Vecinos
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: '#64748b',
                            lineHeight: '1.5',
                            marginBottom: '28px',
                            padding: '0 10px'
                        }}>
                            Bandeja de administración para directivos. Revisa las solicitudes ingresadas, evalúa evidencias y emite o rechaza certificados formalmente.
                        </p>
                    </div>
                    <button style={{
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '14px 28px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'background-color 0.2s',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                    }}>
                        SOY JUNTA DE VECINOS
                    </button>
                </div>
            </div>

            {/* Footer Informativo */}
            <div style={{
                marginTop: '60px',
                fontSize: '13px',
                color: '#94a3b8',
                textAlign: 'center'
            }}>
                © 2026 Plataforma JJVV SaaS. Todos los derechos reservados. Ajustado a Ley 19.418 de Chile.
            </div>
        </div>
    );
}

import React from 'react';

/**
 * Componente Botón Estandarizado del Design System
 * @param {string} variant - 'primary' | 'success' | 'danger'
 * @param {boolean} loading - Estado de carga con spinner
 */
export default function Boton({ 
    children, 
    onClick, 
    type = 'button', 
    variant = 'primary', 
    disabled = false, 
    loading = false,
    style = {} 
}) {
    const classMap = {
        primary: 'ds-btn-primary',
        success: 'ds-btn-success',
        danger: 'ds-btn-danger'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={classMap[variant] || 'ds-btn-primary'}
            style={style}
        >
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTopColor: '#ffffff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        boxSizing: 'border-box'
                    }} />
                    <span>Cargando...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
}

import React from 'react';

/**
 * Componente Tarjeta Contenedora Estandarizada del Design System
 */
export default function Tarjeta({ children, style = {}, className = '' }) {
    return (
        <div className={`ds-card ${className}`} style={style}>
            {children}
        </div>
    );
}

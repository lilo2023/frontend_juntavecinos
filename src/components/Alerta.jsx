import React from 'react';

/**
 * Componente Alerta Informativa del Design System
 */
export default function Alerta({ children, style = {}, type = 'info' }) {
    return (
        <div className="ds-alert-info" style={style}>
            {children}
        </div>
    );
}

import React, { useState, useEffect } from 'react';

function ConfiguracionJunta({ configActual, onGuardarConfig }) {
    const [formConfig, setFormConfig] = useState({ ...configActual });

    useEffect(() => {
        setFormConfig({ ...configActual });
    }, [configActual]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormConfig((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onGuardarConfig({
            ...formConfig,
            id: formConfig.id === 'nuevaJunta' ? `junta-${Date.now()}` : formConfig.id
        });
        alert('¡Configuración guardada exitosamente! Los cambios se han aplicado al portal del residente.');
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
        fontSize: '14px',
        backgroundColor: '#fff',
        transition: 'border-color 0.2s'
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontFamily: 'Arial, sans-serif' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #3498db', paddingBottom: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '24px' }}>{formConfig.id === 'nuevaJunta' ? '✨' : '⚙️'}</span>
                <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '22px' }}>
                    {formConfig.id === 'nuevaJunta' ? 'Registrar Nueva Entidad Vecinal (Multi-Tenant)' : 'Panel de Control Institucional (SaaS Multi-Junta)'}
                </h2>
            </div>

            <p style={{ color: '#7f8c8d', fontSize: '14px', marginTop: '-10px', marginBottom: '20px' }}>
                Configure la identidad visual, correos oficiales y parámetros bancarios de recaudación para el despliegue automático del portal.
            </p>

            <form onSubmit={handleSubmit}>

                {/* SECCIÓN 1: IDENTIDAD */}
                <h3 style={{ color: '#2980b9', borderBottom: '1px solid #ddd', paddingBottom: '6px', fontSize: '16px' }}>1. Identidad Institucional y Registro</h3>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>
                        Nombre Oficial de la Junta de Vecinos / Unión Comunal:
                    </label>
                    <input
                        type="text"
                        name="nombreJunta"
                        value={formConfig.nombreJunta}
                        onChange={handleChange}
                        placeholder="Ej: Junta de Vecinos N° 42 Barrio Alborada"
                        style={inputStyle}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>RUT Institucional:</label>
                        <input
                            type="text"
                            name="rutJunta"
                            value={formConfig.rutJunta}
                            onChange={handleChange}
                            placeholder="Ej: 72.123.456-K"
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>Personalidad Jurídica:</label>
                        <input
                            type="text"
                            name="personalidadJuridica"
                            value={formConfig.personalidadJuridica}
                            onChange={handleChange}
                            placeholder="Ej: RNPJSFL N° 45120-X"
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>Dirección de la Sede:</label>
                        <input
                            type="text"
                            name="direccionOficina"
                            value={formConfig.direccionOficina}
                            onChange={handleChange}
                            placeholder="Ej: Av. Los Orientales 2430"
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>Comuna de Jurisdicción:</label>
                        <input
                            type="text"
                            name="comuna"
                            value={formConfig.comuna}
                            onChange={handleChange}
                            placeholder="Ej: Ñuñoa"
                            style={inputStyle}
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>Email Oficial (Notificaciones Bancarias y Consultas):</label>
                        <input
                            type="email"
                            name="emailContacto"
                            value={formConfig.emailContacto}
                            onChange={handleChange}
                            placeholder="Ej: tesoreria@barrioalborada.cl"
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>Teléfono de Contacto:</label>
                        <input
                            type="text"
                            name="telefono"
                            value={formConfig.telefono}
                            onChange={handleChange}
                            placeholder="Ej: +56 2 2455 8899"
                            style={inputStyle}
                        />
                    </div>
                </div>

                {/* SECCIÓN 2: OPERACIÓN Y RECAUDACIÓN BANCARIA */}
                <h3 style={{ color: '#2980b9', borderBottom: '1px solid #ddd', paddingBottom: '6px', fontSize: '16px', marginTop: '25px' }}>2. Parámetros Operativos y Recaudación Bancaria</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>Valor del Certificado (CLP $):</label>
                        <input
                            type="number"
                            name="valorCertificado"
                            value={formConfig.valorCertificado}
                            onChange={handleChange}
                            placeholder="Ej: 1000"
                            style={{ ...inputStyle, fontWeight: 'bold', color: formConfig.valorCertificado ? '#27ae60' : '#ccc' }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>Próximo Correlativo de Folio Digital:</label>
                        <input
                            type="text"
                            name="correlativoInicial"
                            value={formConfig.correlativoInicial}
                            onChange={handleChange}
                            placeholder="Ej: 000001"
                            style={inputStyle}
                            required
                        />
                    </div>
                </div>

                {/* RECUADRO DE DATOS BANCARIOS ESPECÍFICOS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', backgroundColor: '#fdfefe', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>Banco Recaudador:</label>
                        <input
                            type="text"
                            name="banco"
                            value={formConfig.banco || ''}
                            onChange={handleChange}
                            placeholder="Ej: Banco Estado"
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>Tipo de Cuenta:</label>
                        <select
                            name="tipoCuenta"
                            value={formConfig.tipoCuenta || 'Cuenta Corriente'}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value="Cuenta Corriente">Cuenta Corriente</option>
                            <option value="Cuenta Vista / RUT">Cuenta Vista / RUT</option>
                            <option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>Número de Cuenta:</label>
                        <input
                            type="text"
                            name="numeroCuenta"
                            value={formConfig.numeroCuenta || ''}
                            onChange={handleChange}
                            placeholder="Ej: 123456789"
                            style={inputStyle}
                            required
                        />
                    </div>
                </div>

                {/* SECCIÓN 3: TEXTOS ESTRUCTURALES DEL DOCUMENTO */}
                <h3 style={{ color: '#2980b9', borderBottom: '1px solid #ddd', paddingBottom: '6px', fontSize: '16px', marginTop: '25px' }}>3. Textos de Cabecera y Firmas (Para Renderizado de Certificado)</h3>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>Texto de Cabecera Oficial (Extremo Superior Izquierdo):</label>
                    <textarea
                        name="cabeceraTexto"
                        value={formConfig.cabeceraTexto}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Ej: JUNTA DE VECINOS EL PROGRESO&#10;UNIDAD VECINAL N° 42&#10;ÑUÑOA"
                        style={{ ...inputStyle, fontFamily: 'Courier, monospace', fontSize: '13px' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' }}>Pie de Firma Autorizada (Bajo el Timbre):</label>
                    <textarea
                        name="pieFirmaTexto"
                        value={formConfig.pieFirmaTexto}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Ej: LA DIRECTIVA&#10;Junta de Vecinos El Progreso UV 42"
                        style={{ ...inputStyle, fontFamily: 'Courier, monospace', fontSize: '13px' }}
                    />
                </div>

                <button
                    type="submit"
                    style={{ width: '100%', padding: '12px', backgroundColor: formConfig.id === 'nuevaJunta' ? '#2ecc71' : '#3498db', color: 'white', border: 'none', borderRadius: '5px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                >
                    {formConfig.id === 'nuevaJunta' ? '✨ DAR DE ALTA NUEVO TENANT SAAS' : '💾 Guardar y Aplicar Cambios del Tenant'}
                </button>
            </form>
        </div>
    );
}

export default ConfiguracionJunta;
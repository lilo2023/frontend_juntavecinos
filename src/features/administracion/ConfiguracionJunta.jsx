import React, { useState, useEffect, useRef } from 'react';

/* ── Utilidades RUT ─────────────────────────────────── */
function formatearRutInstitucional(valor) {
    // Quita todo excepto dígitos y K/k
    let limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();
    if (limpio.length === 0) return '';
    const dv = limpio.slice(-1);
    let cuerpo = limpio.slice(0, -1);
    // Agrega puntos de miles al cuerpo
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${cuerpo}-${dv}`;
}

function validarRutInstitucional(rut) {
    const limpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (limpio.length < 8) return false;
    const dv = limpio.slice(-1);
    const cuerpo = limpio.slice(0, -1);
    let suma = 0;
    let factor = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * factor;
        factor = factor === 7 ? 2 : factor + 1;
    }
    const dvEsperado = 11 - (suma % 11);
    const dvCalc = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : String(dvEsperado);
    return dv === dvCalc;
}

/* ── Componente SubidaImagen ────────────────────────── */
function SubidaImagen({ label, campo, valor, onChange, descripcion }) {
    const inputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange(campo, ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleEliminar = () => {
        onChange(campo, '');
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '13px', color: '#475569' }}>
                {label} <span style={{ color: '#94a3b8', fontWeight: '400' }}>(opcional)</span>
            </label>
            {descripcion && (
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>{descripcion}</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#f1f5f9',
                        border: '1px dashed #94a3b8',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    📎 Subir imagen
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                {valor ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                            src={valor}
                            alt={label}
                            style={{ height: '48px', maxWidth: '120px', objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px', background: '#fff' }}
                        />
                        <button
                            type="button"
                            onClick={handleEliminar}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                        >
                            ✕ Quitar
                        </button>
                    </div>
                ) : (
                    <span style={{ fontSize: '12px', color: '#cbd5e1', fontStyle: 'italic' }}>Sin imagen cargada</span>
                )}
            </div>
        </div>
    );
}

/* ── Componente Principal ───────────────────────────── */
function ConfiguracionJunta({ configActual, onGuardarConfig, onConfigCompleta }) {
    const [formConfig, setFormConfig] = useState({ ...configActual });
    const [rutError, setRutError] = useState(false);
    // mediosPago: array que puede contener 'transferencia' y/o 'webpay'
    const [mediosPago, setMediosPago] = useState(() => {
        const arr = [];
        if (configActual.banco || configActual.numeroCuenta) arr.push('transferencia');
        if (configActual.webpay) arr.push('webpay');
        return arr;
    });

    useEffect(() => {
        setFormConfig({ ...configActual });
        const arr = [];
        if (configActual.banco || configActual.numeroCuenta) arr.push('transferencia');
        if (configActual.webpay) arr.push('webpay');
        setMediosPago(arr);
    }, [configActual]);

    /* ── Handlers ── */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleRutChange = (e) => {
        const raw = e.target.value;
        const formateado = formatearRutInstitucional(raw);
        setFormConfig(prev => ({ ...prev, rutJunta: formateado }));
        const limpio = formateado.replace(/[^0-9kK]/g, '');
        if (limpio.length >= 8) {
            setRutError(!validarRutInstitucional(formateado));
        } else {
            setRutError(false);
        }
    };

    const handleImageChange = (campo, base64) => {
        setFormConfig(prev => ({ ...prev, [campo]: base64 }));
    };

    const toggleMedio = (medio) => {
        setMediosPago(prev =>
            prev.includes(medio) ? prev.filter(m => m !== medio) : [...prev, medio]
        );
    };

    /* ── Validación y Submit ── */
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar RUT si fue ingresado
        if (formConfig.rutJunta && rutError) {
            alert('⚠️ El RUT institucional ingresado no es válido. Por favor corríjalo antes de guardar.');
            return;
        }

        // Campos obligatorios
        const camposObligatorios = [
            { campo: 'nombreJunta',      label: 'Nombre de la Junta' },
            { campo: 'rutJunta',         label: 'RUT Institucional' },
            { campo: 'emailContacto',    label: 'Correo Electrónico' },
            { campo: 'direccionOficina', label: 'Dirección de la Sede' },
            { campo: 'cabeceraTexto',    label: 'Texto de Encabezado' },
            { campo: 'pieFirmaTexto',    label: 'Texto de Pie de Firma' },
        ];

        const faltantes = camposObligatorios
            .filter(c => !formConfig[c.campo] || String(formConfig[c.campo]).trim() === '')
            .map(c => c.label);

        if (faltantes.length > 0) {
            alert(`⚠️ Faltan los siguientes campos obligatorios:\n\n• ${faltantes.join('\n• ')}\n\nPor favor complétalos antes de guardar.`);
            return;
        }

        // Construir config final con medios de pago
        const tienePago = mediosPago.length > 0;
        const configFinal = {
            ...formConfig,
            id: formConfig.id === 'nuevaJunta' ? `junta-${Date.now()}` : formConfig.id,
            webpay: mediosPago.includes('webpay'),
            banco:        mediosPago.includes('transferencia') ? formConfig.banco        : '',
            tipoCuenta:   mediosPago.includes('transferencia') ? formConfig.tipoCuenta   : '',
            numeroCuenta: mediosPago.includes('transferencia') ? formConfig.numeroCuenta : '',
        };

        // Flag: ¿ya había solicitado activación antes?
        const yaHabiaActivado = !!configActual.activacionSolicitada;

        if (!tienePago) {
            // Guardar sin medio de pago → aviso parcial
            configFinal.activacionSolicitada = false;
            onGuardarConfig(configFinal);
            alert(
                '✅ Configuración guardada correctamente.\n\n' +
                '⚠️ Atención: aún no has configurado un Medio de Pago (Transferencia o WebPay). ' +
                'Tu Junta no podrá operar en la plataforma hasta que completes este dato y vuelvas a guardar.'
            );
        } else if (!yaHabiaActivado) {
            // Primera vez que se guarda completo → mensaje de registro exitoso
            configFinal.activacionSolicitada = true;
            onGuardarConfig(configFinal);
            alert(
                '🎉 ¡Registro completado exitosamente!\n\n' +
                'Tu Junta de Vecinos ha sido configurada con todos los datos necesarios. ' +
                'El administrador del sistema se comunicará contigo a la brevedad para ' +
                'validar la representación legal y autorizar la operación completa en la plataforma.\n\n' +
                'Serás redirigido(a) a tu panel de operador.'
            );
            if (onConfigCompleta) onConfigCompleta();
        } else {
            // Actualización posterior → mensaje estándar
            onGuardarConfig(configFinal);
            alert('✅ ¡Configuración actualizada! Los cambios se han aplicado al portal del residente.');
        }
    };

    /* ── Estilos ── */
    const inputStyle = {
        width: '100%',
        padding: '10px',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        boxSizing: 'border-box',
        fontSize: '14px',
        backgroundColor: '#fff',
        transition: 'border-color 0.2s',
        fontFamily: 'inherit'
    };

    const sectionTitle = {
        color: '#1e40af',
        borderBottom: '2px solid #dbeafe',
        paddingBottom: '8px',
        fontSize: '15px',
        fontWeight: '700',
        marginTop: '28px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const labelStyle = {
        display: 'block',
        fontWeight: '600',
        marginBottom: '5px',
        fontSize: '13px',
        color: '#334155'
    };

    const checkCard = (activo) => ({
        border: activo ? '2px solid #3b82f6' : '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '14px 18px',
        cursor: 'pointer',
        backgroundColor: activo ? '#eff6ff' : '#fafafa',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
    });

    /* ── Render ── */
    return (
        <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            background: '#fff',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
            fontFamily: "'Outfit', 'Segoe UI', sans-serif"
        }}>

            {/* Encabezado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '14px', marginBottom: '20px' }}>
                <span style={{ fontSize: '28px' }}>⚙️</span>
                <div>
                    <h2 style={{ margin: 0, color: '#0f172a', fontSize: '21px', fontWeight: '700' }}>
                        Configuración Institucional
                    </h2>
                    <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                        Configure identidad, medios de pago e imagen visual de su Junta de Vecinos.
                    </p>
                </div>
            </div>

            {/* Banner bienvenida para junta nueva */}
            {!configActual.rutJunta && (
                <div style={{
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                    border: '1px solid #6ee7b7',
                    borderLeft: '5px solid #10b981',
                    borderRadius: '10px',
                    padding: '20px 24px',
                    marginBottom: '28px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start'
                }}>
                    <span style={{ fontSize: '36px', lineHeight: '1' }}>🎉</span>
                    <div>
                        <h3 style={{ margin: '0 0 6px 0', color: '#065f46', fontSize: '17px', fontWeight: '700' }}>
                            ¡Bienvenida(o) a JJVV SaaS!
                        </h3>
                        <p style={{ margin: '0 0 8px 0', color: '#047857', fontSize: '14px', lineHeight: '1.6' }}>
                            Tu cuenta de operador fue creada exitosamente. Para habilitar la <strong>Bandeja de Solicitudes</strong> completa los datos de tu Junta a continuación.
                        </p>
                        <p style={{ margin: '0', color: '#065f46', fontSize: '13px', fontWeight: '600' }}>
                            👉 Los campos marcados con <strong>*</strong> son obligatorios. Al completarlos todos, tu Junta quedará lista para validación.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

                {/* ══ SECCIÓN 1: IDENTIDAD ══ */}
                <h3 style={sectionTitle}>
                    <span>🏛️</span> 1. Identidad Institucional
                </h3>

                <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>Nombre Oficial de la Junta de Vecinos: *</label>
                    <input
                        type="text"
                        name="nombreJunta"
                        value={formConfig.nombreJunta || ''}
                        onChange={handleChange}
                        placeholder="Ej: Junta de Vecinos N° 2 Amapolas"
                        style={inputStyle}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={labelStyle}>RUT Institucional: *</label>
                        <input
                            type="text"
                            name="rutJunta"
                            value={formConfig.rutJunta || ''}
                            onChange={handleRutChange}
                            placeholder="Ej: 72.123.456-K"
                            maxLength="13"
                            style={{
                                ...inputStyle,
                                borderColor: rutError ? '#ef4444' : '#cbd5e1',
                                backgroundColor: rutError ? '#fef2f2' : '#fff'
                            }}
                        />
                        {rutError && (
                            <span style={{ color: '#b91c1c', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: '500' }}>
                                ⚠️ RUT inválido. Verifique el dígito verificador.
                            </span>
                        )}
                    </div>
                    <div>
                        <label style={labelStyle}>Personalidad Jurídica:</label>
                        <input
                            type="text"
                            name="personalidadJuridica"
                            value={formConfig.personalidadJuridica || ''}
                            onChange={handleChange}
                            placeholder="Ej: RNPJSFL N° 45120-X"
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={labelStyle}>Dirección de la Sede: *</label>
                        <input
                            type="text"
                            name="direccionOficina"
                            value={formConfig.direccionOficina || ''}
                            onChange={handleChange}
                            placeholder="Ej: Av. Los Orientales 2430"
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Comuna de Jurisdicción:</label>
                        <input
                            type="text"
                            name="comuna"
                            value={formConfig.comuna || ''}
                            onChange={handleChange}
                            placeholder="Ej: Ñuñoa"
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={labelStyle}>Correo Electrónico Oficial: *</label>
                        <input
                            type="email"
                            name="emailContacto"
                            value={formConfig.emailContacto || ''}
                            onChange={handleChange}
                            placeholder="Ej: jjvv2amapolas@gmail.com"
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Teléfono de Contacto:</label>
                        <input
                            type="text"
                            name="telefono"
                            value={formConfig.telefono || ''}
                            onChange={handleChange}
                            placeholder="Ej: +56 2 2455 8899"
                            style={inputStyle}
                        />
                    </div>
                </div>

                {/* ══ SECCIÓN 2: OPERACIÓN ══ */}
                <h3 style={sectionTitle}>
                    <span>💰</span> 2. Parámetros Operativos y Medios de Pago
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div>
                        <label style={labelStyle}>Valor del Certificado (CLP $): *</label>
                        <input
                            type="number"
                            name="valorCertificado"
                            value={formConfig.valorCertificado || ''}
                            onChange={handleChange}
                            placeholder="Ej: 1000"
                            style={{ ...inputStyle, fontWeight: 'bold', color: '#16a34a' }}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Correlativo Inicial de Folio:</label>
                        <input
                            type="text"
                            name="correlativoInicial"
                            value={formConfig.correlativoInicial || ''}
                            onChange={handleChange}
                            placeholder="Ej: 000001"
                            style={inputStyle}
                        />
                    </div>
                </div>

                {/* Selección de medios de pago */}
                <label style={{ ...labelStyle, marginBottom: '12px' }}>
                    Medio(s) de Pago Habilitados:
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#94a3b8', fontWeight: '400' }}>
                        (Seleccione al menos uno para operar)
                    </span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>

                    {/* Transferencia */}
                    <div
                        style={checkCard(mediosPago.includes('transferencia'))}
                        onClick={() => toggleMedio('transferencia')}
                    >
                        <div style={{
                            width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0, marginTop: '2px',
                            border: mediosPago.includes('transferencia') ? '2px solid #3b82f6' : '2px solid #cbd5e1',
                            backgroundColor: mediosPago.includes('transferencia') ? '#3b82f6' : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {mediosPago.includes('transferencia') && <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>✓</span>}
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>🏦 Transferencia Bancaria</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>El vecino paga por transferencia a la cuenta de la Junta.</div>
                        </div>
                    </div>

                    {/* WebPay */}
                    <div
                        style={checkCard(mediosPago.includes('webpay'))}
                        onClick={() => toggleMedio('webpay')}
                    >
                        <div style={{
                            width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0, marginTop: '2px',
                            border: mediosPago.includes('webpay') ? '2px solid #3b82f6' : '2px solid #cbd5e1',
                            backgroundColor: mediosPago.includes('webpay') ? '#3b82f6' : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {mediosPago.includes('webpay') && <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>✓</span>}
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>💳 WebPay (Transbank)</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Pago en línea con tarjeta de crédito/débito.</div>
                        </div>
                    </div>
                </div>

                {/* Datos bancarios (solo si eligió transferencia) */}
                {mediosPago.includes('transferencia') && (
                    <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '18px',
                        marginBottom: '20px'
                    }}>
                        <p style={{ margin: '0 0 14px 0', fontWeight: '600', fontSize: '13px', color: '#1e40af' }}>
                            🏦 Datos de la Cuenta Bancaria para Transferencia:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                            <div>
                                <label style={labelStyle}>Banco:</label>
                                <input
                                    type="text"
                                    name="banco"
                                    value={formConfig.banco || ''}
                                    onChange={handleChange}
                                    placeholder="Ej: Banco Estado"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Tipo de Cuenta:</label>
                                <select name="tipoCuenta" value={formConfig.tipoCuenta || 'Cuenta Corriente'} onChange={handleChange} style={inputStyle}>
                                    <option value="Cuenta Corriente">Cuenta Corriente</option>
                                    <option value="Cuenta Vista / RUT">Cuenta Vista / RUT</option>
                                    <option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Número de Cuenta:</label>
                                <input
                                    type="text"
                                    name="numeroCuenta"
                                    value={formConfig.numeroCuenta || ''}
                                    onChange={handleChange}
                                    placeholder="Ej: 123456789"
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                                <label style={labelStyle}>RUT del Titular de la Cuenta:</label>
                                <input
                                    type="text"
                                    name="rutTitularCuenta"
                                    value={formConfig.rutTitularCuenta || ''}
                                    onChange={(e) => {
                                        const formateado = formatearRutInstitucional(e.target.value);
                                        setFormConfig(prev => ({ ...prev, rutTitularCuenta: formateado }));
                                    }}
                                    placeholder="Ej: 65.033.930-4"
                                    maxLength="13"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Email de Notificación Bancaria:</label>
                                <input
                                    type="email"
                                    name="emailNotificacionBanco"
                                    value={formConfig.emailNotificacionBanco || ''}
                                    onChange={handleChange}
                                    placeholder="Ej: tesoreria@jjvv2amapolas.cl"
                                    style={inputStyle}
                                />
                                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                                    Correo al que el banco enviará la notificación de pago recibido.
                                </p>
                            </div>
                        </div>

                    </div>
                )}

                {/* ══ SECCIÓN 3: ENCABEZADO Y FIRMA ══ */}
                <h3 style={sectionTitle}>
                    <span>📄</span> 3. Encabezado y Pie de Firma del Certificado
                </h3>

                {/* Encabezado */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px', marginBottom: '18px' }}>
                    <p style={{ margin: '0 0 14px 0', fontWeight: '700', fontSize: '13px', color: '#1e40af' }}>
                        🔝 Encabezado del Certificado (zona superior izquierda):
                    </p>

                    <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Texto de Encabezado: *</label>
                        <textarea
                            name="cabeceraTexto"
                            value={formConfig.cabeceraTexto || ''}
                            onChange={handleChange}
                            rows="3"
                            placeholder={"Ej: JUNTA DE VECINOS N° 2 AMAPOLAS\nUNIDAD VECINAL N° 5\nÑUÑOA"}
                            style={{ ...inputStyle, fontFamily: 'Courier, monospace', fontSize: '13px', resize: 'vertical' }}
                        />
                    </div>

                    <SubidaImagen
                        label="Imagen de Logo o Símbolo"
                        campo="logoImagen"
                        valor={formConfig.logoImagen || ''}
                        onChange={handleImageChange}
                        descripcion="Se mostrará junto al texto de encabezado en el certificado. Formatos: JPG, PNG, SVG. Tamaño recomendado: 200×200 px."
                    />
                </div>

                {/* Pie de Firma */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px', marginBottom: '24px' }}>
                    <p style={{ margin: '0 0 14px 0', fontWeight: '700', fontSize: '13px', color: '#1e40af' }}>
                        ✍️ Pie de Firma del Certificado (zona inferior):
                    </p>

                    <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Texto del Pie de Firma: *</label>
                        <textarea
                            name="pieFirmaTexto"
                            value={formConfig.pieFirmaTexto || ''}
                            onChange={handleChange}
                            rows="2"
                            placeholder={"Ej: LA DIRECTIVA\nJunta de Vecinos N° 2 Amapolas"}
                            style={{ ...inputStyle, fontFamily: 'Courier, monospace', fontSize: '13px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <SubidaImagen
                            label="Imagen de Firma"
                            campo="firmaImagen"
                            valor={formConfig.firmaImagen || ''}
                            onChange={handleImageChange}
                            descripcion="Aparece sobre el texto del pie (firma manuscrita escaneada). Fondo transparente recomendado."
                        />
                        <SubidaImagen
                            label="Imagen de Timbre"
                            campo="timbreImagen"
                            valor={formConfig.timbreImagen || ''}
                            onChange={handleImageChange}
                            descripcion="Se mostrará al lado de la firma. Idealmente PNG con fondo transparente."
                        />
                    </div>
                </div>

                {/* Botón guardar */}
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#1d4ed8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(29,78,216,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#1e40af'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                >
                    💾 Guardar Configuración
                </button>

            </form>
        </div>
    );
}

export default ConfiguracionJunta;
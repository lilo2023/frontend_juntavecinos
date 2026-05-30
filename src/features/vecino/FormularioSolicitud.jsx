import React, { useState, useEffect } from 'react';

// ==========================================
// FUNCIONES AUXILIARES (FORMATEO Y VALIDACIÓN)
// ==========================================

const formatearRut = (rut) => {
    let valor = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (valor.length === 0) return '';

    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1);

    if (cuerpo.length > 0) {
        cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return `${cuerpo}-${dv}`;
    }
    return dv;
};

const validarRutChileno = (rutCompleto) => {
    if (!rutCompleto || rutCompleto.length < 3) return false;

    const tmp = rutCompleto.replace(/[^0-9kK]/g, '').toUpperCase();
    const cuerpo = tmp.slice(0, -1);
    let dv = tmp.slice(-1);

    if (cuerpo.length < 7) return false;

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += multiplo * parseInt(cuerpo.charAt(i));
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    let dvEsperado = 11 - (suma % 11);
    if (dvEsperado === 11) dvEsperado = '0';
    else if (dvEsperado === 10) dvEsperado = 'K';
    else dvEsperado = dvEsperado.toString();

    return dv === dvEsperado;
};

// ==========================================
// COMPONENTE PRINCIPAL (PORTAL DEL VECINO)
// ==========================================
export default function FormularioSolicitud(props) {
    const infoJunta = props.juntaConfig || {
        nombreJunta: 'Junta de Vecinos "Universidad" N° 19',
        valorCertificado: '1000',
        comuna: 'Ñuñoa',
        emailContacto: 'jvuniversidad19@gmail.com'
    };

    const [formData, setFormData] = useState({
        nombre: '',
        rut: '',
        email: '',
        direccion: '',
        comuna: infoJunta.comuna || 'Ñuñoa',
        calidadResidente: 'Propietario',
        destino: '',
        montoPago: infoJunta.valorCertificado || '0'
    });



    const [rutError, setRutError] = useState(false);
    const [urlsTemporales, setUrlsTemporales] = useState({
        cedula: '',
        afp: '',
        tarjetaVecino: '',
        comprobantePago: ''
    });

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            comuna: infoJunta.comuna || 'Ñuñoa',
            montoPago: infoJunta.valorCertificado || '0'
        }));
    }, [infoJunta.comuna, infoJunta.valorCertificado]);

    const cargarDatosDemo = () => {
        setFormData({
            nombre: 'Danilo Marcelo Godoy Díaz',
            rut: '10.703.900-7',
            email: 'danilo.godoy@alumnos.unab.cl',
            direccion: 'Avenida Grecia 3348, Torre A, Departamento 1713',
            comuna: infoJunta.comuna || 'Ñuñoa',
            calidadResidente: 'Familiar del propietario',
            destino: 'Universidad Andrés Bello',
            montoPago: infoJunta.valorCertificado || '0'
        });
        setRutError(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'rut') {
            const rutFormateado = formatearRut(value);
            setFormData({ ...formData, rut: rutFormateado });

            if (rutFormateado.replace(/[^0-9kK]/g, '').length >= 8) {
                setRutError(!validarRutChileno(rutFormateado));
            } else {
                setRutError(false);
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUrlsTemporales(prev => ({ ...prev, [e.target.name]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rutError || !formData.rut) {
            alert('Por favor, ingrese un RUT válido antes de enviar.');
            return;
        }

        const nuevaSolicitud = {
            id: 'FOLIO-' + Math.floor(10000 + Math.random() * 90000),
            nombre: formData.nombre,
            rut: formData.rut,
            email: formData.email,
            direccion: formData.direccion,
            calidadResidente: formData.calidadResidente,
            destino: formData.destino,
            montoPago: formData.montoPago || infoJunta.valorCertificado || '0',
            estado: 'Pendiente',
            ingreso: 'Hace un momento',
            // Cambia la sección de "urls" dentro de handleSubmit para que quede así:
            urls: {
                cedula: urlsTemporales.cedula || 'https://via.placeholder.com/500x350?text=FOTO+CEDULA',
                domicilio: urlsTemporales.domicilio || 'https://via.placeholder.com/500x600?text=DOCUMENTO+DOMICILIO', // ✨ Corregido
                tarjeta: urlsTemporales.tarjetaVecino || 'https://via.placeholder.com/500x300?text=TARJETA+VIRTUAL',
                pago: urlsTemporales.comprobantePago || 'https://via.placeholder.com/500x400?text=COMPROBANTE+PAGO'
            }
        };

        props.onEnviar(nuevaSolicitud);
        alert('¡Solicitud enviada exitosamente al panel de revisión institucional!');

        setFormData({
            nombre: '', rut: '', email: '', direccion: '',
            comuna: infoJunta.comuna || 'Ñuñoa', calidadResidente: 'Propietario',
            destino: '', montoPago: infoJunta.valorCertificado || '0'
        });
    };

    const renderArancel = () => {
        const valor = parseInt(infoJunta.valorCertificado);
        if (isNaN(valor)) return '$0 CLP (Por definir por administración)';
        return `$${valor.toLocaleString('es-CL')} CLP`;
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontFamily: 'Arial' }}>

            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                <button
                    type="button"
                    onClick={cargarDatosDemo}
                    style={{ background: '#e2e8f0', color: '#4a5568', padding: '6px 12px', border: '1px dashed #cbd5e0', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >
                    ⚡ Autocompletar datos de Danilo (Prueba)
                </button>
            </div>

            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px', fontSize: '19px' }}>
                {infoJunta.nombreJunta ? `Portal Digital: ${infoJunta.nombreJunta}` : '✨ Portal de Residente'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>

                {/* SECCIÓN 1: IDENTIFICACIÓN */}
                <div>
                    <h3 style={{ fontSize: '15px', color: '#34495e', margin: '0 0 10px 0' }}>1. Identificación y Domicilio</h3>
                    <label style={{ fontWeight: '500', fontSize: '14px' }}>Nombre Completo:</label>
                    <input
                        type="text" name="nombre" value={formData.nombre} onChange={handleInputChange}
                        placeholder="Ej: Juan Pérez González" required
                        style={{ width: '100%', padding: '10px', margin: '5px 0 10px 0', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '10px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>RUT:</label>
                            <input
                                type="text" name="rut" value={formData.rut} onChange={handleInputChange}
                                placeholder="Ej: 10.703.900-7" maxLength="12" required
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: rutError ? '2px solid #dc3545' : '1px solid #ccc', backgroundColor: rutError ? '#fff5f5' : '#fff', boxSizing: 'border-box' }}
                            />
                            {rutError && <span style={{ color: '#dc3545', fontSize: '11px', marginTop: '4px', fontWeight: 'bold' }}>⚠️ RUT inválido.</span>}
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: '5px', fontWeight: '500', fontSize: '13px' }}>Tu Correo (Para Enlace Seguro):</label>
                            <input
                                type="email" name="email" value={formData.email} onChange={handleInputChange}
                                placeholder="nombre@correo.com" required
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', color: '#0056b3' }}
                            />
                        </div>
                    </div>

                    <label style={{ fontWeight: '500', fontSize: '14px' }}>Dirección de Residencia:</label>
                    <input
                        type="text" name="direccion" value={formData.direccion} onChange={handleInputChange}
                        placeholder="Ej: Avenida Grecia 3348, Depto 1713" required
                        style={{ width: '100%', padding: '10px', margin: '5px 0 10px 0', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />

                    <label style={{ fontWeight: '500', fontSize: '14px' }}>Condición de Vivienda:</label>
                    <select name="calidadResidente" value={formData.calidadResidente} onChange={handleInputChange} style={{ width: '100%', padding: '10px', margin: '5px 0 10px 0', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                        <option value="Propietario">Propietario</option>
                        <option value="Arrendatario">Arrendatario</option>
                        <option value="Familiar del propietario">Familiar del propietario</option>
                        <option value="Allegado">Allegado</option>
                    </select>

                    <label style={{ fontWeight: '500', fontSize: '14px' }}>Presentado en:</label>
                    <input
                        type="text" name="destino" value={formData.destino} onChange={handleInputChange}
                        placeholder="Ej: Universidad Andrés Bello" required
                        style={{ width: '100%', padding: '10px', margin: '5px 0 10px 0', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                {/* SECCIÓN 2: DOCUMENTOS DE RESPALDO (CORREGIDO SIN DUPLICADOS) */}
                <div>
                    <h3 style={{ fontSize: '15px', color: '#34495e', margin: '15px 0 10px 0' }}>2. Documentos de Respaldo</h3>

                    {/* Fila superior: Ahora solo contiene la Cédula de Identidad ocupando todo el ancho o mitad */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', margin: '0 0 5px 0', fontWeight: '500', fontSize: '14px' }}>Cédula de Identidad (Ambos lados):</label>
                        <input
                            type="file"
                            name="cedula"
                            onChange={handleFileChange}
                            accept="image/*"
                            required={!urlsTemporales?.cedula}
                            style={{ width: '100%', fontSize: '13px' }}
                        />
                    </div>

                    {/* Fila Inferior: Desplegable dinámico para el Documento de Domicilio */}
                    <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                        <label style={{ display: 'block', margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '13px', color: '#2c3e50' }}>
                            Documento Acreditador de Domicilio:
                        </label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

                            <select
                                name="tipoDocDomicilio"
                                onChange={(e) => {
                                    if (typeof handleInputChange === 'function') {
                                        handleInputChange(e);
                                    }
                                }}
                                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '13px', fontWeight: '500' }}
                            >
                                <option value="Boleta de Servicio">📄 Boleta de Servicio (Luz, Agua, Gas)</option>
                                <option value="Certificado AFP">🏦 Certificado de Afiliación AFP / Cartola</option>
                                <option value="Contrato de Arriendo">📜 Contrato de Arriendo Notarial</option>
                                <option value="Registro Social de Hogares">🏠 Registro Social de Hogares (RSH)</option>
                                <option value="Otro">📁 Otro Documento Acreditador</option>
                            </select>

                            <input
                                type="file"
                                name="domicilio"
                                onChange={handleFileChange}
                                accept="image/*"
                                required={!urlsTemporales?.domicilio}
                                style={{ flex: 1, fontSize: '13px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 3: PAGO DINÁMICO MULTI-TENANT */}
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '15px', color: '#34495e', margin: '0 0 10px 0' }}>3. Pago de Derechos Institucionales</h3>

                    <div style={{ padding: '12px', backgroundColor: '#e0f7fa', color: '#006064', borderRadius: '4px', fontWeight: 'bold', marginBottom: '15px', border: '1px solid #b2ebf2', fontSize: '14px' }}>
                        Arancel Establecido por la Organización: {renderArancel()}
                    </div>

                    <div style={{ backgroundColor: '#fff', border: '1px solid #cbd5e0', padding: '15px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px', color: '#2d3748' }}>
                        <span style={{ fontWeight: 'bold', color: '#2b6cb0', display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                            📢 Datos de Transferencia Bancaria:
                        </span>
                        {infoJunta.banco ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: '1.4' }}>
                                <div><strong>Destinatario:</strong> {infoJunta.nombreJunta}</div>
                                <div><strong>RUT:</strong> {infoJunta.rutJunta}</div>
                                <div><strong>Banco:</strong> <span style={{ color: '#2b6cb0', fontWeight: 'bold' }}>{infoJunta.banco}</span></div>
                                <div><strong>Tipo de Cuenta:</strong> {infoJunta.tipoCuenta}</div>
                                <div><strong>N° de Cuenta:</strong> <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#edf2f7', padding: '2px 6px', borderRadius: '3px' }}>{infoJunta.numeroCuenta}</span></div>

                                {/* CAMPO REQUERIDO PARA LA APP DEL BANCO */}
                                <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#fffaf0', border: '1px solid #feebc8', borderRadius: '4px' }}>
                                    <strong style={{ color: '#dd6b20' }}>📧 Correo destino para el Banco:</strong> <br />
                                    <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 'bold', color: '#dd6b20' }}>{infoJunta.emailContacto}</span>
                                    <span style={{ display: 'block', fontSize: '11px', color: '#718096', marginTop: '2px' }}>
                                        (Ingrese este correo en su banco para notificar la transferencia automáticamente)
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: '#e53e3e', fontStyle: 'italic', fontWeight: '500' }}>
                                ⚠️ Datos bancarios pendientes de configuración por la administración.
                            </div>
                        )}
                    </div>

                    <label style={{ display: 'block', margin: '10px 0 5px 0', fontWeight: '500', fontSize: '14px' }}>
                        Cargue el Comprobante de Transferencia Electrónica:
                    </label>
                    <input type="file" name="comprobantePago" onChange={handleFileChange} accept="image/*" required={!urlsTemporales.comprobantePago} />
                </div>

                <button type="submit" style={{ background: '#28a745', color: 'white', padding: '14px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    Enviar Solicitud Segura
                </button>
            </form>
        </div>
    );
}
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

const getApiUrl = () => {
    return window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api/residentes'
        : 'https://backend-junta-vecinos.onrender.com/api/residentes';
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
        nombre: props.userSession?.nombre || '',
        rut: props.userSession?.rut || '',
        email: props.userSession?.email || '',
        direccion: '',
        comuna: infoJunta.comuna || 'Ñuñoa',
        calidadResidente: 'Propietario',
        destino: '',
        montoPago: infoJunta.valorCertificado || '0',
        tipoDocDomicilio: 'Boleta de Servicio' // Inicializado con la primera opción del select
    });

    const [rutError, setRutError] = useState(false);
    const [isSubiendo, setIsSubiendo] = useState(false); // Estado para feedback de carga de imágenes

    // 📁 NUEVOS ESTADOS COMPLEMENTARIOS PARA ARCHIVOS REALES (BINARIOS CRUDOS)
    const [archivosRaw, setArchivosRaw] = useState({
        cedula: null,
        domicilio: null,
        comprobantePago: null
    });

    const [urlsTemporales, setUrlsTemporales] = useState({
        cedula: '',
        domicilio: '',
        comprobantePago: ''
    });

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            comuna: infoJunta.comuna || 'Ñuñoa',
            montoPago: infoJunta.valorCertificado || '0'
        }));
    }, [infoJunta.comuna, infoJunta.valorCertificado]);

    // Pre-cargar datos si viene una solicitud a editar
    useEffect(() => {
        if (props.solicitudAEditar) {
            let direccionLimpia = props.solicitudAEditar.direccion || '';
            // Limpiar comuna del string para evitar duplicación
            direccionLimpia = direccionLimpia.replace(/,\s*ñuñoa/gi, '').trim();

            setFormData({
                nombre: props.solicitudAEditar.nombre || '',
                rut: props.solicitudAEditar.rut || '',
                email: props.solicitudAEditar.email || '',
                direccion: direccionLimpia,
                comuna: props.solicitudAEditar.comuna || infoJunta.comuna || 'Ñuñoa',
                calidadResidente: props.solicitudAEditar.calidadResidente || 'Propietario',
                destino: props.solicitudAEditar.destino || '',
                montoPago: props.solicitudAEditar.montoPago || infoJunta.valorCertificado || '0',
                tipoDocDomicilio: props.solicitudAEditar.tipoDocDomicilio || 'Boleta de Servicio'
            });
            setRutError(false);

            // Cargar URLs existentes en urlsTemporales para la previsualización/comprobación
            setUrlsTemporales({
                cedula: props.solicitudAEditar.urls?.cedula || '',
                domicilio: props.solicitudAEditar.urls?.domicilio || '',
                comprobantePago: props.solicitudAEditar.urls?.pago || ''
            });
        }
    }, [props.solicitudAEditar, infoJunta]);

    const cargarDatosDemo = () => {
        setFormData({
            nombre: 'Danilo Marcelo Godoy Díaz',
            rut: '10.703.900-7',
            email: 'danilo.godoy@alumnos.unab.cl',
            direccion: 'Avenida Grecia 3348, Torre A, Departamento 1713',
            comuna: infoJunta.comuna || 'Ñuñoa',
            calidadResidente: 'Familiar del propietario',
            destino: 'Universidad Andrés Bello',
            montoPago: infoJunta.valorCertificado || '0',
            tipoDocDomicilio: 'Boleta de Servicio'
        });
        setRutError(false);

        // Simulamos que cargamos los archivos inyectando un objeto Blob simulado
        // para pasar las validaciones del submit sin romper el flujo asíncrono
        const blobSimulado = new Blob(["demo"], { type: "image/png" });
        setArchivosRaw({
            cedula: blobSimulado,
            domicilio: blobSimulado,
            comprobantePago: blobSimulado
        });
    };

    const subirACloudinary = async (file) => {
        if (!file) return "";

        const formDataCloudinary = new FormData();
        formDataCloudinary.append("file", file);
        formDataCloudinary.append("upload_preset", "preset_vecinos");

        try {
            const res = await fetch("https://api.cloudinary.com/v1_1/dpbvl0jgf/image/upload", {
                method: "POST",
                body: formDataCloudinary,
            });

            const data = await res.json();

            if (data.secure_url) {
                return data.secure_url; 
            } else {
                console.error("Error en la respuesta de Cloudinary:", data);
                return "";
            }
        } catch (error) {
            console.error("Error al conectar con Cloudinary:", error);
            return "";
        }
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

    // 🔄 MODIFICADO: Ahora captura tanto el objeto URL temporal como el archivo crudo original
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const inputName = e.target.name; // 'cedula', 'domicilio' o 'comprobantePago'

        if (file) {
            // Guardamos el binario para Cloudinary
            setArchivosRaw(prev => ({ ...prev, [inputName]: file }));
            // Guardamos el objeto virtual por si necesitas renderizar previsualizaciones locales
            setUrlsTemporales(prev => ({ ...prev, [inputName]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rutError || !formData.rut) {
            alert('Por favor, ingrese un RUT válido antes de enviar.');
            return;
        }

        const esEdicion = !!props.solicitudAEditar;
        if (!esEdicion && (!archivosRaw.cedula || !archivosRaw.domicilio || !archivosRaw.comprobantePago)) {
            alert('Por favor, adjunte los tres documentos requeridos (Cédula, Acreditación y Comprobante).');
            return;
        }

        // ==========================================
        // PROCESAMIENTO DE IMÁGENES ASÍNCRONAS (Cloudinary)
        // ==========================================
        setIsSubiendo(true);

        let cloudCedulaUrl = "";
        let cloudDomicilioUrl = "";
        let cloudPagoUrl = "";

        try {
            if (archivosRaw.cedula) {
                cloudCedulaUrl = await subirACloudinary(archivosRaw.cedula);
            }
            if (archivosRaw.domicilio) {
                cloudDomicilioUrl = await subirACloudinary(archivosRaw.domicilio);
            }
            if (archivosRaw.comprobantePago) {
                cloudPagoUrl = await subirACloudinary(archivosRaw.comprobantePago);
            }

            if (!esEdicion && (!cloudCedulaUrl || !cloudDomicilioUrl || !cloudPagoUrl)) {
                throw new Error("Una o más imágenes no pudieron procesarse en la nube.");
            }
        } catch (errorCloud) {
            console.error(errorCloud);
            alert("❌ Error al procesar y subir tus documentos de respaldo a Cloudinary. Inténtalo de nuevo.");
            setIsSubiendo(false);
            return;
        }

        // ==========================================
        // LÓGICA DE PROCESAMIENTO DE DIRECCIÓN (Mapeo a Objeto)
        // ==========================================
        const partesDireccion = formData.direccion.split(',');

        const calleLimpia = partesDireccion[0] ? partesDireccion[0].replace(/(\d+)/g, '').trim() : 'No especificada';
        const matchNumero = partesDireccion[0] ? partesDireccion[0].match(/\d+/) : null;
        const numeroLimpio = matchNumero ? matchNumero[0] : 'S/N';

        const torreLimpia = partesDireccion[1] ? partesDireccion[1].replace(/torre/i, '').trim() : '';
        const deptoLimpio = partesDireccion[2] ? partesDireccion[2].replace(/departamento|depto/i, '').trim() : '';

        // ==========================================
        // ESTRUCTURA DEL OBJETO FINAL CON LINKS DE INTERNET
        // ==========================================
        const datosParaBackend = {
            nombre: formData.nombre,
            rut: formData.rut,
            correo: formData.email,
            destino: formData.destino,
            direccion: {
                calle: calleLimpia,
                numero: numeroLimpio,
                torre: torreLimpia,
                departamento: deptoLimpio,
                comuna: formData.comuna || 'Ñuñoa'
            },
            tipoResidente: formData.calidadResidente === 'Familiar del propietario' ? 'Familiar' : formData.calidadResidente,
            
            urls: {
                cedula: cloudCedulaUrl || (esEdicion ? props.solicitudAEditar.urls?.cedula : ''),
                domicilio: cloudDomicilioUrl || (esEdicion ? props.solicitudAEditar.urls?.domicilio : ''),
                pago: cloudPagoUrl || (esEdicion ? props.solicitudAEditar.urls?.pago : '')
            },
            tipoDocDomicilio: formData.tipoDocDomicilio || 'Doc. Domicilio',
            ...(esEdicion && { estado: 'Pendiente', motivoRechazo: '' })
        };

        // ==========================================
        // PETICIÓN HTTP POST/PATCH AL BACKEND
        // ==========================================
        try {
            const urlApi = esEdicion
                ? `${getApiUrl()}/${props.solicitudAEditar.id}`
                : getApiUrl();
            const metodoApi = esEdicion ? 'PATCH' : 'POST';

            const respuesta = await fetch(urlApi, {
                method: metodoApi,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosParaBackend)
            });

            const resultado = await respuesta.json();

            if (resultado.ok) {
                if (esEdicion) {
                    alert(`¡Solicitud corregida y re-enviada con éxito!\nConservará su Folio asignado.`);
                } else {
                    alert(`¡Solicitud enviada exitosamente!\nSu número correlativo asignado por sistema es: ${resultado.data.correlativoSolicitud}`);
                }

                if (typeof props.onEnviar === 'function') {
                    const solicitudNormalizadaParaFrontend = {
                        ...resultado.data,
                        folio: resultado.data.correlativoSolicitud || `FOLIO-${resultado.data.id || '1003'}`,
                        nombre: formData.nombre,
                        rut: formData.rut,
                        email: formData.email,
                        direccion: formData.direccion,
                        urls: {
                            cedula: cloudCedulaUrl || resultado.data?.urls?.cedula || (esEdicion ? props.solicitudAEditar.urls?.cedula : ''),
                            domicilio: cloudDomicilioUrl || resultado.data?.urls?.domicilio || (esEdicion ? props.solicitudAEditar.urls?.domicilio : ''),
                            pago: cloudPagoUrl || resultado.data?.urls?.pago || (esEdicion ? props.solicitudAEditar.urls?.pago : '')
                        }
                    };
                    props.onEnviar(solicitudNormalizadaParaFrontend);
                }

                // Limpiamos el formulario y los contenedores de archivos binarios
                setFormData({
                    nombre: '', rut: '', email: '', direccion: '',
                    comuna: infoJunta.comuna || 'Ñuñoa', calidadResidente: 'Propietario',
                    destino: '', montoPago: infoJunta.valorCertificado || '0',
                    tipoDocDomicilio: 'Boleta de Servicio'
                });
                setArchivosRaw({ cedula: null, domicilio: null, comprobantePago: null });
                setUrlsTemporales({ cedula: '', domicilio: '', comprobantePago: '' });
                setRutError(false);
            } else {
                alert(`⚠️ Atención: ${resultado.msg || 'Error al guardar los datos'}`);
            }
        } catch (error) {
            console.error("Error al conectar con la API:", error);
            alert("❌ No se pudo establecer conexión con el servidor de la Junta de Vecinos. Asegúrese de que el backend esté encendido.");
        } finally {
            setIsSubiendo(false); // Liberamos el formulario
        }
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
                    disabled={isSubiendo}
                    style={{ background: '#e2e8f0', color: '#4a5568', padding: '6px 12px', border: '1px dashed #cbd5e0', borderRadius: '4px', cursor: isSubiendo ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold' }}
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
                        placeholder="Ej: Juan Pérez González" required disabled={isSubiendo}
                        style={{ width: '100%', padding: '10px', margin: '5px 0 10px 0', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '10px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>RUT:</label>
                            <input
                                type="text" name="rut" value={formData.rut} onChange={handleInputChange}
                                placeholder="Ej: 10.703.900-7" maxLength="12" required disabled={isSubiendo}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: rutError ? '2px solid #dc3545' : '1px solid #ccc', backgroundColor: rutError ? '#fff5f5' : '#fff', boxSizing: 'border-box' }}
                            />
                            {rutError && <span style={{ color: '#dc3545', fontSize: '11px', marginTop: '4px', fontWeight: 'bold' }}>⚠️ RUT inválido.</span>}
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: '5px', fontWeight: '500', fontSize: '13px' }}>Tu Correo (Para Enlace Seguro):</label>
                            <input
                                type="email" name="email" value={formData.email} onChange={handleInputChange}
                                placeholder="nombre@correo.com" required disabled={isSubiendo}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', color: '#0056b3' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', width: '100%', marginTop: '5px' }}>
                        <div style={{ flex: 3, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontWeight: '500', fontSize: '14px', marginBottom: '5px' }}>Dirección de Residencia (Calle y Número):</label>
                            <input
                                type="text" name="direccion" value={formData.direccion} onChange={handleInputChange}
                                placeholder="Ej: Avenida Grecia 3348, Depto 1713" required disabled={isSubiendo}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontWeight: '500', fontSize: '14px', marginBottom: '5px' }}>Comuna:</label>
                            <input
                                type="text" name="comuna" value={formData.comuna || 'Ñuñoa'} disabled
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', boxSizing: 'border-box', color: '#64748b', fontWeight: 'bold' }}
                            />
                        </div>
                    </div>

                    <label style={{ fontWeight: '500', fontSize: '14px' }}>Condición de Vivienda:</label>
                    <select name="calidadResidente" value={formData.calidadResidente} onChange={handleInputChange} disabled={isSubiendo} style={{ width: '100%', padding: '10px', margin: '5px 0 10px 0', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                        <option value="Propietario">Propietario</option>
                        <option value="Arrendatario">Arrendatario</option>
                        <option value="Familiar del propietario">Familiar del propietario</option>
                        <option value="Allegado">Allegado</option>
                    </select>

                    <label style={{ fontWeight: '500', fontSize: '14px' }}>Presentado en:</label>
                    <input
                        type="text" name="destino" value={formData.destino} onChange={handleInputChange}
                        placeholder="Ej: Universidad Andrés Bello" required disabled={isSubiendo}
                        style={{ width: '100%', padding: '10px', margin: '5px 0 10px 0', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                {/* SECCIÓN 2: DOCUMENTOS DE RESPALDO */}
                <div>
                    <h3 style={{ fontSize: '15px', color: '#34495e', margin: '15px 0 10px 0' }}>2. Documentos de Respaldo</h3>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', margin: '0 0 5px 0', fontWeight: '500', fontSize: '14px' }}>Cédula de Identidad (Ambos lados):</label>
                        <input
                            type="file"
                            name="cedula"
                            onChange={handleFileChange}
                            accept="image/*"
                            required={!props.solicitudAEditar && !archivosRaw.cedula}
                            disabled={isSubiendo}
                            style={{ width: '100%', fontSize: '13px' }}
                        />
                    </div>

                    <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                        <label style={{ display: 'block', margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '13px', color: '#2c3e50' }}>
                            Documento Acreditador de Domicilio:
                        </label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

                            <select
                                name="tipoDocDomicilio"
                                value={formData.tipoDocDomicilio}
                                onChange={handleInputChange}
                                disabled={isSubiendo}
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
                                required={!props.solicitudAEditar && !archivosRaw.domicilio}
                                disabled={isSubiendo}
                                style={{ flex: 1, fontSize: '13px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 3: PAGO DINÁMICO */}
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
                    <input 
                        type="file" 
                        name="comprobantePago" 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        required={!props.solicitudAEditar && !archivosRaw.comprobantePago} 
                        disabled={isSubiendo}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isSubiendo}
                    style={{ 
                        background: isSubiendo ? '#6c757d' : '#28a745', 
                        color: 'white', 
                        padding: '14px', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: isSubiendo ? 'not-allowed' : 'pointer', 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                    }}
                >
                    {isSubiendo ? '⏳ Procesando y subiendo imágenes...' : 'Enviar Solicitud Segura'}
                </button>
            </form>
        </div>
    );
}
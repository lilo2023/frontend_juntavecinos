import React, { useState, useEffect } from 'react';
import { juntasDeVecinosNunoa } from '../vecino/juntasData';

// Haversine formula to calculate distance in km between two coordinates
function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
}

export default function DetalleRevision({ solicitud, onActualizarEstado, onVolver, soloLecturaVecino = false, juntaConfig }) {
    const [docActivo, setDocActivo] = useState('cedula');
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [mostrarBloqueRechazo, setMostrarBloqueRechazo] = useState(false);
    const [imagenZoom, setImagenZoom] = useState(null);

    // Estados para Verificación Territorial en vivo
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoResult, setGeoResult] = useState(null);
    const [geoError, setGeoError] = useState(null);


    const [esperaTransicion, setEsperaTransicion] = useState(false);

    // 1. Nuevo estado local para asegurar el renderizado inmediato del PDF
    const [estadoLocal, setEstadoLocal] = useState(solicitud?.estado || 'Pendiente');
    const [yaAprobadoLocal, setYaAprobadoLocal] = useState(false);

    // Fallback seguro en caso de que por alguna razón no venga juntaConfig
    const config = juntaConfig || {
        nombreJunta: 'Organización Vecinal',
        rutJunta: 'XX.XXX.XXX-X',
        cabeceraTexto: 'ORGANIZACIÓN VECINAL DE ÑUÑOA',
        pieFirmaTexto: 'LA DIRECTIVA',
        comuna: 'Ñuñoa'
    };

    // Sincronizar si el padre cambia de vecino
    useEffect(() => {
        setEstadoLocal(solicitud?.estado || 'Pendiente');
        // Resetear la verificación si cambia de solicitud
        setGeoResult(null);
        setGeoError(null);
    }, [solicitud]);

    // Geocodificación territorial en vivo
    useEffect(() => {
        if (docActivo !== 'verificacion') return;
        if (geoResult) return; // ya cargó

        const validarDireccionTerritorial = async () => {
            setGeoLoading(true);
            setGeoError(null);

            try {
                // Limpiar dirección e incluir comuna para Nominatim
                let comuna = config?.comuna || 'Ñuñoa';
                let query = `${solicitud.direccion}, ${comuna}, Chile`;
                
                console.log("Validando dirección territorial:", query);
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
                const data = await res.json();

                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lng = parseFloat(data[0].lon);

                    // Buscar la JVV más cercana
                    let minimaDistancia = Infinity;
                    let juntaMasCercana = null;

                    juntasDeVecinosNunoa.forEach((jvv) => {
                        const d = calcularDistanciaHaversine(lat, lng, jvv.lat, jvv.lng);
                        if (d < minimaDistancia) {
                            minimaDistancia = d;
                            juntaMasCercana = jvv;
                        }
                    });

                    // Calcular la distancia a la junta del operador actual
                    // La junta actual tiene un id en el config. (ej: config.id o idJunta de session)
                    const idJuntaOperador = juntaConfig?.id || solicitud?.idJunta || 'jjvv19';
                    const juntaOperadorData = juntasDeVecinosNunoa.find(j => j.id === idJuntaOperador) || juntasDeVecinosNunoa.find(j => j.id === 'jjvv19');
                    let distanciaAOperador = null;

                    if (juntaOperadorData) {
                        distanciaAOperador = calcularDistanciaHaversine(lat, lng, juntaOperadorData.lat, juntaOperadorData.lng);
                    }

                    setGeoResult({
                        lat,
                        lng,
                        juntaSugerida: juntaMasCercana,
                        distanciaSugerida: minimaDistancia,
                        distanciaAOperador,
                        juntaOperadorData,
                        displayName: data[0].display_name
                    });
                } else {
                    setGeoError('No se pudo encontrar las coordenadas geográficas para la dirección provista. Valídela manualmente.');
                }
            } catch (err) {
                console.error("Error en geocoding de operador:", err);
                setGeoError('Error de red al consultar el mapa de validación territorial. Inténtelo más tarde.');
            } finally {
                setGeoLoading(false);
            }
        };

        validarDireccionTerritorial();
    }, [docActivo, solicitud, config, juntaConfig]);

    // 🔴 LOGS DE CICLO DE VIDA (Mira tu consola del navegador cuando ocurra el parpadeo)
    console.log("=============================================");
    console.log("🔄 DetalleRevision RENDERIZADO");
    console.log("🆔 ID Solicitud recibido:", solicitud?.id || solicitud?._id);
    console.log("📊 Estado de la solicitud recibido:", solicitud?.estado);
    console.log("=============================================");



    const imagenesSimuladas = {
        cedula: solicitud?.urls?.cedula || 'https://via.placeholder.com/500x350?text=FOTO+CEDULA',
        domicilio: solicitud?.urls?.domicilio || 'https://via.placeholder.com/500x600?text=DOCUMENTO+DOMICILIO',
        tarjeta: solicitud?.urls?.tarjeta || 'https://via.placeholder.com/500x300?text=TARJETA+VIRTUAL',
        pago: solicitud?.urls?.pago || 'https://via.placeholder.com/500x400?text=COMPROBANTE+PAGO'
    };

    // Helper dinámico: Identifica qué imagen está en pantalla según la pestaña activa
    const obtenerImagenActiva = () => {
        if (docActivo === 'cedula') return solicitud?.urls?.cedula || "https://via.placeholder.com/450x280?text=Simulacion+Cedula+Identidad";
        if (docActivo === 'domicilio') return solicitud?.urls?.domicilio || "https://via.placeholder.com/500x600?text=Error+al+cargar+archivo";
        if (docActivo === 'pago') return solicitud?.urls?.pago || solicitud?.urls?.comprobantePago || "https://via.placeholder.com/450x280?text=Comprobante+de+Pago";
        return null;
    };

    // --- CORREGIDO PASO 2: AHORA EVALÚA EL ESTADO LOCAL ---
    if (estadoLocal === 'Aprobado' || yaAprobadoLocal) {
        return (
            <div className="certificado-imprimible" style={{ padding: '35px 40px', maxWidth: '750px', margin: '20px auto', border: '1px solid #aaa', boxShadow: '0 0 20px rgba(0,0,0,0.1)', backgroundColor: '#fff', fontFamily: 'Times New Roman, Georgia, serif', position: 'relative', boxSizing: 'border-box' }}>
                <style>{`
                    @media print {
                        @page {
                            size: letter portrait;
                            margin: 10mm 12mm;
                        }
                        body {
                            background: white !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        /* Ocultar la barra navegadora superior, encabezados y el botón de impresión */
                        header, nav, footer, button, .no-print, [class*="nav"], [class*="Header"] {
                            display: none !important;
                        }
                        .certificado-imprimible {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            max-width: 100% !important;
                            margin: 0 !important;
                            padding: 20px 30px !important;
                            border: none !important;
                            box-shadow: none !important;
                            background: #fff !important;
                            page-break-inside: avoid !important;
                            page-break-after: avoid !important;
                        }
                    }
                `}</style>

                {/* CABECERA OFICIAL CONFIGURADA DINÁMICAMENTE POR EL INQUILINO (TENANT) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>

                    {/* Lado Izquierdo: Datos de la Junta */}
                    <div style={{ textAlign: 'left', fontSize: '13px', lineHeight: '1.4' }}>
                        {config?.cabeceraTexto || `${config?.nombreJunta || 'JUNTA DE VECINOS'}\nÑUÑOA`}
                    </div>

                    {/* Lado Derecho: Folio Dinámico Superior y Datos de Registro */}
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ textAlign: 'right', fontSize: '16px', fontWeight: 'bold', marginTop: '0', marginBottom: '5px', color: '#000' }}>
                            N° {solicitud.folioTexto || `FOLIO-${solicitud.correlativoSolicitud || '1000'}`}
                        </p>

                        {/* Datos Institucionales */}
                        <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                            {config?.rutJunta && <div>RUT: {config.rutJunta}</div>}
                            {config?.personalidadJuridica && <div>Personalidad Jurídica: {config.personalidadJuridica}</div>}
                        </div>
                    </div>

                </div>

                {/* TÍTULO */}
                <h1 style={{ textAlign: 'center', letterSpacing: '2px', fontSize: '24px', margin: '25px 0 20px 0', fontWeight: 'bold', color: '#000' }}>
                    CERTIFICADO DE RESIDENCIA
                </h1>

                {/* CUERPO DEL CERTIFICADO */}
                <div style={{ fontSize: '16px', lineHeight: '1.8', marginTop: '25px', textAlign: 'justify', padding: '0 5px' }}>
                    <p style={{ textIndent: '30px', margin: '0 0 15px 0' }}>
                        El Presidente de la organización comunal que suscribe, certifica en conformidad a la Ley Nº 19.418, Art. 43 letra f, que don(ña):
                        <strong style={{ marginLeft: '6px', textTransform: 'uppercase', fontSize: '17px' }}>{solicitud.nombre}</strong>,
                        Cédula Nacional de Identidad N° <strong>{solicitud.rut}</strong>, acreditó registrar domicilio definitivo en la jurisdicción correspondiente a la comuna de {config?.comuna || 'Ñuñoa'}, en la dirección:
                    </p>

                    <div style={{ textAlign: 'center', margin: '20px 0', padding: '12px', border: '1px double #333', fontSize: '19px', fontWeight: 'bold', color: '#1a252f', backgroundColor: '#fdfefe', letterSpacing: '0.5px' }}>
                        {solicitud.direccion}
                    </div>

                    <p style={{ margin: '0 0 10px 0' }}>En calidad jurídica de: <strong>{solicitud.calidadResidente || 'Residente'}</strong>.</p>
                    <p style={{ margin: '0' }}>Se extiende el presente documento a petición del interesado para ser presentado ante: <strong>{solicitud.destino || 'Trámites Varios'}</strong>.</p>
                </div>

                {/* BLOQUE DE CIERRE, FECHA Y FIRMA DIGITAL / TIMBRE SIMULADO */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '35px', padding: '0 10px' }}>

                    {/* Simulación del Timbre Húmedo Institucional */}
                    <div style={{ width: '110px', height: '110px', border: '2px dashed #1492ec', borderRadius: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#1492ec', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', transform: 'rotate(-8deg)', padding: '5px', opacity: 0.85, textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>
                        <div style={{ borderBottom: '1px solid #1492ec', paddingBottom: '2px', marginBottom: '2px', fontSize: '8px' }}>CONFORMIDAD DIGITAL</div>
                        <div>{config?.nombreJunta?.length > 25 ? 'ORGANIZACIÓN VECINAL' : (config?.nombreJunta || 'JUNTAS DE VECINOS')}</div>
                        <div style={{ fontSize: '9px', marginTop: '2px' }}>★ {config?.comuna || 'ÑUÑOA'} ★</div>
                    </div>

                    {/* Bloque de Firma Autorizada */}
                    <div style={{ width: '280px', textAlign: 'center', alignSelf: 'flex-end' }}>
                        <div style={{ color: '#2c3e50', fontStyle: 'italic', fontSize: '12px', marginBottom: '5px', fontFamily: 'Arial, sans-serif' }}>
                            ✓ Documento firmado electrónicamente
                        </div>
                        <div style={{ borderTop: '1px solid #333', paddingTop: '8px', whiteSpace: 'pre-line', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: '1.3' }}>
                            {config?.pieFirmaTexto || 'LA DIRECTIVA'}
                        </div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666', fontFamily: 'Arial, sans-serif' }}>
                            Fecha Emisión: {solicitud.fechaEmision || new Date().toLocaleDateString('es-CL')}
                        </p>
                    </div>
                </div>

                {/* PIE DE PÁGINA DE VERIFICACIÓN LEGAL */}
                <div style={{ marginTop: '25px', paddingTop: '12px', borderTop: '1px solid #ddd', fontSize: '11px', color: '#7f8c8d', textAlign: 'center', lineHeight: '1.4', fontFamily: 'Arial, sans-serif' }}>
                    <strong>NOTA:</strong> Este certificado se emite en conformidad a la Ley 19.418, Art.43, letra f, que sanciona al requirente que faltare a la verdad en cuanto a los datos proporcionados.
                    {config?.emailContacto && ` Verificación disponible vía correo en: ${config.emailContacto}.`}
                    <div style={{ fontWeight: 'bold', marginTop: '3px', color: '#2c3e50' }}>VIGENCIA POR 90 DÍAS</div>
                </div>

                {/* BOTÓN DE IMPRESIÓN EXCLUIDO DE LA IMPRESIÓN VÍA CLASE no-print */}
                <div className="no-print" style={{ marginTop: '30px', textAlign: 'center', fontFamily: 'Arial' }}>
                    <button
                        onClick={() => window.print()}
                        style={{ background: '#28a745', color: 'white', border: 'none', padding: '12px 25px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}
                    >
                        🖨️ Imprimir / Descargar PDF en mi Computador
                    </button>
                </div>
            </div>
        );
    }

    console.log("--- ENVIANDO AL VISOR ---", solicitud);

    // --- RENDEREADO VISTA 2: CASO RECHAZADO (Muestra la ficha del vecino a ambos, y botón de volver al operador) ---
    if (solicitud?.estado === 'Rechazado' || estadoLocal === 'Rechazado') {
        return (
            <div style={{ maxWidth: '600px', margin: '30px auto', padding: '30px', backgroundColor: '#fff', borderTop: '5px solid #dc3545', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontFamily: "'Outfit', Arial, sans-serif" }}>
                {!soloLecturaVecino && (
                    <button
                        onClick={onVolver}
                        style={{
                            background: '#475569', color: 'white', border: 'none',
                            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: '600', fontSize: '13px', marginBottom: '20px',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        ← Volver a la Bandeja
                    </button>
                )}
                <h2 style={{ color: '#c62828', fontSize: '20px', fontWeight: '700', marginTop: 0 }}>❌ Solicitud No Aprobada</h2>
                <p style={{ fontSize: '14px', color: '#1e293b' }}>Estimado/a <strong>{solicitud.nombre}</strong>,</p>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
                    Lamentamos informarle que su requerimiento de certificación de residencia administrado por <strong>{config.nombreJunta}</strong> ha sido rechazado tras la revisión de los documentos adjuntos.
                </p>

                <div style={{ backgroundColor: '#fff5f5', padding: '15px', border: '1px solid #feb2b2', borderRadius: '8px', margin: '20px 0', color: '#9b2c2c', fontSize: '14px' }}>
                    <strong>Motivo oficial indicado por el Operador:</strong><br />
                    <p style={{ marginTop: '5px', fontStyle: 'italic', fontSize: '14px', color: '#7f1d1d', margin: 0 }}>
                        "{solicitud.motivoRechazo || 'Documentación inconsistente con el domicilio declarado.'}"
                    </p>
                </div>

                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                    <strong>¿Cómo solucionar esto?</strong> No necesita pagar de nuevo. Modifique su archivo de respaldo según la instrucción indicada arriba y cargue nuevamente el trámite.
                </p>
            </div>
        );
    }



    const handleAprobar = async (e) => {
        e.preventDefault();

        const idReal = solicitud?.id || solicitud?._id;

        setEsperaTransicion(true);
        setEstadoLocal('Aprobado');
        setYaAprobadoLocal(true); // 👉 Bloquea el parpadeo protegiendo la vista

        // Mandamos la actualización al backend/padre y ESPERAMOS a que termine
        await onActualizarEstado(idReal, 'Aprobado');

        // Dejamos el certificado visible por 1.5 segundos antes de liberar el componente
        setTimeout(() => {
            setEsperaTransicion(false);
            // Si quieres que después de 1.5s vuelva al listado o recupere el flujo normal,
            // puedes quitar el comentario de la siguiente línea o dejar que onVolver() actúe si el padre desmonta el componente.
            // setYaAprobadoLocal(false); 
        }, 1500);
    };

    // --- RENDEREADO VISTA 3: INTERFAZ DE EVALUACIÓN PARA EL OPERADOR (PANTALLA DIVIDIDA) ---
    return (
        <div style={{ display: 'flex', height: '85vh', fontFamily: 'Arial', backgroundColor: '#fff' }}>

            {/* EXAMINADOR IZQUIERDO */}
            <div style={{ flex: 1, backgroundColor: '#f1f2f6', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '16px' }}>Evidencias a Validar</h3>

                {/* Las 3 Pestañas (se ocultan si hay zoom activo) */}
                {!imagenZoom && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            type="button"
                            onClick={() => setDocActivo('cedula')}
                            style={{ padding: '10px', flex: 1, background: docActivo === 'cedula' ? '#007bff' : '#fff', color: docActivo === 'cedula' ? '#fff' : '#000', border: '1px solid #ccc', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                        >
                            1. Cédula
                        </button>

                        <button
                            type="button"
                            onClick={() => setDocActivo('domicilio')}
                            style={{ padding: '10px', flex: 1, background: docActivo === 'domicilio' ? '#007bff' : '#fff', color: docActivo === 'domicilio' ? '#fff' : '#000', border: '1px solid #ccc', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                        >
                            2. {solicitud?.tipoDocDomicilio || 'Doc. Domicilio'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setDocActivo('pago')}
                            style={{ padding: '10px', flex: 1, background: docActivo === 'pago' ? '#007bff' : '#fff', color: docActivo === 'pago' ? '#fff' : '#000', border: '1px solid #ccc', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                        >
                            3. Comprobante Pago
                        </button>

                        <button
                            type="button"
                            onClick={() => setDocActivo('verificacion')}
                            style={{ padding: '10px', flex: 1, background: docActivo === 'verificacion' ? '#007bff' : '#fff', color: docActivo === 'verificacion' ? '#fff' : '#000', border: '1px solid #ccc', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                        >
                            🗺️ 4. Verificación de JJVV
                        </button>
                    </div>
                )}

                {/* Visor de Contenido Inteligente */}
                <div style={{ flex: 1, background: '#fff', border: '1px solid #ccc', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '5px', overflow: 'auto', padding: '15px', minHeight: '350px', position: 'relative' }}>

                    {/* MODO ZOOM: reemplaza las tabs con la imagen ampliada */}
                    {imagenZoom ? (
                        <div 
                            onClick={() => setImagenZoom(null)}
                            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'zoom-out' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }} onClick={(e) => e.stopPropagation()}>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af' }}>🔍 Vista ampliada — Panel de datos visible a la derecha</span>
                                <button
                                    onClick={() => setImagenZoom(null)}
                                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 14px', fontSize: '12px', fontWeight: '700', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    ✕ Cerrar zoom
                                </button>
                            </div>
                            <img
                                src={imagenZoom}
                                alt="Evidencia ampliada"
                                style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: 'calc(100% - 50px)', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
                            />
                        </div>
                    ) : (
                        <>
                            {docActivo !== 'verificacion' && (
                                <span style={{ fontSize: '13px', color: '#666', marginBottom: '10px', display: 'block', zIndex: 10 }}>
                                    💡 <em>Haz clic sobre la imagen para agrandarla y ver los detalles</em>
                                </span>
                            )}

                            {/* PESTAÑA 1: CÉDULA */}
                            {docActivo === 'cedula' && (
                                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                                    <p style={{ fontWeight: 'bold', color: '#64748b', marginBottom: '8px', fontSize: '13px' }}>Cédula de Identidad Cargada:</p>
                                    {solicitud?.urls?.cedula || solicitud?.urlCedula ? (
                                        <img
                                            src={solicitud?.urls?.cedula || solicitud?.urlCedula}
                                            alt="Cédula de Identidad"
                                            onClick={() => setImagenZoom(solicitud?.urls?.cedula || solicitud?.urlCedula)}
                                            style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '280px', display: 'block', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'zoom-in' }}
                                        />
                                    ) : (
                                        <p style={{ color: '#dc3545', fontSize: '13px' }}>⚠️ No se encontró el enlace de la cédula.</p>
                                    )}
                                </div>
                            )}

                            {/* PESTAÑA 2: DOMICILIO */}
                            {docActivo === 'domicilio' && (
                                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                                    <p style={{ fontWeight: 'bold', color: '#64748b', marginBottom: '8px', fontSize: '13px' }}>Evidencia de Domicilio Subida ({solicitud?.tipoDocDomicilio || 'Doc'}):</p>
                                    {solicitud?.urls?.domicilio || solicitud?.urlDomicilio ? (
                                        <img
                                            src={solicitud?.urls?.domicilio || solicitud?.urlDomicilio}
                                            alt="Documento Domicilio"
                                            onClick={() => setImagenZoom(solicitud?.urls?.domicilio || solicitud?.urlDomicilio)}
                                            style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '280px', display: 'block', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'zoom-in' }}
                                        />
                                    ) : (
                                        <p style={{ color: '#dc3545', fontSize: '13px' }}>⚠️ No se encontró el enlace del documento de domicilio.</p>
                                    )}
                                </div>
                            )}

                            {/* PESTAÑA 3: PAGO */}
                            {docActivo === 'pago' && (
                                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                                    <p style={{ fontWeight: 'bold', color: '#64748b', marginBottom: '10px', fontSize: '13px' }}>Comprobante de Transferencia Adjunto:</p>
                                    {solicitud?.urls?.pago || solicitud?.urls?.comprobantePago || solicitud?.urlPago ? (
                                        <img
                                            src={solicitud?.urls?.pago || solicitud?.urls?.comprobantePago || solicitud?.urlPago}
                                            alt="Comprobante de Pago"
                                            onClick={() => setImagenZoom(solicitud?.urls?.pago || solicitud?.urls?.comprobantePago || solicitud?.urlPago)}
                                            style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '280px', display: 'block', objectFit: 'contain', borderRadius: '4px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'zoom-in' }}
                                        />
                                    ) : (
                                        <p style={{ color: '#dc3545', fontSize: '13px' }}>⚠️ No se encontró el enlace del comprobante de pago.</p>
                                    )}
                                </div>
                            )}

                            {/* PESTAÑA 4: VERIFICACIÓN TERRITORIAL EN VIVO */}
                            {docActivo === 'verificacion' && (
                                <div style={{ width: '100%', padding: '10px', display: 'flex', flexDirection: 'column', gap: '15px', fontFamily: "'Outfit', sans-serif" }}>
                                    <h4 style={{ margin: 0, color: '#1e3a8a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', fontSize: '15px' }}>
                                        🗺️ Análisis Geográfico y Límite Territorial
                                    </h4>

                                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                                        <span style={{ color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Dirección de la Solicitud:</span>
                                        <strong style={{ color: '#0f172a', fontSize: '14px' }}>
                                            {solicitud.direccion?.toLowerCase().includes((config.comuna || 'ñuñoa').toLowerCase())
                                                ? solicitud.direccion
                                                : `${solicitud.direccion}, ${config.comuna || 'Ñuñoa'}`}
                                        </strong>
                                    </div>

                                    {geoLoading && (
                                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                            <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(37,99,235,0.2)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '10px' }}>Geolocalizando dirección y analizando cobertura...</p>
                                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                        </div>
                                    )}

                                    {geoError && (
                                        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '15px', borderRadius: '8px', fontSize: '13px' }}>
                                            <strong>⚠️ Estado de Validación:</strong> {geoError}
                                        </div>
                                    )}

                                    {geoResult && (
                                        <>
                                            {/* Coincidencia y semáforo */}
                                            {(() => {
                                                const esMismaJunta = geoResult.juntaSugerida.id === (juntaConfig?.id || solicitud?.idJunta || 'jjvv19');
                                                const esTolerable = geoResult.distanciaAOperador && geoResult.distanciaAOperador <= 1.5;

                                                let colorBg = '#fee2e2';
                                                let colorBorder = '#fca5a5';
                                                let colorText = '#991b1b';
                                                let titulo = '❌ Fuera de Jurisdicción (No Corresponde)';
                                                let desc = `La dirección ingresada se encuentra geográficamente muy alejada de su jurisdicción (${geoResult.distanciaAOperador ? geoResult.distanciaAOperador.toFixed(2) : '?'} km).`;

                                                if (esMismaJunta) {
                                                    colorBg = '#dcfce7';
                                                    colorBorder = '#86efac';
                                                    colorText = '#166534';
                                                    titulo = '✅ Dirección Válida (Corresponde a su JJVV)';
                                                    desc = 'La dirección ingresada se encuentra en la zona oficial de cobertura asignada a su Junta de Vecinos.';
                                                } else if (esTolerable) {
                                                    colorBg = '#fef3c7';
                                                    colorBorder = '#fde68a';
                                                    colorText = '#92400e';
                                                    titulo = '⚠️ Zona de Cobertura Cercana (Tolerancia)';
                                                    desc = `La dirección ingresada está asignada a otra JVV vecina, pero a sólo ${geoResult.distanciaAOperador ? geoResult.distanciaAOperador.toFixed(2) : '?'} km de su sede.`;
                                                }

                                                return (
                                                    <div style={{ backgroundColor: colorBg, border: `1px solid ${colorBorder}`, color: colorText, padding: '16px', borderRadius: '10px', fontSize: '13px' }}>
                                                        <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{titulo}</strong>
                                                        <span>{desc}</span>
                                                    </div>
                                                );
                                            })()}

                                            {/* Detalles y comparaciones */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                                                <div style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#fff' }}>
                                                    <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>📍 Junta Sugerida por GPS:</span>
                                                    <strong style={{ fontSize: '13px', color: '#1e293b' }}>{geoResult.juntaSugerida.name}</strong>
                                                    <div style={{ color: '#64748b', marginTop: '3px' }}>Sede a {geoResult.distanciaSugerida.toFixed(2)} km</div>
                                                </div>

                                                <div style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#fff' }}>
                                                    <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>🏛️ Su Junta (Operador):</span>
                                                    <strong style={{ fontSize: '13px', color: '#1e293b' }}>{geoResult.juntaOperadorData ? geoResult.juntaOperadorData.name : config.nombreJunta}</strong>
                                                    <div style={{ color: '#64748b', marginTop: '3px' }}>Sede a {geoResult.distanciaAOperador ? geoResult.distanciaAOperador.toFixed(2) : '?'} km de la dirección</div>
                                                </div>
                                            </div>

                                            {/* Observación sugerida */}
                                            {(() => {
                                                const esMismaJunta = geoResult.juntaSugerida.id === (juntaConfig?.id || solicitud?.idJunta || 'jjvv19');
                                                const colorBg = esMismaJunta ? '#eff6ff' : '#fff7ed';
                                                const colorBorder = esMismaJunta ? '#bfdbfe' : '#ffedd5';
                                                const colorText = esMismaJunta ? '#1e40af' : '#c2410c';
                                                const observacion = esMismaJunta
                                                    ? 'Coincide la Junta de Vecinos seleccionada. Se valida la elección de la junta de vecinos.'
                                                    : 'No coincide la junta de vecinos indicada por el vecino. Se sugiere rechazar por este aspecto.';

                                                return (
                                                    <div style={{ 
                                                        backgroundColor: colorBg, 
                                                        borderLeft: `5px solid ${esMismaJunta ? '#3b82f6' : '#ea580c'}`,
                                                        borderTop: `1px solid ${colorBorder}`,
                                                        borderBottom: `1px solid ${colorBorder}`,
                                                        borderRight: `1px solid ${colorBorder}`,
                                                        color: colorText, 
                                                        padding: '14px', 
                                                        borderRadius: '8px', 
                                                        fontSize: '13px',
                                                        lineHeight: '1.5',
                                                        fontWeight: '500'
                                                    }}>
                                                        <strong style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>📝 Observación para el Operador:</strong>
                                                        {observacion}
                                                    </div>
                                                );
                                            })()}

                                            <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', marginTop: '-5px' }}>
                                                * Geocodificación obtenida en base a la API pública de OpenStreetMap y base de datos territorial de la Ilustre Municipalidad de Ñuñoa.
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* COLUMNA DERECHA: PANEL DE CONTROL Y VERIFICACIÓN DE DATOS */}
            <div style={{ width: '420px', borderLeft: '1px solid #ccc', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: '#ffa500', fontSize: '13px' }}>⚠️ EVALUANDO ANTECEDENTES PARA:</span>
                        <button onClick={onVolver} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#999' }}>×</button>
                    </div>
                    <h4 style={{ margin: '5px 0 15px 0', color: '#2c3e50', fontSize: '15px' }}>{juntaConfig?.nombreJunta || 'Organización Vecinal'}</h4>

                    <div style={{ padding: '18px', backgroundColor: '#fcfcf1', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#2c3e50', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                            🔎 DATOS INGRESADOS POR EL VECINO
                        </h5>

                        <div style={{ fontSize: '13px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '8px', color: '#4a5568' }}>
                            <p style={{ margin: 0 }}>
                                <strong>Folio Trámite:</strong> <span style={{ fontWeight: 'bold', color: '#1a202c', fontSize: '14px', fontFamily: 'monospace' }}>{solicitud.folioTexto || `FOLIO-${solicitud.correlativoSolicitud || '1000'}`}</span>
                            </p>
                            <p style={{ margin: 0 }}>
                                <strong>Nombre completo ingresado:</strong> <span style={{ fontWeight: 'bold', color: '#1a202c' }}>{solicitud.nombre}</span>
                            </p>
                            <p style={{ margin: 0 }}>
                                <strong>Rut ingresado:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1a202c' }}>{solicitud.rut}</span>
                            </p>
                            <p style={{ margin: 0 }}>
                                <strong>Dirección ingresada:</strong> <br />
                                <span style={{ color: '#2b6cb0', fontWeight: 'bold' }}>
                                    {solicitud.direccion}, {solicitud.comuna || juntaConfig?.comuna || 'Ñuñoa'}
                                </span>
                            </p>
                            <p style={{ margin: 0, borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                                <strong>Monto a pagar:</strong> <span style={{ fontWeight: 'bold', color: '#2d3748' }}>${solicitud.montoPago || juntaConfig?.valorCertificado} CLP</span>
                            </p>
                            <p style={{ margin: 0 }}>
                                <strong>Email:</strong> <span style={{ color: '#0056b3', fontWeight: 'bold' }}>{solicitud.email}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* 🎛️ BLOQUE DE ACCIONES CORREGIDO (PASO 3) */}
                {(!soloLecturaVecino && solicitud?.estado === 'Pendiente') && (
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', border: '1px solid #e2e8f0', marginTop: '15px' }}>
                        {!mostrarBloqueRechazo ? (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setMostrarBloqueRechazo(true)}
                                    style={{ flex: 1, background: '#dc3545', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    RECHAZAR
                                </button>

                                {/* BOTÓN APROBAR OPTIMIZADO PARA FORZAR EL PDF CON RETARDO */}
                                <button
                                    onClick={handleAprobar}
                                    disabled={esperaTransicion}
                                    style={{
                                        flex: 1,
                                        background: esperaTransicion ? '#6c757d' : '#28a745', // Se pone gris al procesar
                                        color: 'white',
                                        padding: '12px',
                                        border: 'none',
                                        fontWeight: 'bold',
                                        borderRadius: '4px',
                                        cursor: esperaTransicion ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {esperaTransicion ? 'GENERANDO CERTIFICADO...' : 'APROBAR'}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '13px' }}>Razón del Rechazo:</label>
                                <textarea
                                    rows="3"
                                    style={{ width: '100%', marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '13px' }}
                                    placeholder="Ej: La dirección del documento de luz no coincide con la ingresada."
                                    value={motivoRechazo}
                                    onChange={(e) => setMotivoRechazo(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => setMostrarBloqueRechazo(false)}
                                        style={{ flex: 1, background: '#6c757d', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                    >
                                        Atrás
                                    </button>
                                    <button
                                        onClick={() => { onActualizarEstado(solicitud?.id || solicitud?._id, 'Rechazado', motivoRechazo); onVolver(); }}
                                        style={{ flex: 1, background: '#dc3545', color: 'white', border: 'none', padding: '8px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                    >
                                        Confirmar Rechazo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 💡 MENSAJE INFORMATIVO SI YA FUE PROCESADA EN ESTA VISTA */}
                {solicitud?.estado !== 'Pendiente' && (
                    <div style={{ marginTop: '15px', padding: '12px', backgroundColor: solicitud?.estado === 'Aprobado' ? '#e2fbe8' : '#fce8e6', color: solicitud?.estado === 'Aprobado' ? '#1e7e34' : '#bd2130', borderRadius: '5px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: `1px solid ${solicitud?.estado === 'Aprobado' ? '#94d3a2' : '#f5c6cb'}` }}>
                        {solicitud?.estado === 'Aprobado' ? '✅ Esta solicitud ya fue Aprobada' : '❌ Esta solicitud fue Rechazada'}
                    </div>
                )}
            </div>


        </div>
    );
}
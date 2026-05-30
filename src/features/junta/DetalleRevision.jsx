import React, { useState } from 'react';

export default function DetalleRevision({ solicitud, onActualizarEstado, onVolver, soloLecturaVecino = false, juntaConfig }) {
    const [docActivo, setDocActivo] = useState('cedula'); // Puede ser 'cedula', 'domicilio' o 'pago'
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [mostrarBloqueRechazo, setMostrarBloqueRechazo] = useState(false);

    // ✨ NUEVO ESTADO: Guarda la URL de la imagen que se quiere agrandar (null si ninguna está agrandada)
    const [imagenZoom, setImagenZoom] = useState(null);

    // Fallback seguro en caso de que por alguna razón no venga juntaConfig
    const config = juntaConfig || {
        nombreJunta: 'Organización Vecinal',
        rutJunta: 'XX.XXX.XXX-X',
        cabeceraTexto: 'ORGANIZACIÓN VECINAL DE ÑUÑOA',
        pieFirmaTexto: 'LA DIRECTIVA',
        comuna: 'Ñuñoa'
    };

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

    // --- RENDEREADO VISTA 1: CERTIFICADO EMITIDO Y APROBADO (VISTA SAAS DINÁMICA) ---
    if (solicitud.estado === 'Aprobado') {
        return (
            <div style={{ padding: '40px', maxWidth: '750px', margin: '20px auto', border: '1px solid #aaa', boxShadow: '0 0 20px rgba(0,0,0,0.1)', backgroundColor: '#fff', fontFamily: 'Times New Roman, Georgia, serif', position: 'relative' }}>

                {/* CABECERA OFICIAL CONFIGURADA DINÁMICAMENTE POR EL INQUILINO (TENANT) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                    <div style={{ textAlign: 'left', fontSize: '13px', lineHeight: '1.4', whiteSpace: 'pre-line', textTransform: 'uppercase', fontStyle: 'normal', color: '#2c3e50', fontWeight: 'bold' }}>
                        {config.cabeceraTexto || `${config.nombreJunta}\nÑUÑOA`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#7f8c8d', textAlign: 'right' }}>
                        {config.rutJunta && <div>RUT: {config.rutJunta}</div>}
                        {config.personalidadJuridica && <div>{config.personalidadJuridica}</div>}
                    </div>
                </div>

                {/* TÍTULO Y CORRELATIVO */}
                <h1 style={{ textAlign: 'center', letterSpacing: '2px', fontSize: '26px', margin: '30px 0 10px 0', fontWeight: 'bold', color: '#000' }}>
                    CERTIFICADO DE RESIDENCIA
                </h1>
                <p style={{ textAlign: 'right', fontSize: '16px', fontWeight: 'bold', marginTop: '0', marginRight: '10px' }}>
                    N° {config.id === 'nuevaJunta' ? '000001 (DEMO)' : (solicitud.id || config.correlativoInicial)}
                </p>

                {/* CUERPO DEL CERTIFICADO */}
                <div style={{ fontSize: '18px', lineHeight: '2', marginTop: '40px', textAlign: 'justify', padding: '0 10px' }}>
                    <p style={{ textIndent: '30px' }}>
                        El Presidente de la organización comunal que suscribe, certifica en conformidad a la Ley Nº 19.418, Art. 43 letra f, que don(ña):
                        <strong style={{ marginLeft: '8px', textTransform: 'uppercase', fontSize: '19px' }}>{solicitud.nombre}</strong>,
                        Cédula Nacional de Identidad N° <strong>{solicitud.rut}</strong>, acreditó registrar domicilio definitivo en la jurisdicción correspondiente a la comuna de {config.comuna || 'Ñuñoa'}, en la dirección:
                    </p>

                    <div style={{ textAlign: 'center', margin: '30px 0', padding: '15px', border: '1px double #333', fontSize: '21px', fontWeight: 'bold', color: '#1a252f', backgroundColor: '#fdfefe', letterSpacing: '0.5px' }}>
                        {solicitud.direccion}
                    </div>

                    <p>En calidad jurídica de: <strong>{solicitud.calidadResidente || 'Residente'}</strong>.</p>
                    <p>Se extiende el presente documento a petición del interesado para ser presentado ante: <strong>{solicitud.destino || 'Trámites Varios'}</strong>.</p>
                </div>

                {/* BLOQUE DE CIERRE, FECHA Y FIRMA DIGITAL / TIMBRE SIMULADO */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '60px', padding: '0 20px' }}>

                    {/* Simulación del Timbre Húmedo Institucional */}
                    <div style={{ width: '120px', height: '120px', border: '2px dashed #1492ec', borderRadius: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#1492ec', fontSize: '10px', fontWeight: 'bold', textAlign: 'center', transform: 'rotate(-8deg)', padding: '5px', opacity: 0.85, textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>
                        <div style={{ borderBottom: '1px solid #1492ec', paddingBottom: '2px', marginBottom: '2px', fontSize: '8px' }}>CONFORMIDAD DIGITAL</div>
                        <div>{config.nombreJunta.length > 25 ? 'ORGANIZACIÓN VECINAL' : config.nombreJunta}</div>
                        <div style={{ fontSize: '9px', marginTop: '3px' }}>★ {config.comuna || 'ÑUÑOA'} ★</div>
                    </div>

                    {/* Bloque de Firma Autorizada */}
                    <div style={{ width: '280px', textAlign: 'center', alignSelf: 'flex-end' }}>
                        <div style={{ color: '#2c3e50', fontStyle: 'italic', fontSize: '12px', marginBottom: '5px', fontFamily: 'Arial, sans-serif' }}>
                            ✓ Documento firmado electrónicamente
                        </div>
                        <div style={{ borderTop: '1px solid #333', paddingTop: '8px', whiteSpace: 'pre-line', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: '1.3' }}>
                            {config.pieFirmaTexto || 'LA DIRECTIVA'}
                        </div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666', fontFamily: 'Arial, sans-serif' }}>
                            Fecha Emisión: {solicitud.fechaEmision || new Date().toLocaleDateString('es-CL')}
                        </p>
                    </div>
                </div>

                {/* PIE DE PÁGINA DE VERIFICACIÓN LEGAL */}
                <div style={{ marginTop: '5px', paddingTop: '15px', borderTop: '1px solid #ddd', fontSize: '11px', color: '#7f8c8d', textAlign: 'center', lineHeight: '1.4', fontFamily: 'Arial, sans-serif' }}>
                    <strong>NOTA:</strong> Este certificado se emite en conformidad a la Ley 19.418, Art.43, letra f, que sanciona al requirente que faltare a la verdad en cuanto a los datos proporcionados.
                    {config.emailContacto && ` Verificación disponible vía correo en: ${config.emailContacto}.`}
                    <div style={{ fontWeight: 'bold', marginTop: '3px', color: '#2c3e50' }}>VIGENCIA POR 90 DÍAS</div>
                </div>

                {/* BOTÓN EXCLUSIVO DE DESCARGA */}
                {soloLecturaVecino && (
                    <div style={{ marginTop: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
                        <button
                            onClick={() => window.print()}
                            style={{ background: '#28a745', color: 'white', border: 'none', padding: '12px 25px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}
                        >
                            🖨️ Imprimir / Descargar PDF en mi Computador
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // --- RENDEREADO VISTA 2: CASO RECHAZADO EN VISTA EXCLUSIVA DEL VECINO ---
    if (soloLecturaVecino && solicitud.estado === 'Rechazado') {
        return (
            <div style={{ maxWidth: '600px', margin: '30px auto', padding: '30px', backgroundColor: '#fff', borderTop: '5px solid #dc3545', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontFamily: 'Arial' }}>
                <h2 style={{ color: '#c62828' }}>❌ Solicitud No Aprobada</h2>
                <p>Estimado/a <strong>{solicitud.nombre}</strong>,</p>
                <p>Lamentamos informarle que su requerimiento de certificación de residencia administrado por <strong>{config.nombreJunta}</strong> ha sido rechazado tras la revisión de los documentos adjuntos.</p>

                <div style={{ backgroundColor: '#fff5f5', padding: '15px', border: '1px solid #feb2b2', borderRadius: '5px', margin: '20px 0', color: '#9b2c2c' }}>
                    <strong>Motivo oficial indicado por el Operador:</strong><br />
                    <p style={{ marginTop: '5px', fontStyle: 'italic', fontSize: '15px' }}>"{solicitud.motivoRechazo || 'Documentación inconsistente con el domicilio declarado.'}"</p>
                </div>

                <p style={{ fontSize: '14px', color: '#555' }}><strong>¿Cómo solucionar esto?</strong> No necesita pagar de nuevo. Modifique su archivo de respaldo según la instrucción indicada arriba y cargue nuevamente el trámite.</p>
            </div>
        );
    }

    // --- RENDEREADO VISTA 3: INTERFAZ DE EVALUACIÓN PARA EL OPERADOR (PANTALLA DIVIDIDA) ---
    return (
        <div style={{ display: 'flex', height: '85vh', fontFamily: 'Arial', backgroundColor: '#fff' }}>

            {/* EXAMINADOR IZQUIERDO */}
            <div style={{ flex: 1, backgroundColor: '#f1f2f6', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '16px' }}>Evidencias a Validar</h3>

                {/* Las 3 Pestañas */}
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
                </div>

                {/* Visor de Contenido Inteligente con Lupa y Zoom */}
                <div style={{ flex: 1, background: '#fff', border: '1px solid #ccc', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '5px', overflow: 'hidden', padding: '15px', minHeight: '350px' }}>
                    <span style={{ fontSize: '13px', color: '#666', marginBottom: '10px', display: 'block' }}>
                        💡 <em>Haz clic sobre la imagen para agrandarla y ver los detalles</em>
                    </span>

                    {/* PESTAÑA 1: CÉDULA */}
                    {docActivo === 'cedula' && (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ fontWeight: 'bold', color: '#64748b', marginBottom: '8px', fontSize: '13px' }}>Cédula de Identidad Cargada:</p>
                            <img
                                src={solicitud?.urls?.cedula || "https://via.placeholder.com/450x280?text=Simulacion+Cedula+Identidad"}
                                alt="Cédula de Identidad"
                                onClick={() => setImagenZoom(obtenerImagenActiva())}
                                style={{ maxWidth: '95%', maxHeight: '290px', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'zoom-in', transition: 'transform 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/450x280?text=Simulacion+Cedula+Identidad";
                                }}
                            />
                        </div>
                    )}

                    {/* PESTAÑA 2: DOMICILIO */}
                    {docActivo === 'domicilio' && (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ fontWeight: 'bold', color: '#64748b', marginBottom: '8px', fontSize: '13px' }}>Evidencia de Domicilio Subida:</p>
                            {solicitud?.urls?.domicilio ? (
                                <img
                                    src={solicitud.urls.domicilio}
                                    alt="Documento Domicilio Real"
                                    onClick={() => setImagenZoom(obtenerImagenActiva())}
                                    style={{ maxWidth: '95%', maxHeight: '290px', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'zoom-in', transition: 'transform 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/500x600?text=Error+al+cargar+archivo";
                                    }}
                                />
                            ) : (
                                <p style={{ color: '#718096', fontSize: '13px' }}>No se ha cargado ningún documento de domicilio.</p>
                            )}
                        </div>
                    )}

                    {/* PESTAÑA 3: PAGO */}
                    {docActivo === 'pago' && (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ fontWeight: 'bold', color: '#64748b', marginBottom: '10px', fontSize: '13px' }}>Comprobante de Transferencia Adjunto:</p>
                            {(solicitud?.urls?.pago || solicitud?.urls?.comprobantePago) ? (
                                <img
                                    src={solicitud?.urls?.pago || solicitud?.urls?.comprobantePago}
                                    alt="Comprobante de Pago Real"
                                    onClick={() => setImagenZoom(obtenerImagenActiva())}
                                    style={{ maxWidth: '95%', maxHeight: '290px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'zoom-in', transition: 'transform 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/450x280?text=Comprobante+de+Pago";
                                    }}
                                />
                            ) : (
                                <p style={{ color: '#718096', fontSize: '13px' }}>No se ha cargado comprobante de pago.</p>
                            )}
                        </div>
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
                                <strong>Folio Trámite:</strong> <span style={{ fontWeight: 'bold', color: '#1a202c', fontSize: '14px', fontFamily: 'monospace' }}>{solicitud.id}</span>
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

                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', border: '1px solid #e2e8f0', marginTop: '15px' }}>
                    {!mostrarBloqueRechazo ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setMostrarBloqueRechazo(true)}
                                style={{ flex: 1, background: '#dc3545', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                RECHAZAR
                            </button>
                            <button
                                onClick={() => { onActualizarEstado(solicitud.id, 'Aprobado'); onVolver(); }}
                                style={{ flex: 1, background: '#28a745', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                APROBAR
                            </button>
                        </div>
                    ) : (
                        <div>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '13px' }}>Razón del `Rechazo`:</label>
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
                                    onClick={() => { onActualizarEstado(solicitud.id, 'Rechazado', motivoRechazo); onVolver(); }}
                                    style={{ flex: 1, background: '#dc3545', color: 'white', border: 'none', padding: '8px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Confirmar Rechazo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ================================================================ */}
            {/* MODAL INTERACTIVO DE ZOOM GIGANTE                                */}
            {/* ================================================================ */}
            {imagenZoom && (
                <div
                    onClick={() => setImagenZoom(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        zIndex: 9999,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '40px',
                        boxSizing: 'border-box',
                        cursor: 'zoom-out'
                    }}
                >
                    <button
                        onClick={() => setImagenZoom(null)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '30px',
                            background: '#ff4d4d',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}
                    >
                        ✕ CERRAR ZOOM
                    </button>

                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',          // 👈 Forzamos a que use el ancho disponible...
                            maxWidth: '500px',      // 👈 ...pero con un tope de 500px para que no se desarme si la pantalla es gigante
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column', // Asegura el orden interno
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            padding: '20px',        // Un espacio limpio alrededor del documento
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                            overflowY: 'auto'       // Si la pantalla es muy chica, permitirá scroll en vez de aplastarse
                        }}
                    >
                        <img
                            src={imagenZoom}
                            alt="Evidencia ampliada"
                            onClick={() => setImagenZoom(null)} // 👈 ¡La magia está aquí! Al hacer click, se cierra el zoom.
                            style={{
                                display: 'block',
                                width: '100%',
                                height: 'auto',
                                maxHeight: '75vh',
                                objectFit: 'contain',
                                cursor: 'zoom-out' // 👈 Cambiamos el cursor a "zoom-out" (la lupita con el signo menos) para indicarle al usuario que se puede cerrar ahí.
                            }}
                        />
                    </div>
                </div>
            )}

        </div>
    );
}
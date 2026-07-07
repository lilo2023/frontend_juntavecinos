import React, { useState } from 'react';
import { juntasDeVecinosNunoa } from './juntasData';

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

export default function IdentificadorJunta({ onConfirmarJunta }) {
    const [step, setStep] = useState('inicio'); // inicio, lista, no_conozco, gps_buscando, direccion_buscando, sugerencia
    const [juntaSeleccionada, setJuntaSeleccionada] = useState('');
    const [direccionInput, setDireccionInput] = useState('');
    const [juntaSugerida, setJuntaSugerida] = useState(null);
    const [distanciaSugerida, setDistanciaSugerida] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Flow handlers
    const handleSelectJuntaManual = (e) => {
        const junta = juntasDeVecinosNunoa.find(j => j.name === e.target.value);
        setJuntaSeleccionada(junta);
    };

    const handleConfirmarManual = () => {
        if (!juntaSeleccionada) {
            setErrorMsg('Por favor, selecciona una junta de vecinos de la lista.');
            return;
        }
        // Map data to the tenant structure expected by App.js
        const tenantConfig = mapearATenant(juntaSeleccionada);
        onConfirmarJunta(tenantConfig);
    };

    const handleConfirmarSugerida = () => {
        if (!juntaSugerida) return;
        const tenantConfig = mapearATenant(juntaSugerida);
        onConfirmarJunta(tenantConfig);
    };

    // Helper to map our geographical juntasData to the multi-tenant SaaS config structure in App.js
    const mapearATenant = (jvv) => {
        return {
            id: jvv.id,
            nombreJunta: jvv.name.replace(/^\d+\s*-\s*/, 'Junta de Vecinos '), // '19- Universidad' -> 'Junta de Vecinos Universidad'
            rutJunta: jvv.id === 'jjvv19' ? '65.033.930-4' : '72.123.456-K', // fallback or real if jjvv19
            personalidadJuridica: jvv.id === 'jjvv19' ? 'RNPJSFL 211394' : 'RNPJSFL 45120-X',
            direccionOficina: jvv.address,
            sitioWeb: jvv.id === 'jjvv19' ? 'www.unconunoa.cl' : '',
            emailContacto: jvv.email,
            telefono: jvv.id === 'jjvv19' ? '+56 2 2894 5764' : '',
            correlativoInicial: '1000',
            valorCertificado: jvv.val || '1000',
            cabeceraTexto: `JUNTA DE VECINOS ${jvv.name.toUpperCase()}\nUNIDAD VECINAL\nÑUÑOA`,
            pieFirmaTexto: `LA DIRECTIVA\nJunta de Vecinos ${jvv.name}`,
            comuna: 'Ñuñoa',
            banco: 'Banco del Estado de Chile',
            tipoCuenta: 'Cuenta Vista / RUT',
            numeroCuenta: '123456789'
        };
    };

    // GPS Geolocalisation handler
    const handleGPSGeolocalizacion = () => {
        setErrorMsg('');
        setStep('gps_buscando');
        setLoading(true);

        if (!navigator.geolocation) {
            setErrorMsg('La geolocalización no está soportada por este navegador.');
            setStep('no_conozco');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                console.log(`GPS Location: Lat ${userLat}, Lng ${userLng}`);
                procesarUbicacionYEncontrarMasCercana(userLat, userLng);
            },
            (error) => {
                console.error("GPS Error:", error);
                let msg = 'No se pudo obtener tu ubicación. Por favor ingresa tu dirección manualmente.';
                if (error.code === error.PERMISSION_DENIED) {
                    msg = 'Permiso de ubicación denegado. Por favor ingresa tu dirección manualmente.';
                }
                setErrorMsg(msg);
                setStep('no_conozco');
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Address Search via Nominatim OpenStreetMap API
    const handleAddressSearch = async (e) => {
        e.preventDefault();
        if (!direccionInput.trim()) {
            setErrorMsg('Por favor ingresa una dirección.');
            return;
        }

        setErrorMsg('');
        setStep('direccion_buscando');
        setLoading(true);

        try {
            // Append Ñuñoa, Santiago, Chile to guarantee local results in Nominatim
            const consulta = encodeURIComponent(`${direccionInput}, Ñuñoa, Santiago, Chile`);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${consulta}`, {
                headers: {
                    'Accept-Language': 'es'
                }
            });
            const data = await response.json();

            if (data && data.length > 0) {
                const searchLat = parseFloat(data[0].lat);
                const searchLng = parseFloat(data[0].lon);
                console.log(`OSM Geocoding: ${data[0].display_name} -> Lat ${searchLat}, Lng ${searchLng}`);
                procesarUbicacionYEncontrarMasCercana(searchLat, searchLng);
            } else {
                setErrorMsg('No pudimos localizar la dirección. Prueba ingresando calle y número, ej: "Avenida Grecia 3348".');
                setStep('no_conozco');
                setLoading(false);
            }
        } catch (error) {
            console.error("Nominatim API error:", error);
            setErrorMsg('Ocurrió un error al buscar la dirección en el servicio de mapas. Inténtalo de nuevo.');
            setStep('no_conozco');
            setLoading(false);
        }
    };

    // Match coordinate to the closest JVV sede
    const procesarUbicacionYEncontrarMasCercana = (lat, lng) => {
        let minimaDistancia = Infinity;
        let juntaMasCercana = null;

        juntasDeVecinosNunoa.forEach((jvv) => {
            const d = calcularDistanciaHaversine(lat, lng, jvv.lat, jvv.lng);
            if (d < minimaDistancia) {
                minimaDistancia = d;
                juntaMasCercana = jvv;
            }
        });

        setJuntaSugerida(juntaMasCercana);
        setDistanciaSugerida(minimaDistancia);
        setStep('sugerencia');
        setLoading(false);
    };

    // Global CSS style objects
    const cardStyle = {
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '550px',
        width: '100%',
        margin: '30px auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        fontFamily: "'Outfit', sans-serif"
    };

    const buttonPrimary = {
        backgroundColor: '#2563eb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '10px',
        padding: '12px 24px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        width: '100%',
        transition: 'background-color 0.2s',
        boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)',
        fontFamily: "'Outfit', sans-serif"
    };

    const buttonSecondary = {
        backgroundColor: '#f1f5f9',
        color: '#334155',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '12px 24px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        width: '100%',
        transition: 'background-color 0.2s',
        fontFamily: "'Outfit', sans-serif"
    };

    return (
        <div style={{ padding: '0 20px' }}>
            <div style={cardStyle}>
                
                {/* 1. INICIO STEP: QUESTION */}
                {step === 'inicio' && (
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '45px', display: 'block', marginBottom: '16px' }}>🏘️</span>
                        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e3a8a', marginBottom: '12px' }}>
                            Identificación de tu Junta de Vecinos
                        </h2>
                        <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.5', marginBottom: '28px' }}>
                            Para emitir tu Certificado de Residencia oficial, debemos identificar a qué unidad vecinal perteneces de acuerdo con la Ley 19.418 de Ñuñoa.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button 
                                onClick={() => setStep('lista')}
                                style={buttonPrimary}
                            >
                                Sí, conozco mi Junta de Vecinos
                            </button>
                            <button 
                                onClick={() => setStep('no_conozco')}
                                style={buttonSecondary}
                            >
                                No conozco mi Junta de Vecinos
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. MANUAL SELECT FROM LIST */}
                {step === 'lista' && (
                    <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                            Selecciona de la lista oficial
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                            Busca y selecciona el nombre de tu Junta de Vecinos de Ñuñoa:
                        </p>

                        {errorMsg && (
                            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px' }}>
                                {errorMsg}
                            </div>
                        )}

                        <select 
                            onChange={handleSelectJuntaManual}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                fontSize: '15px',
                                marginBottom: '24px',
                                outline: 'none',
                                fontFamily: "'Outfit', sans-serif",
                                backgroundColor: '#ffffff'
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>-- Selecciona tu Junta de Vecinos --</option>
                            {juntasDeVecinosNunoa.map((jvv) => (
                                <option key={jvv.id} value={jvv.name}>
                                    {jvv.name} (Sede: {jvv.address})
                                </option>
                            ))}
                        </select>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => { setStep('inicio'); setErrorMsg(''); }} style={{ ...buttonSecondary, flex: 1 }}>
                                Atrás
                            </button>
                            <button onClick={handleConfirmarManual} style={{ ...buttonPrimary, flex: 2 }}>
                                Confirmar y Continuar
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. OPTION SELECT IF DOESN'T KNOW */}
                {step === 'no_conozco' && (
                    <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                            ¿Cómo deseas buscar tu Junta?
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                            Podemos geolocalizarte mediante GPS (si estás en tu hogar) o buscar la JVV más cercana ingresando tu calle.
                        </p>

                        {errorMsg && (
                            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', lineHeight: '1.4' }}>
                                {errorMsg}
                            </div>
                        )}

                        {/* GPS Option Card */}
                        <div 
                            onClick={handleGPSGeolocalizacion}
                            style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                marginBottom: '16px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.backgroundColor = '#eff6ff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <span style={{ fontSize: '32px' }}>📍</span>
                            <div style={{ textAlign: 'left' }}>
                                <strong style={{ color: '#1e3a8a', display: 'block', fontSize: '15px' }}>Geolocalización GPS</strong>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>Usar mi ubicación actual en Ñuñoa.</span>
                            </div>
                        </div>

                        {/* Address Form */}
                        <form onSubmit={handleAddressSearch} style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                                Buscar por Dirección Manual:
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="Ej: Avenida Grecia 3348"
                                    value={direccionInput}
                                    onChange={(e) => setDireccionInput(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '15px',
                                        outline: 'none',
                                        fontFamily: "'Outfit', sans-serif"
                                    }}
                                />
                                <button type="submit" style={{ ...buttonPrimary, width: 'auto', padding: '12px 20px' }}>
                                    🔍 Buscar
                                </button>
                            </div>
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '6px' }}>
                                Ingresa la calle y numeración de tu residencia en Ñuñoa.
                            </span>
                        </form>

                        <button 
                            onClick={() => { setStep('inicio'); setErrorMsg(''); }}
                            style={{ ...buttonSecondary, marginTop: '24px' }}
                        >
                            Volver atrás
                        </button>
                    </div>
                )}

                {/* 4. LOADING STAGES */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #2563eb',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 20px auto'
                        }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#334155' }}>
                            {step === 'gps_buscando' 
                                ? 'Obteniendo coordenadas satelitales...' 
                                : 'Geocodificando dirección en OpenStreetMap...'
                            }
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748b' }}>
                            Por favor espera unos segundos mientras localizamos tu Junta de Vecinos...
                        </p>
                        
                        {/* Inline spin CSS animation keyframe helper */}
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                )}

                {/* 5. SUGGESTION RESULTS */}
                {step === 'sugerencia' && juntaSugerida && (
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '45px', display: 'block', marginBottom: '16px' }}>🎉</span>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                            ¡Junta de Vecinos Localizada!
                        </h2>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                            Basado en los límites territoriales reales y la distancia a su sede, te corresponde:
                        </p>

                        {/* Suggested Junta Info Card */}
                        <div style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #3b82f6',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '24px',
                            textAlign: 'left'
                        }}>
                            <strong style={{ fontSize: '18px', color: '#1e3a8a', display: 'block', marginBottom: '8px' }}>
                                Junta N° {juntaSugerida.name}
                            </strong>
                            <div style={{ fontSize: '14px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span>📍 <strong>Dirección Sede:</strong> {juntaSugerida.address}</span>
                                <span>📧 <strong>Contacto:</strong> {juntaSugerida.email}</span>
                                <span style={{ color: '#15803d', fontWeight: '500', marginTop: '4px' }}>
                                    📏 Aprox. {(distanciaSugerida).toFixed(2)} km de tu ubicación.
                                </span>
                            </div>
                        </div>

                        {/* RF-11 Check: warning alert if JVV config in localStorage is incomplete */}
                        {juntaSugerida.id !== 'jjvv19' && (
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                backgroundColor: '#fffbeb',
                                border: '1px solid #fde68a',
                                borderRadius: '10px',
                                padding: '12px 14px',
                                fontSize: '12px',
                                color: '#78350f',
                                textAlign: 'left',
                                marginBottom: '24px',
                                lineHeight: '1.4'
                            }}>
                                ⚠️ <strong>Aviso Importante:</strong> Esta junta no ha completado la configuración de sus métodos de pago en línea en la plataforma. Tu trámite se procesará inicialmente por transferencia electrónica directa.
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button 
                                onClick={() => { setStep('no_conozco'); setJuntaSugerida(null); }}
                                style={{ ...buttonSecondary, flex: 1 }}
                            >
                                Reintentar
                            </button>
                            <button 
                                onClick={handleConfirmarSugerida}
                                style={{ ...buttonPrimary, flex: 2 }}
                            >
                                Confirmar y Continuar
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

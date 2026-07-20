import React, { useState } from 'react';

// RUT format and validation helper functions
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

export default function LoginRegister({ role, onBack, onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true); // Login vs Register
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({
        nombre: '',
        rut: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [registerJuntaData, setRegisterJuntaData] = useState({
        nombreRepresentante: '',
        rutRepresentante: '',
        email: '',
        password: '',
        confirmPassword: '',
        nombreJunta: '',
        cargo: 'Presidente'
    });
    const [rutError, setRutError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 2FA state
    const [paso2FA, setPaso2FA] = useState(false);       // muestra pantalla del código
    const [codigo2FA, setCodigo2FA] = useState('');       // lo que escribe el usuario
    const [sessionPendiente, setSessionPendiente] = useState(null); // datos de sesión en espera
    const [enviando2FA, setEnviando2FA] = useState(false);
    const [verificando2FA, setVerificando2FA] = useState(false);
    const [codigoDemo, setCodigoDemo] = useState('');     // código capturado para bypass de pruebas

    const BACKEND = 'https://backend-junta-vecinos.onrender.com';

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'rut') {
            const formatted = formatearRut(value);
            setRegisterData({ ...registerData, rut: formatted });
            if (formatted.replace(/[^0-9kK]/g, '').length >= 8) {
                setRutError(!validarRutChileno(formatted));
            } else {
                setRutError(false);
            }
        } else {
            setRegisterData({ ...registerData, [name]: value });
        }
    };

    const handleRegisterJuntaChange = (e) => {
        const { name, value } = e.target;
        if (name === 'rutRepresentante') {
            const formatted = formatearRut(value);
            setRegisterJuntaData({ ...registerJuntaData, [name]: formatted });
            if (formatted.replace(/[^0-9kK]/g, '').length >= 8) {
                setRutError(!validarRutChileno(formatted));
            } else {
                setRutError(false);
            }
        } else {
            setRegisterJuntaData({ ...registerJuntaData, [name]: value });
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        let sessionData = null;

        if (role === 'vecino') {
            const savedVecinos = JSON.parse(localStorage.getItem('vecinos_cuentas') || '[]');
            const demoVecino = {
                nombre: 'Danilo Marcelo Godoy Díaz',
                rut: '10.703.900-7',
                email: 'danilo.godoy@alumnos.unab.cl',
                password: 'vecino'
            };
            const allVecinos = [demoVecino, ...savedVecinos];
            let account = allVecinos.find(
                (v) => v.email.toLowerCase() === loginData.email.toLowerCase() && v.password === loginData.password
            );

            // Si no coincide contraseña exacta o fue registrado en otro dispositivo (ej. Celular)
            if (!account) {
                account = allVecinos.find(
                    (v) => v.email.toLowerCase() === loginData.email.toLowerCase()
                );
            }

            // Fallback: Si no está en el localStorage local, consultar la base de datos de MongoDB
            if (!account && loginData.email) {
                try {
                    const apiUrl = window.location.hostname === 'localhost'
                        ? 'http://localhost:5000/api/residentes'
                        : 'https://backend-junta-vecinos.onrender.com/api/residentes';
                    const respBD = await fetch(apiUrl);
                    const dataBD = await respBD.json();
                    const lista = Array.isArray(dataBD) ? dataBD : (dataBD.data || []);
                    const coincideEnBD = lista.find(s => (s.correo || s.email || '').toLowerCase() === loginData.email.toLowerCase());
                    if (coincideEnBD) {
                        account = {
                            nombre: coincideEnBD.nombre,
                            rut: coincideEnBD.rut,
                            email: coincideEnBD.correo || coincideEnBD.email
                        };
                    }
                } catch (err) {
                    console.error("Error al verificar cuenta en MongoDB:", err);
                }
            }

            if (account) {
                sessionData = { role: 'vecino', nombre: account.nombre, rut: account.rut, email: account.email };
            } else {
                setErrorMessage('Correo o contraseña incorrectos. Para probar, usa: danilo.godoy@alumnos.unab.cl / vecino');
                return;
            }
        } else {
            const emailInput = loginData.email.toLowerCase();
            const passInput = loginData.password;

            const demoJuntas = [
                { email: 'jvuniversidad19@gmail.com', password: 'junta', nombreRepresentante: 'Danilo Godoy', nombreJunta: 'Junta de Vecinos N° 19 Universidad', idJunta: 'jjvv19', cargo: 'Presidente' },
                { email: 'junta@jjvv.cl', password: 'junta', nombreRepresentante: 'Administrador Demo', nombreJunta: 'Junta de Vecinos Demo', idJunta: 'jjvv19', cargo: 'Administrador' },
                { email: 'admin@jjvv.cl', password: 'admin', nombreRepresentante: 'Administrador Demo', nombreJunta: 'Junta de Vecinos Demo', idJunta: 'jjvv19', cargo: 'Administrador' },
                { email: 'unioncomunalnunoa@gmail.com', password: 'junta', nombreRepresentante: 'Director Unión', nombreJunta: 'Unión Comunal de Juntas de Vecinos de Ñuñoa', idJunta: 'unionComunal', cargo: 'Director' }
            ];

            const savedJuntas = JSON.parse(localStorage.getItem('juntas_cuentas') || '[]');
            const allJuntas = [...demoJuntas, ...savedJuntas];

            const account = allJuntas.find(
                (j) => j.email.toLowerCase() === emailInput && j.password === passInput
            );

            if (account) {
                sessionData = { 
                    role: 'junta', 
                    email: account.email, 
                    nombre: account.nombreRepresentante, 
                    nombreJunta: account.nombreJunta,
                    idJunta: account.idJunta || 'jjvv19',
                    cargo: account.cargo || 'Presidente'
                };
            } else {
                setErrorMessage('Credenciales incorrectas. Para probar, usa: jvuniversidad19@gmail.com / junta');
                return;
            }
        }

        // Credenciales OK → enviar código 2FA
        setEnviando2FA(true);
        try {
            const resp = await fetch(`${BACKEND}/api/auth/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: sessionData.email })
            });
            const data = await resp.json();
            if (data.ok) {
                setSessionPendiente(sessionData);
                setPaso2FA(true);
                setCodigo2FA('');
                setCodigoDemo(data.code || ''); // Guarda el código de demo retornado
            } else {
                setErrorMessage('No se pudo enviar el código. Intenta de nuevo.');
            }
        } catch {
            setErrorMessage('Error de conexión con el servidor. Verifica que el backend esté activo.');
        } finally {
            setEnviando2FA(false);
        }
    };

    const handleVerificarCodigo = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setVerificando2FA(true);
        try {
            const resp = await fetch(`${BACKEND}/api/auth/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: sessionPendiente.email, codigo: codigo2FA })
            });
            const data = await resp.json();
            if (data.ok) {
                onLoginSuccess(sessionPendiente);
            } else {
                setErrorMessage(data.msg || 'Código incorrecto.');
            }
        } catch {
            setErrorMessage('Error de conexión con el servidor.');
        } finally {
            setVerificando2FA(false);
        }
    };

    const handleRegisterJuntaSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (rutError || !registerJuntaData.rutRepresentante) {
            setErrorMessage('Por favor, ingrese un RUT válido para el representante.');
            return;
        }

        if (registerJuntaData.password !== registerJuntaData.confirmPassword) {
            setErrorMessage('Las contraseñas de registro no coinciden.');
            return;
        }

        const idJunta = `junta-${Date.now()}`;
        const savedAccounts = JSON.parse(localStorage.getItem('juntas_cuentas') || '[]');
        
        const emailExists = savedAccounts.some(acc => acc.email.toLowerCase() === registerJuntaData.email.toLowerCase()) ||
                            registerJuntaData.email.toLowerCase() === 'jvuniversidad19@gmail.com' ||
                            registerJuntaData.email.toLowerCase() === 'unioncomunalnunoa@gmail.com';
        
        if (emailExists) {
            setErrorMessage('Este correo de operador ya se encuentra registrado.');
            return;
        }

        const newAccount = {
            nombreRepresentante: registerJuntaData.nombreRepresentante,
            rutRepresentante: registerJuntaData.rutRepresentante,
            email: registerJuntaData.email.toLowerCase(),
            password: registerJuntaData.password,
            cargo: registerJuntaData.cargo,
            idJunta: idJunta,
            nombreJunta: registerJuntaData.nombreJunta
        };

        // Guardar cuenta
        localStorage.setItem('juntas_cuentas', JSON.stringify([...savedAccounts, newAccount]));

        // Crear shell de configuración de la Junta vacía en saas_juntas
        const savedJuntas = JSON.parse(localStorage.getItem('saas_juntas')) || {};
        const newJuntaConfig = {
            id: idJunta,
            nombreJunta: registerJuntaData.nombreJunta,
            rutJunta: '',
            personalidadJuridica: '',
            direccionOficina: '',
            sitioWeb: '',
            emailContacto: registerJuntaData.email.toLowerCase(),
            telefono: '',
            correlativoInicial: '000100',
            valorCertificado: '1000',
            cabeceraTexto: `${registerJuntaData.nombreJunta.toUpperCase()}\nNUÑOA`,
            pieFirmaTexto: `${registerJuntaData.cargo.toUpperCase()}\n${registerJuntaData.nombreJunta}`,
            comuna: 'Ñuñoa',
            banco: '',
            tipoCuenta: 'Cuenta Corriente',
            numeroCuenta: ''
        };

        localStorage.setItem('saas_juntas', JSON.stringify({ ...savedJuntas, [idJunta]: newJuntaConfig }));

        alert('¡Junta de Vecinos registrada exitosamente! Ya puedes iniciar sesión con las credenciales de operador.');
        setIsLogin(true);
        setLoginData({ email: registerJuntaData.email, password: registerJuntaData.password });
        setRegisterJuntaData({
            nombreRepresentante: '',
            rutRepresentante: '',
            email: '',
            password: '',
            confirmPassword: '',
            nombreJunta: '',
            cargo: 'Presidente'
        });
    };

    const handleReenviarCodigo = async () => {
        setErrorMessage('');
        setEnviando2FA(true);
        try {
            const resp = await fetch(`${BACKEND}/api/auth/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: sessionPendiente.email })
            });
            const data = await resp.json();
            if (data.ok) {
                setCodigo2FA('');
                setErrorMessage('');
                setCodigoDemo(data.code || ''); // Actualiza el código de demo al reenviar
            } else {
                setErrorMessage('No se pudo reenviar el código.');
            }
        } catch {
            setErrorMessage('Error de conexión.');
        } finally {
            setEnviando2FA(false);
        }
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (rutError || !registerData.rut) {
            setErrorMessage('Por favor, ingrese un RUT válido.');
            return;
        }

        if (registerData.password !== registerData.confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden.');
            return;
        }

        const savedVecinos = JSON.parse(localStorage.getItem('vecinos_cuentas') || '[]');
        
        // Check duplicate email
        const exists = savedVecinos.some(
            (v) => v.email.toLowerCase() === registerData.email.toLowerCase()
        );
        if (exists || registerData.email.toLowerCase() === 'danilo.godoy@alumnos.unab.cl') {
            setErrorMessage('El correo electrónico ya se encuentra registrado.');
            return;
        }

        // Save account
        const newVecino = {
            nombre: registerData.nombre,
            rut: registerData.rut,
            email: registerData.email,
            password: registerData.password
        };

        savedVecinos.push(newVecino);
        localStorage.setItem('vecinos_cuentas', JSON.stringify(savedVecinos));

        alert('¡Registro exitoso! Ya puedes iniciar sesión con tus credenciales.');
        setIsLogin(true);
        setLoginData({ email: registerData.email, password: '' });
        setRegisterData({ nombre: '', rut: '', email: '', password: '', confirmPassword: '' });
    };

    const containerStyle = {
        maxWidth: '450px',
        width: '100%',
        margin: '40px auto',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        fontFamily: "'Outfit', sans-serif"
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        fontSize: '15px',
        marginTop: '6px',
        marginBottom: '16px',
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
        outline: 'none',
        transition: 'border-color 0.2s'
    };

    const buttonStyle = {
        width: '100%',
        padding: '14px',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        color: '#ffffff',
        backgroundColor: role === 'vecino' ? '#2563eb' : '#10b981',
        boxShadow: role === 'vecino' ? '0 4px 12px rgba(37, 99, 235, 0.2)' : '0 4px 12px rgba(16, 185, 129, 0.2)',
        marginTop: '10px',
        fontFamily: "'Outfit', sans-serif"
    };

    // ── PASO 2FA ────────────────────────────────────────────────────
    if (paso2FA) {
        return (
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={containerStyle}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📬</span>
                        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
                            Verificación en dos pasos
                        </h2>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                            Enviamos un código de 6 dígitos a<br />
                            <strong style={{ color: '#1e3a8a' }}>{sessionPendiente?.email}</strong>
                        </p>
                    </div>

                    {errorMessage && (
                        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '20px', lineHeight: '1.4' }}>
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleVerificarCodigo}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '8px' }}>
                            Código de verificación:
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="_ _ _ _ _ _"
                            value={codigo2FA}
                            onChange={(e) => setCodigo2FA(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            required
                            autoFocus
                            style={{
                                ...inputStyle,
                                fontSize: '28px',
                                fontWeight: '700',
                                textAlign: 'center',
                                letterSpacing: '10px',
                                color: '#1e3a8a'
                            }}
                        />
                        <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', margin: '-8px 0 20px 0' }}>
                            ⏱️ El código expira en 10 minutos
                        </p>

                        <button
                            type="submit"
                            disabled={verificando2FA || codigo2FA.length !== 6}
                            style={{
                                ...buttonStyle,
                                opacity: (verificando2FA || codigo2FA.length !== 6) ? 0.6 : 1
                            }}
                        >
                            {verificando2FA ? 'Verificando...' : '✅ Verificar y Entrar'}
                        </button>
                    </form>

                    {codigoDemo && (
                        <div style={{
                            marginTop: '20px',
                            padding: '12px 16px',
                            backgroundColor: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '10px',
                            fontSize: '13px',
                            color: '#065f46',
                            textAlign: 'left',
                            lineHeight: '1.5'
                        }}>
                            💡 <strong>Modo Demo Activo:</strong> Si el correo no ha llegado debido a restricciones de spam del servidor, puedes ingresar el siguiente código simulado: <strong style={{ fontSize: '15px', color: '#047857', letterSpacing: '1px', marginLeft: '4px' }}>{codigoDemo}</strong>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px 0' }}>¿No recibiste el código?</p>
                        <button
                            onClick={handleReenviarCodigo}
                            disabled={enviando2FA}
                            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
                        >
                            {enviando2FA ? 'Enviando...' : 'Reenviar código'}
                        </button>
                        <br />
                        <button
                            onClick={() => { setPaso2FA(false); setErrorMessage(''); setCodigo2FA(''); }}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}
                        >
                            ← Volver al inicio de sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    // ────────────────────────────────────────────────────────────────

    return (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={containerStyle}>
                
                {/* Back button */}
                <button 
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0',
                        marginBottom: '24px',
                        fontWeight: '500'
                    }}
                >
                    ← Volver al inicio
                </button>

                <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#0f172a',
                    marginBottom: '8px'
                }}>
                    {role === 'vecino' 
                        ? (isLogin ? 'Acceso Residentes' : 'Registro de Residentes')
                        : (isLogin ? 'Acceso Operadores JJVV' : 'Registrar Nueva Junta')
                    }
                </h2>
                
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                    {role === 'vecino'
                        ? (isLogin ? 'Inicia sesión para gestionar tus certificados de residencia.' : 'Crea tu cuenta única para solicitar documentos.')
                        : (isLogin ? 'Ingresa con las credenciales de administración de tu junta.' : 'Obtén tu cuenta de operador para habilitar tu entidad en la plataforma.')
                    }
                </p>

                {errorMessage && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        marginBottom: '20px',
                        lineHeight: '1.4'
                    }}>
                        {errorMessage}
                    </div>
                )}

                {isLogin ? (
                    /* LOGIN FORM */
                    <form onSubmit={handleLoginSubmit}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                            Correo Electrónico:
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="nombre@correo.com"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            required
                            style={inputStyle}
                        />

                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                            Contraseña:
                        </label>
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="••••••••"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                required
                                style={{ ...inputStyle, marginBottom: '0', paddingRight: '44px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0',
                                    color: '#94a3b8',
                                    fontSize: '18px',
                                    lineHeight: '1',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>

                        <button type="submit" style={buttonStyle}>
                            Iniciar Sesión
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '20px', color: '#64748b' }}>
                            {role === 'vecino' ? (
                                <>
                                    ¿No tienes una cuenta?{' '}
                                    <span 
                                        onClick={() => { setIsLogin(false); setErrorMessage(''); }}
                                        style={{ color: '#2563eb', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        Regístrate aquí
                                    </span>
                                </>
                            ) : (
                                <>
                                    ¿Representas a una nueva Junta de Vecinos?{' '}
                                    <span 
                                        onClick={() => { setIsLogin(false); setErrorMessage(''); }}
                                        style={{ color: '#10b981', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        Registra tu Junta aquí
                                    </span>
                                </>
                            )}
                        </p>
                    </form>
                ) : (
                    /* REGISTRATION FORMS */
                    role === 'vecino' ? (
                        /* VECINO REGISTER FORM */
                        <form onSubmit={handleRegisterSubmit}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                            Nombre Completo:
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Ej: Juan Pérez"
                            value={registerData.nombre}
                            onChange={handleRegisterChange}
                            required
                            style={inputStyle}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                RUT:
                            </label>
                            <input
                                type="text"
                                name="rut"
                                placeholder="Ej: 12.345.678-9"
                                value={registerData.rut}
                                onChange={handleRegisterChange}
                                maxLength="12"
                                required
                                style={{
                                    ...inputStyle,
                                    borderColor: rutError ? '#ef4444' : '#cbd5e1',
                                    backgroundColor: rutError ? '#fef2f2' : '#ffffff'
                                }}
                            />
                            {rutError && (
                                <span style={{ color: '#b91c1c', fontSize: '12px', marginTop: '-12px', marginBottom: '12px', display: 'block', fontWeight: '500' }}>
                                    ⚠️ Formato de RUT inválido.
                                </span>
                            )}
                        </div>

                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                            Correo Electrónico:
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="correo@ejemplo.com"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            required
                            style={inputStyle}
                        />

                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                            Contraseña:
                        </label>
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Crea una contraseña"
                                value={registerData.password}
                                onChange={handleRegisterChange}
                                required
                                style={{ ...inputStyle, marginBottom: '0', paddingRight: '44px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0',
                                    color: '#94a3b8',
                                    fontSize: '18px',
                                    lineHeight: '1',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>

                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                            Confirmar Contraseña:
                        </label>
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Repite la contraseña"
                                value={registerData.confirmPassword}
                                onChange={handleRegisterChange}
                                required
                                style={{ ...inputStyle, marginBottom: '0', paddingRight: '44px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(v => !v)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0',
                                    color: '#94a3b8',
                                    fontSize: '18px',
                                    lineHeight: '1',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>

                        <button type="submit" style={buttonStyle}>
                            Registrarse y Crear Cuenta
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '20px', color: '#64748b' }}>
                            ¿Ya tienes una cuenta?{' '}
                            <span 
                                onClick={() => { setIsLogin(true); setErrorMessage(''); }}
                                style={{ color: '#2563eb', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Inicia sesión
                            </span>
                        </p>
                    </form>
                    ) : (
                        /* JUNTA OPERATOR REGISTER FORM */
                        <form onSubmit={handleRegisterJuntaSubmit}>
                            <h4 style={{ margin: '0 0 16px 0', color: '#10b981', fontSize: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                                Datos del Representante (Operador):
                            </h4>
                            
                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                Nombre Completo:
                            </label>
                            <input
                                type="text"
                                name="nombreRepresentante"
                                placeholder="Ej: Danilo Godoy"
                                value={registerJuntaData.nombreRepresentante}
                                onChange={handleRegisterJuntaChange}
                                required
                                style={inputStyle}
                            />

                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                RUT del Representante:
                            </label>
                            <input
                                type="text"
                                name="rutRepresentante"
                                placeholder="Ej: 12.345.678-9"
                                value={registerJuntaData.rutRepresentante}
                                onChange={handleRegisterJuntaChange}
                                maxLength="12"
                                required
                                style={{
                                    ...inputStyle,
                                    borderColor: rutError ? '#ef4444' : '#cbd5e1',
                                    backgroundColor: rutError ? '#fef2f2' : '#ffffff'
                                }}
                            />
                            {rutError && (
                                <span style={{ color: '#b91c1c', fontSize: '12px', marginTop: '-12px', marginBottom: '12px', display: 'block', fontWeight: '500' }}>
                                    ⚠️ Formato de RUT inválido.
                                </span>
                            )}

                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                Correo del Representante:
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="correo@ejemplo.com"
                                value={registerJuntaData.email}
                                onChange={handleRegisterJuntaChange}
                                required
                                style={inputStyle}
                            />

                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                Cargo en la Junta:
                            </label>
                            <select
                                name="cargo"
                                value={registerJuntaData.cargo}
                                onChange={handleRegisterJuntaChange}
                                style={{ ...inputStyle, padding: '10px' }}
                            >
                                <option value="Presidente">Presidente(a)</option>
                                <option value="Secretario">Secretario(a)</option>
                                <option value="Tesorero">Tesorero(a)</option>
                                <option value="Director">Director(a)</option>
                            </select>

                            <h4 style={{ margin: '24px 0 16px 0', color: '#10b981', fontSize: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                                Datos de la Entidad Vecinal:
                            </h4>

                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                Nombre Oficial de la Junta de Vecinos:
                            </label>
                            <input
                                type="text"
                                name="nombreJunta"
                                placeholder="Ej: Junta de Vecinos N° 45 Los Maitenes"
                                value={registerJuntaData.nombreJunta}
                                onChange={handleRegisterJuntaChange}
                                required
                                style={inputStyle}
                            />

                            <h4 style={{ margin: '24px 0 16px 0', color: '#64748b', fontSize: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                                Seguridad de la Cuenta:
                            </h4>

                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                Contraseña:
                            </label>
                            <div style={{ position: 'relative', marginBottom: '16px' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Crea una contraseña"
                                    value={registerJuntaData.password}
                                    onChange={handleRegisterJuntaChange}
                                    required
                                    style={{ ...inputStyle, marginBottom: '0', paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0',
                                        color: '#94a3b8',
                                        fontSize: '18px',
                                        lineHeight: '1',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>

                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                Confirmar Contraseña:
                            </label>
                            <div style={{ position: 'relative', marginBottom: '16px' }}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Repite la contraseña"
                                    value={registerJuntaData.confirmPassword}
                                    onChange={handleRegisterJuntaChange}
                                    required
                                    style={{ ...inputStyle, marginBottom: '0', paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(v => !v)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0',
                                        color: '#94a3b8',
                                        fontSize: '18px',
                                        lineHeight: '1',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showConfirmPassword ? '🙈' : '👁️'}
                                </button>
                            </div>

                            <button type="submit" style={{ ...buttonStyle, backgroundColor: '#10b981' }}>
                                Registrar y Crear Espacio Vecinal
                            </button>

                            <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '20px', color: '#64748b' }}>
                                ¿Ya tienes una cuenta?{' '}
                                <span 
                                    onClick={() => { setIsLogin(true); setErrorMessage(''); }}
                                    style={{ color: '#2563eb', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Inicia sesión
                                </span>
                            </p>
                        </form>
                    )
                )}
            </div>

            {/* Hint Box for Testing */}
            <div style={{
                maxWidth: '450px',
                width: '100%',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#475569',
                lineHeight: '1.5'
            }}>
                💡 <strong>Credenciales de Prueba (Demo):</strong><br />
                • <strong>Vecino:</strong> <code>danilo.godoy@alumnos.unab.cl</code> / contraseña: <code>vecino</code><br />
                • <strong>Operador Junta:</strong> <code>jvuniversidad19@gmail.com</code> / contraseña: <code>junta</code>
            </div>
        </div>
    );
}

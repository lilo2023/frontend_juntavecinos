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
    const [rutError, setRutError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (role === 'vecino') {
            // Get vecinos accounts from localStorage
            const savedVecinos = JSON.parse(localStorage.getItem('vecinos_cuentas') || '[]');
            
            // Preloaded demo account
            const demoVecino = {
                nombre: 'Danilo Marcelo Godoy Díaz',
                rut: '10.703.900-7',
                email: 'danilo.godoy@alumnos.unab.cl',
                password: 'vecino'
            };

            const allVecinos = [demoVecino, ...savedVecinos];
            const account = allVecinos.find(
                (v) => v.email.toLowerCase() === loginData.email.toLowerCase() && v.password === loginData.password
            );

            if (account) {
                onLoginSuccess({
                    role: 'vecino',
                    nombre: account.nombre,
                    rut: account.rut,
                    email: account.email
                });
            } else {
                setErrorMessage('Correo o contraseña incorrectos. Para probar, usa: danilo.godoy@alumnos.unab.cl / vecino');
            }
        } else {
            // Junta Operator Login
            // Demo accounts matching default config email + password 'junta' or 'admin'
            const jv19Email = 'jvuniversidad19@gmail.com';
            const unionEmail = 'unioncomunalnunoa@gmail.com';

            const emailInput = loginData.email.toLowerCase();
            const passInput = loginData.password;

            if (
                (emailInput === jv19Email || emailInput === 'junta@jjvv.cl' || emailInput === 'admin@jjvv.cl') &&
                (passInput === 'junta' || passInput === 'admin' || passInput === '1234')
            ) {
                onLoginSuccess({
                    role: 'junta',
                    email: emailInput,
                    nombre: 'Operador Autorizado'
                });
            } else {
                setErrorMessage('Credenciales institucionales incorrectas. Para probar, usa: jvuniversidad19@gmail.com / junta');
            }
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
                        : 'Acceso Operadores JJVV'
                    }
                </h2>
                
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                    {role === 'vecino'
                        ? (isLogin ? 'Inicia sesión para gestionar tus certificados de residencia.' : 'Crea tu cuenta única para solicitar documentos.')
                        : 'Ingresa con las credenciales de administración de tu junta.'
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
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            required
                            style={inputStyle}
                        />

                        <button type="submit" style={buttonStyle}>
                            Iniciar Sesión
                        </button>

                        {role === 'vecino' && (
                            <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '20px', color: '#64748b' }}>
                                ¿No tienes una cuenta?{' '}
                                <span 
                                    onClick={() => { setIsLogin(false); setErrorMessage(''); }}
                                    style={{ color: '#2563eb', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Regístrate aquí
                                </span>
                            </p>
                        )}
                    </form>
                ) : (
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
                        <input
                            type="password"
                            name="password"
                            placeholder="Crea una contraseña"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            required
                            style={inputStyle}
                        />

                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                            Confirmar Contraseña:
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Repite la contraseña"
                            value={registerData.confirmPassword}
                            onChange={handleRegisterChange}
                            required
                            style={inputStyle}
                        />

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

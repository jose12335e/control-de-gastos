// Sistema de autenticación para Control de Gastos

// Elementos del DOM
const formLogin = document.getElementById('form-login');
const formRegistro = document.getElementById('form-registro');
const mostrarRegistro = document.getElementById('mostrar-registro');
const mostrarLogin = document.getElementById('mostrar-login');
const seccionLogin = document.querySelector('.seccion-login');
const seccionRegistro = document.querySelector('.seccion-registro');
const seccionTelefono = document.querySelector('.seccion-telefono');
const seccionVerificacion = document.querySelector('.seccion-verificacion');
const nombreUsuario = document.getElementById('nombre-usuario');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
const btnGoogle = document.getElementById('btn-google');
const btnGoogleRegistro = document.getElementById('btn-google-registro');
const btnTelefono = document.getElementById('btn-telefono');
const btnTelefonoRegistro = document.getElementById('btn-telefono-registro');
const formTelefono = document.getElementById('form-telefono');
const formVerificacion = document.getElementById('form-verificacion');
const volverLogin = document.getElementById('volver-login');
const volverTelefono = document.getElementById('volver-telefono');

// Verificar si estamos en la página de login o en la aplicación
const esPaginaLogin = !!formLogin;
const esPaginaApp = !!btnCerrarSesion;

// Variable para almacenar el número de teléfono durante la verificación
let numeroTelefono = '';

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    alert(mensaje);
}

// Función para mostrar mensajes de éxito
function mostrarExito(mensaje) {
    alert(mensaje);
}

// Función para registrar un nuevo usuario con Firebase Auth
function registrarUsuario(nombre, email, password) {
    // Verificar si Firebase Auth está disponible
    if (window.auth) {
        return new Promise((resolve, reject) => {
            // Crear usuario con Firebase Auth
            window.auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Usuario creado exitosamente
                    const user = userCredential.user;
                    
                    // Actualizar el perfil del usuario con su nombre
                    return user.updateProfile({
                        displayName: nombre
                    }).then(() => {
                        // Crear objeto de usuario para almacenar en Firestore
                        const nuevoUsuario = {
                            id: user.uid,
                            nombre: nombre,
                            email: email,
                            sueldo: 0,
                            diaCobro: 1,
                            gastosFijos: [],
                            gastosDiarios: [],
                            configuracion: {
                                moneda: 'DOP',
                                idioma: 'es',
                                formatoFecha: 'DD/MM/YYYY',
                                tema: 'claro'
                            }
                        };
                        
                        // Guardar datos adicionales en Firestore
                        return window.db.collection('usuarios').doc(user.uid).set(nuevoUsuario)
                            .then(() => {
                                // Guardar como usuario actual en localStorage para compatibilidad
                                localStorage.setItem('usuarioActual', JSON.stringify(nuevoUsuario));
                                mostrarExito('Usuario registrado correctamente');
                                resolve(true);
                            });
                    });
                })
                .catch((error) => {
                    console.error('Error al registrar usuario:', error);
                    let mensajeError = 'Error al registrar usuario';
                    
                    // Mensajes de error específicos
                    switch (error.code) {
                        case 'auth/email-already-in-use':
                            mensajeError = 'Este email ya está registrado';
                            break;
                        case 'auth/invalid-email':
                            mensajeError = 'Email inválido';
                            break;
                        case 'auth/operation-not-allowed':
                            mensajeError = 'Operación no permitida';
                            break;
                        case 'auth/weak-password':
                            mensajeError = 'La contraseña es demasiado débil';
                            break;
                    }
                    
                    mostrarError(mensajeError);
                    resolve(false);
                });
        });
    } else {
        // Fallback al sistema actual si Firebase no está disponible
        try {
            // Verificar si el email ya está registrado
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            if (usuarios.some(usuario => usuario.email === email)) {
                mostrarError('Este email ya está registrado');
                return false;
            }

            // Crear nuevo usuario
            const nuevoUsuario = {
                id: Date.now().toString(),
                nombre: nombre,
                email: email,
                password: password, // En una aplicación real, esto debería estar hasheado
                sueldo: 0,
                diaCobro: 1,
                gastosFijos: [],
                gastosDiarios: [],
                configuracion: {
                    moneda: 'DOP',
                    idioma: 'es',
                    formatoFecha: 'DD/MM/YYYY',
                    tema: 'claro'
                }
            };

            // Agregar usuario a la lista
            usuarios.push(nuevoUsuario);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));

            // Guardar como usuario actual
            localStorage.setItem('usuarioActual', JSON.stringify(nuevoUsuario));

            return true;
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            mostrarError('Error al registrar usuario');
            return false;
        }
    }
}

// Función para iniciar sesión con Firebase Auth
function iniciarSesion(email, password) {
    // Verificar si Firebase Auth está disponible
    if (window.auth && window.isFirebaseAvailable()) {
        return new Promise((resolve, reject) => {
            // Iniciar sesión con Firebase Auth
            window.auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Usuario autenticado exitosamente
                    const user = userCredential.user;
                    
                    // Obtener datos adicionales del usuario desde Firestore
                    return window.db.collection('usuarios').doc(user.uid).get()
                        .then((doc) => {
                            if (doc.exists) {
                                const usuarioData = doc.data();
                                
                                // Guardar como usuario actual en localStorage para compatibilidad
                                localStorage.setItem('usuarioActual', JSON.stringify(usuarioData));
                                mostrarExito('Inicio de sesión exitoso');
                                window.location.href = 'app.html';
                                resolve(true);
                            } else {
                                // Si no existe el documento, crear uno nuevo
                                const nuevoUsuario = {
                                    id: user.uid,
                                    nombre: user.displayName || 'Usuario',
                                    email: user.email,
                                    sueldo: 0,
                                    diaCobro: 1,
                                    gastosFijos: [],
                                    gastosDiarios: [],
                                    configuracion: {
                                        moneda: 'DOP',
                                        idioma: 'es',
                                        formatoFecha: 'DD/MM/YYYY',
                                        tema: 'claro'
                                    }
                                };
                                
                                // Guardar en Firestore
                                window.db.collection('usuarios').doc(user.uid).set(nuevoUsuario)
                                    .then(() => {
                                        // Guardar como usuario actual en localStorage
                                        localStorage.setItem('usuarioActual', JSON.stringify(nuevoUsuario));
                                        mostrarExito('Inicio de sesión exitoso');
                                        window.location.href = 'app.html';
                                        resolve(true);
                                    });
                            }
                        });
                })
                .catch((error) => {
                    console.error('Error al iniciar sesión:', error);
                    let mensajeError = 'Error al iniciar sesión';
                    
                    // Mensajes de error específicos
                    switch (error.code) {
                        case 'auth/invalid-email':
                            mensajeError = 'Email inválido';
                            break;
                        case 'auth/user-disabled':
                            mensajeError = 'Usuario deshabilitado';
                            break;
                        case 'auth/user-not-found':
                            mensajeError = 'Usuario no encontrado';
                            break;
                        case 'auth/wrong-password':
                            mensajeError = 'Contraseña incorrecta';
                            break;
                    }
                    
                    mostrarError(mensajeError);
                    resolve(false);
                });
        });
    } else {
        // Fallback al sistema actual si Firebase no está disponible
        try {
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            const usuario = usuarios.find(u => u.email === email && u.password === password);

            if (!usuario) {
                mostrarError('Email o contraseña incorrectos');
                return false;
            }

            // Guardar como usuario actual
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
            mostrarExito('Inicio de sesión exitoso');
            window.location.href = 'app.html';
            return true;
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            mostrarError('Error al iniciar sesión');
            return false;
        }
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    // Verificar si Firebase Auth está disponible
    if (window.auth) {
        window.auth.signOut()
            .then(() => {
                // Limpiar datos del usuario actual
                localStorage.removeItem('usuarioActual');
                mostrarExito('Sesión cerrada correctamente');
                
                // Redirigir a la página de login
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error('Error al cerrar sesión:', error);
                mostrarError('Error al cerrar sesión');
            });
    } else {
        // Fallback al sistema actual si Firebase no está disponible
        localStorage.removeItem('usuarioActual');
        window.location.href = 'index.html';
    }
}

// Función para obtener el usuario actual
function obtenerUsuarioActual() {
    // Verificar si Firebase Auth está disponible
    if (window.auth) {
        const user = window.auth.currentUser;
        if (user) {
            // Obtener datos del usuario desde localStorage (para compatibilidad)
            const usuarioData = JSON.parse(localStorage.getItem('usuarioActual'));
            if (usuarioData) {
                return usuarioData;
            }
        }
    }
    
    // Fallback al sistema actual si Firebase no está disponible
    return JSON.parse(localStorage.getItem('usuarioActual'));
}

// Función para guardar el usuario actual
function guardarUsuarioActual(usuario) {
    // Verificar si Firebase Auth está disponible
    if (window.auth) {
        const user = window.auth.currentUser;
        if (user) {
            // Guardar en Firestore
            window.db.collection('usuarios').doc(user.uid).update(usuario)
                .then(() => {
                    // Actualizar en localStorage para compatibilidad
                    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
                })
                .catch((error) => {
                    console.error('Error al guardar usuario:', error);
                    mostrarError('Error al guardar datos del usuario');
                });
        }
    } else {
        // Fallback al sistema actual si Firebase no está disponible
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    }
}

// Función para verificar la autenticación
function verificarAutenticacion() {
    // Verificar si Firebase Auth está disponible
    if (window.auth) {
        window.auth.onAuthStateChanged((user) => {
            if (user) {
                // Usuario autenticado
                if (esPaginaLogin) {
                    // Si estamos en la página de login, redirigir a la aplicación
                    window.location.href = 'app.html';
                }
            } else {
                // Usuario no autenticado
                if (esPaginaApp) {
                    // Si estamos en la aplicación, redirigir al login
                    window.location.href = 'index.html';
                }
            }
        });
    } else {
        // Fallback al sistema actual si Firebase no está disponible
        const usuarioActual = obtenerUsuarioActual();
        if (usuarioActual && esPaginaLogin) {
            // Si hay un usuario autenticado y estamos en la página de login, redirigir a la aplicación
            window.location.href = 'app.html';
        } else if (!usuarioActual && esPaginaApp) {
            // Si no hay un usuario autenticado y estamos en la aplicación, redirigir al login
            window.location.href = 'index.html';
        }
    }
}

// Función para autenticar con Google
function autenticarConGoogle() {
    // Verificar si Firebase Auth está disponible
    if (window.auth) {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        window.auth.signInWithPopup(provider)
            .then((result) => {
                // Usuario autenticado con Google
                const user = result.user;
                
                // Obtener datos adicionales del usuario desde Firestore
                window.db.collection('usuarios').doc(user.uid).get()
                    .then((doc) => {
                        if (doc.exists) {
                            // Usuario ya existe en Firestore
                            const usuarioData = doc.data();
                            
                            // Guardar como usuario actual en localStorage para compatibilidad
                            localStorage.setItem('usuarioActual', JSON.stringify(usuarioData));
                            
                            // Redirigir a la aplicación
                            window.location.href = 'app.html';
                        } else {
                            // Crear nuevo usuario en Firestore
                            const nuevoUsuario = {
                                id: user.uid,
                                nombre: user.displayName || 'Usuario',
                                email: user.email,
                                sueldo: 0,
                                diaCobro: 1,
                                gastosFijos: [],
                                gastosDiarios: [],
                                configuracion: {
                                    moneda: 'DOP',
                                    idioma: 'es',
                                    formatoFecha: 'DD/MM/YYYY',
                                    tema: 'claro'
                                }
                            };
                            
                            // Guardar en Firestore
                            window.db.collection('usuarios').doc(user.uid).set(nuevoUsuario)
                                .then(() => {
                                    // Guardar como usuario actual en localStorage
                                    localStorage.setItem('usuarioActual', JSON.stringify(nuevoUsuario));
                                    
                                    // Redirigir a la aplicación
                                    window.location.href = 'app.html';
                                });
                        }
                    });
            })
            .catch((error) => {
                console.error('Error al autenticar con Google:', error);
                mostrarError('Error al autenticar con Google');
            });
    } else {
        // Fallback al sistema actual si Firebase no está disponible
        mostrarError('La autenticación con Google no está disponible');
    }
}

// Función para enviar código de verificación por teléfono
function enviarCodigoVerificacion(telefono) {
    // Verificar si Firebase Auth está disponible
    if (window.auth) {
        const appVerifier = new firebase.auth.RecaptchaVerifier('btn-enviar-codigo', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA resuelto, permitir enviar código
            }
        });
        
        window.auth.signInWithPhoneNumber(telefono, appVerifier)
            .then((confirmationResult) => {
                // Código enviado exitosamente
                window.confirmationResult = confirmationResult;
                mostrarExito('Código de verificación enviado');
                
                // Mostrar sección de verificación
                seccionTelefono.style.display = 'none';
                seccionVerificacion.style.display = 'block';
            })
            .catch((error) => {
                console.error('Error al enviar código:', error);
                mostrarError('Error al enviar código de verificación');
            });
    } else {
        // Fallback al sistema actual si Firebase no está disponible
        mostrarError('La verificación por teléfono no está disponible');
    }
}

// Función para verificar código de teléfono
function verificarCodigo(codigo) {
    // Verificar si Firebase Auth está disponible
    if (window.auth && window.confirmationResult) {
        window.confirmationResult.confirm(codigo)
            .then((result) => {
                // Código verificado exitosamente
                const user = result.user;
                
                // Obtener datos adicionales del usuario desde Firestore
                window.db.collection('usuarios').doc(user.uid).get()
                    .then((doc) => {
                        if (doc.exists) {
                            // Usuario ya existe en Firestore
                            const usuarioData = doc.data();
                            
                            // Guardar como usuario actual en localStorage para compatibilidad
                            localStorage.setItem('usuarioActual', JSON.stringify(usuarioData));
                            
                            // Redirigir a la aplicación
                            window.location.href = 'app.html';
                        } else {
                            // Crear nuevo usuario en Firestore
                            const nuevoUsuario = {
                                id: user.uid,
                                nombre: 'Usuario',
                                telefono: user.phoneNumber,
                                sueldo: 0,
                                diaCobro: 1,
                                gastosFijos: [],
                                gastosDiarios: [],
                                configuracion: {
                                    moneda: 'DOP',
                                    idioma: 'es',
                                    formatoFecha: 'DD/MM/YYYY',
                                    tema: 'claro'
                                }
                            };
                            
                            // Guardar en Firestore
                            window.db.collection('usuarios').doc(user.uid).set(nuevoUsuario)
                                .then(() => {
                                    // Guardar como usuario actual en localStorage
                                    localStorage.setItem('usuarioActual', JSON.stringify(nuevoUsuario));
                                    
                                    // Redirigir a la aplicación
                                    window.location.href = 'app.html';
                                });
                        }
                    });
            })
            .catch((error) => {
                console.error('Error al verificar código:', error);
                mostrarError('Código de verificación incorrecto');
            });
    } else {
        // Fallback al sistema actual si Firebase no está disponible
        mostrarError('La verificación por teléfono no está disponible');
    }
}

// Event Listeners
if (esPaginaLogin) {
    // Event listener para el formulario de login
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email-login').value;
        const password = document.getElementById('password-login').value;
        
        iniciarSesion(email, password)
            .then((exitoso) => {
                if (exitoso) {
                    window.location.href = 'app.html';
                }
            });
    });
    
    // Event listener para el formulario de registro
    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre-registro').value;
        const email = document.getElementById('email-registro').value;
        const password = document.getElementById('password-registro').value;
        const confirmarPassword = document.getElementById('confirmar-password').value;
        
        if (password !== confirmarPassword) {
            mostrarError('Las contraseñas no coinciden');
            return;
        }
        
        registrarUsuario(nombre, email, password)
            .then((exitoso) => {
                if (exitoso) {
                    window.location.href = 'app.html';
                }
            });
    });
    
    // Event listener para mostrar formulario de registro
    mostrarRegistro.addEventListener('click', (e) => {
        e.preventDefault();
        seccionLogin.style.display = 'none';
        seccionRegistro.style.display = 'block';
    });
    
    // Event listener para mostrar formulario de login
    mostrarLogin.addEventListener('click', (e) => {
        e.preventDefault();
        seccionRegistro.style.display = 'none';
        seccionLogin.style.display = 'block';
    });
    
    // Event listener para autenticar con Google
    btnGoogle.addEventListener('click', autenticarConGoogle);
    btnGoogleRegistro.addEventListener('click', autenticarConGoogle);
    
    // Event listener para mostrar formulario de teléfono
    btnTelefono.addEventListener('click', (e) => {
        e.preventDefault();
        seccionLogin.style.display = 'none';
        seccionTelefono.style.display = 'block';
    });
    
    btnTelefonoRegistro.addEventListener('click', (e) => {
        e.preventDefault();
        seccionRegistro.style.display = 'none';
        seccionTelefono.style.display = 'block';
    });
    
    // Event listener para volver al login
    volverLogin.addEventListener('click', (e) => {
        e.preventDefault();
        seccionTelefono.style.display = 'none';
        seccionLogin.style.display = 'block';
    });
    
    // Event listener para volver al formulario de teléfono
    volverTelefono.addEventListener('click', (e) => {
        e.preventDefault();
        seccionVerificacion.style.display = 'none';
        seccionTelefono.style.display = 'block';
    });
    
    // Event listener para enviar código de verificación
    formTelefono.addEventListener('submit', (e) => {
        e.preventDefault();
        const codigoPais = document.getElementById('codigo-pais').value;
        const telefono = document.getElementById('telefono').value;
        const telefonoCompleto = `${codigoPais}${telefono}`;
        
        numeroTelefono = telefonoCompleto;
        enviarCodigoVerificacion(telefonoCompleto);
    });
    
    // Event listener para verificar código
    formVerificacion.addEventListener('submit', (e) => {
        e.preventDefault();
        const codigo = document.getElementById('codigo-verificacion').value;
        verificarCodigo(codigo);
    });
}

if (esPaginaApp) {
    // Event listener para cerrar sesión
    btnCerrarSesion.addEventListener('click', cerrarSesion);
    
    // Mostrar nombre de usuario
    const usuarioActual = obtenerUsuarioActual();
    if (usuarioActual && nombreUsuario) {
        nombreUsuario.textContent = usuarioActual.nombre;
    }
}

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', verificarAutenticacion); 
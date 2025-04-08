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

// Función para registrar un nuevo usuario
function registrarUsuario(nombre, email, password) {
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
                moneda: 'USD',
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

// Función para iniciar sesión
function iniciarSesion(email, password) {
    try {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuario = usuarios.find(u => u.email === email && u.password === password);

        if (!usuario) {
            mostrarError('Email o contraseña incorrectos');
            return false;
        }

        // Guardar como usuario actual
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        return true;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        mostrarError('Error al iniciar sesión');
        return false;
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    try {
        localStorage.removeItem('usuarioActual');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        mostrarError('Error al cerrar sesión');
    }
}

// Función para obtener el usuario actual
function obtenerUsuarioActual() {
    try {
        return JSON.parse(localStorage.getItem('usuarioActual')) || null;
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        return null;
    }
}

// Función para guardar los datos del usuario actual
function guardarUsuarioActual(usuario) {
    try {
        // Actualizar en localStorage
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));

        // Actualizar en la lista de usuarios
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const index = usuarios.findIndex(u => u.id === usuario.id);
        if (index !== -1) {
            usuarios[index] = usuario;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }
    } catch (error) {
        console.error('Error al guardar usuario actual:', error);
        mostrarError('Error al guardar datos del usuario');
    }
}

// Función para verificar autenticación
function verificarAutenticacion() {
    const usuarioActual = obtenerUsuarioActual();
    
    if (!usuarioActual && esPaginaApp) {
        window.location.href = 'index.html';
    } else if (usuarioActual && esPaginaLogin) {
        window.location.href = 'app.html';
    }

    if (usuarioActual && nombreUsuario) {
        nombreUsuario.textContent = usuarioActual.nombre;
    }
}

// Función para autenticar con Google
function autenticarConGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            // Usuario autenticado con Google
            const user = result.user;
            
            // Verificar si el usuario ya existe en nuestra base de datos local
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            let usuarioExistente = usuarios.find(u => u.email === user.email);
            
            if (!usuarioExistente) {
                // Crear nuevo usuario con datos de Google
                const nuevoUsuario = {
                    id: user.uid,
                    nombre: user.displayName,
                    email: user.email,
                    sueldo: 0,
                    diaCobro: 1,
                    gastosFijos: [],
                    gastosDiarios: [],
                    configuracion: {
                        moneda: 'USD',
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
            } else {
                // Actualizar usuario existente
                usuarioExistente.nombre = user.displayName;
                localStorage.setItem('usuarioActual', JSON.stringify(usuarioExistente));
            }
            
            // Redirigir a la aplicación
            window.location.href = 'app.html';
        })
        .catch((error) => {
            console.error('Error al autenticar con Google:', error);
            mostrarError('Error al autenticar con Google: ' + error.message);
        });
}

// Función para enviar código de verificación por SMS
function enviarCodigoVerificacion(telefono) {
    // En una implementación real con Firebase, esto sería:
    // const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    //     'size': 'invisible',
    //     'callback': (response) => {
    //         // reCAPTCHA solved, allow signInWithPhoneNumber.
    //     }
    // });
    // firebase.auth().signInWithPhoneNumber(telefono, appVerifier)
    //     .then((confirmationResult) => {
    //         // SMS sent. Prompt user to type the code from the message
    //         window.confirmationResult = confirmationResult;
    //     })
    //     .catch((error) => {
    //         console.error('Error al enviar código:', error);
    //         mostrarError('Error al enviar código: ' + error.message);
    //     });
    
    // Simulación para demostración
    console.log('Enviando código a:', telefono);
    numeroTelefono = telefono;
    
    // Mostrar sección de verificación
    seccionTelefono.style.display = 'none';
    seccionVerificacion.style.display = 'block';
    
    // En una implementación real, el código se enviaría por SMS
    // Para esta demo, mostramos un mensaje
    mostrarExito('Código de verificación enviado a ' + telefono);
}

// Función para verificar código SMS
function verificarCodigo(codigo) {
    // En una implementación real con Firebase, esto sería:
    // window.confirmationResult.confirm(codigo)
    //     .then((result) => {
    //         // Usuario autenticado con teléfono
    //         const user = result.user;
    //         
    //         // Verificar si el usuario ya existe en nuestra base de datos local
    //         const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    //         let usuarioExistente = usuarios.find(u => u.telefono === user.phoneNumber);
    //         
    //         if (!usuarioExistente) {
    //             // Crear nuevo usuario con datos del teléfono
    //             const nuevoUsuario = {
    //                 id: user.uid,
    //                 nombre: 'Usuario ' + user.phoneNumber.substring(user.phoneNumber.length - 4),
    //                 telefono: user.phoneNumber,
    //                 sueldo: 0,
    //                 diaCobro: 1,
    //                 gastosFijos: [],
    //                 gastosDiarios: [],
    //                 configuracion: {
    //                     moneda: 'USD',
    //                     idioma: 'es',
    //                     formatoFecha: 'DD/MM/YYYY',
    //                     tema: 'claro'
    //                 }
    //             };
    //             
    //             // Agregar usuario a la lista
    //             usuarios.push(nuevoUsuario);
    //             localStorage.setItem('usuarios', JSON.stringify(usuarios));
    //             
    //             // Guardar como usuario actual
    //             localStorage.setItem('usuarioActual', JSON.stringify(nuevoUsuario));
    //         } else {
    //             // Actualizar usuario existente
    //             localStorage.setItem('usuarioActual', JSON.stringify(usuarioExistente));
    //         }
    //         
    //         // Redirigir a la aplicación
    //         window.location.href = 'app.html';
    //     })
    //     .catch((error) => {
    //         console.error('Error al verificar código:', error);
    //         mostrarError('Error al verificar código: ' + error.message);
    //     });
    
    // Simulación para demostración
    console.log('Verificando código:', codigo);
    
    // Verificar si el código es válido (en una demo, cualquier código es válido)
    if (codigo.length === 6) {
        // Crear nuevo usuario con datos del teléfono
        const nuevoUsuario = {
            id: Date.now().toString(),
            nombre: 'Usuario ' + numeroTelefono.substring(numeroTelefono.length - 4),
            telefono: numeroTelefono,
            sueldo: 0,
            diaCobro: 1,
            gastosFijos: [],
            gastosDiarios: [],
            configuracion: {
                moneda: 'USD',
                idioma: 'es',
                formatoFecha: 'DD/MM/YYYY',
                tema: 'claro'
            }
        };
        
        // Agregar usuario a la lista
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        // Guardar como usuario actual
        localStorage.setItem('usuarioActual', JSON.stringify(nuevoUsuario));
        
        // Redirigir a la aplicación
        window.location.href = 'app.html';
    } else {
        mostrarError('Código inválido. Por favor, intenta de nuevo.');
    }
}

// Event Listeners para la página de inicio de sesión/registro
if (esPaginaLogin) {
    mostrarRegistro.addEventListener('click', (e) => {
        e.preventDefault();
        seccionLogin.style.display = 'none';
        seccionRegistro.style.display = 'block';
    });

    mostrarLogin.addEventListener('click', (e) => {
        e.preventDefault();
        seccionRegistro.style.display = 'none';
        seccionLogin.style.display = 'block';
    });

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email-login').value;
        const password = document.getElementById('password-login').value;

        if (iniciarSesion(email, password)) {
            // Guardar el email para futuros inicios de sesión
            localStorage.setItem('ultimoEmail', email);
            window.location.href = 'app.html';
        }
    });

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

        if (registrarUsuario(nombre, email, password)) {
            mostrarExito('Registro exitoso. Ahora puedes iniciar sesión.');
            seccionRegistro.style.display = 'none';
            seccionLogin.style.display = 'block';
            document.getElementById('email-login').value = email;
        }
    });
    
    // Event listeners para autenticación con Google
    if (btnGoogle) {
        btnGoogle.addEventListener('click', autenticarConGoogle);
    }
    
    if (btnGoogleRegistro) {
        btnGoogleRegistro.addEventListener('click', autenticarConGoogle);
    }
    
    // Event listeners para autenticación con teléfono
    if (btnTelefono) {
        btnTelefono.addEventListener('click', () => {
            seccionLogin.style.display = 'none';
            seccionTelefono.style.display = 'block';
        });
    }
    
    if (btnTelefonoRegistro) {
        btnTelefonoRegistro.addEventListener('click', () => {
            seccionRegistro.style.display = 'none';
            seccionTelefono.style.display = 'block';
        });
    }
    
    // Event listener para el formulario de teléfono
    if (formTelefono) {
        formTelefono.addEventListener('submit', (e) => {
            e.preventDefault();
            const codigoPais = document.getElementById('codigo-pais').value;
            const telefono = document.getElementById('telefono').value;
            const telefonoCompleto = codigoPais + telefono;
            
            enviarCodigoVerificacion(telefonoCompleto);
        });
    }
    
    // Event listener para el formulario de verificación
    if (formVerificacion) {
        formVerificacion.addEventListener('submit', (e) => {
            e.preventDefault();
            const codigo = document.getElementById('codigo-verificacion').value;
            
            verificarCodigo(codigo);
        });
    }
    
    // Event listeners para volver
    if (volverLogin) {
        volverLogin.addEventListener('click', (e) => {
            e.preventDefault();
            seccionTelefono.style.display = 'none';
            seccionLogin.style.display = 'block';
        });
    }
    
    if (volverTelefono) {
        volverTelefono.addEventListener('click', (e) => {
            e.preventDefault();
            seccionVerificacion.style.display = 'none';
            seccionTelefono.style.display = 'block';
        });
    }

    // Cargar último email usado
    const ultimoEmail = localStorage.getItem('ultimoEmail');
    if (ultimoEmail) {
        document.getElementById('email-login').value = ultimoEmail;
    }
}

// Event Listener para cerrar sesión
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', cerrarSesion);
}

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', verificarAutenticacion); 
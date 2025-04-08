// Sistema de autenticación para Control de Gastos

// Elementos del DOM para la página de inicio de sesión/registro
const formLogin = document.getElementById('form-login');
const formRegistro = document.getElementById('form-registro');
const mostrarRegistro = document.getElementById('mostrar-registro');
const mostrarLogin = document.getElementById('mostrar-login');
const seccionLogin = document.querySelector('.seccion-login');
const seccionRegistro = document.querySelector('.seccion-registro');
const emailLoginInput = document.getElementById('email-login');
const passwordLoginInput = document.getElementById('password-login');

// Elementos del DOM para la página de la aplicación
const nombreUsuario = document.getElementById('nombre-usuario');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

// Verificar si estamos en la página de inicio de sesión o en la aplicación
const esPaginaLogin = !!formLogin;
const esPaginaApp = !!btnCerrarSesion;

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
    // Obtener usuarios existentes
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Verificar si el email ya está registrado
    if (usuarios.some(usuario => usuario.email === email)) {
        mostrarError('Este correo electrónico ya está registrado');
        return false;
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = {
        id: Date.now().toString(),
        nombre,
        email,
        password, // En una aplicación real, esto debería estar hasheado
        sueldo: 0,
        diaCobro: 1,
        gastosFijos: [],
        gastosDiarios: []
    };
    
    // Añadir usuario a la lista
    usuarios.push(nuevoUsuario);
    
    // Guardar en localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Guardar el ID del usuario actual
    localStorage.setItem('usuarioActual', nuevoUsuario.id);
    
    // Guardar el correo electrónico para futuros inicios de sesión
    localStorage.setItem('ultimoEmail', email);
    
    return true;
}

// Función para iniciar sesión
function iniciarSesion(email, password) {
    // Obtener usuarios
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Buscar usuario por email y contraseña
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (!usuario) {
        mostrarError('Correo electrónico o contraseña incorrectos');
        return false;
    }
    
    // Guardar el ID del usuario actual
    localStorage.setItem('usuarioActual', usuario.id);
    
    // Guardar el correo electrónico para futuros inicios de sesión
    localStorage.setItem('ultimoEmail', email);
    
    return true;
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    window.location.href = 'index.html';
}

// Función para obtener el usuario actual
function obtenerUsuarioActual() {
    const usuarioId = localStorage.getItem('usuarioActual');
    if (!usuarioId) return null;
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    return usuarios.find(u => u.id === usuarioId);
}

// Función para guardar los datos del usuario actual
function guardarUsuarioActual(usuario) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const index = usuarios.findIndex(u => u.id === usuario.id);
    
    if (index !== -1) {
        usuarios[index] = usuario;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
}

// Función para verificar si el usuario está autenticado
function verificarAutenticacion() {
    const usuario = obtenerUsuarioActual();
    
    if (!usuario && esPaginaApp) {
        // Si estamos en la página de la aplicación y no hay usuario autenticado, redirigir al login
        window.location.href = 'index.html';
    } else if (usuario && esPaginaLogin) {
        // Si estamos en la página de login y hay un usuario autenticado, redirigir a la aplicación
        window.location.href = 'app.html';
    }
    
    return usuario;
}

// Función para cargar el último correo electrónico utilizado
function cargarUltimoEmail() {
    if (emailLoginInput) {
        const ultimoEmail = localStorage.getItem('ultimoEmail');
        if (ultimoEmail) {
            emailLoginInput.value = ultimoEmail;
        }
    }
}

// Inicializar la página según el contexto
if (esPaginaLogin) {
    // Cargar el último correo electrónico utilizado
    cargarUltimoEmail();
    
    // Eventos para la página de inicio de sesión/registro
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
        const email = emailLoginInput.value;
        const password = passwordLoginInput.value;
        
        if (iniciarSesion(email, password)) {
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
            
            // Rellenar automáticamente el campo de correo electrónico en el formulario de login
            emailLoginInput.value = email;
        }
    });
} else if (esPaginaApp) {
    // Eventos para la página de la aplicación
    btnCerrarSesion.addEventListener('click', cerrarSesion);
    
    // Mostrar nombre del usuario
    const usuario = verificarAutenticacion();
    if (usuario) {
        nombreUsuario.textContent = usuario.nombre;
    }
}

// Verificar autenticación al cargar la página
verificarAutenticacion(); 
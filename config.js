// Elementos del DOM
const monedaSelect = document.getElementById('moneda-select');
const idiomaSelect = document.getElementById('idioma-select');
const formatoFechaSelect = document.getElementById('formato-fecha-select');
const temaSelect = document.getElementById('tema-select');
const guardarConfigBtn = document.getElementById('guardar-config');
const nombreUsuarioSpan = document.getElementById('nombre-usuario');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

// Verificar si el usuario está autenticado
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarConfiguracion();
});

// Función para verificar si el usuario está autenticado
function verificarAutenticacion() {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuarioActual) {
        window.location.href = 'index.html';
        return;
    }
    
    // Mostrar nombre del usuario
    nombreUsuarioSpan.textContent = usuarioActual.nombre;
}

// Función para cargar la configuración guardada
function cargarConfiguracion() {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuarioActual) return;
    
    const configuracion = JSON.parse(localStorage.getItem(`config_${usuarioActual.email}`)) || {};
    
    // Cargar valores guardados o usar valores predeterminados
    monedaSelect.value = configuracion.moneda || 'USD';
    idiomaSelect.value = configuracion.idioma || 'es';
    formatoFechaSelect.value = configuracion.formatoFecha || 'DD/MM/YYYY';
    temaSelect.value = configuracion.tema || 'claro';
    
    // Aplicar tema
    aplicarTema(configuracion.tema || 'claro');
}

// Función para guardar la configuración
function guardarConfiguracion() {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuarioActual) return;
    
    const configuracion = {
        moneda: monedaSelect.value,
        idioma: idiomaSelect.value,
        formatoFecha: formatoFechaSelect.value,
        tema: temaSelect.value
    };
    
    // Guardar en localStorage
    localStorage.setItem(`config_${usuarioActual.email}`, JSON.stringify(configuracion));
    
    // Aplicar cambios
    aplicarTema(configuracion.tema);
    
    // Mostrar mensaje de éxito
    alert('Configuración guardada correctamente');
}

// Función para aplicar el tema seleccionado
function aplicarTema(tema) {
    // Remover clases de tema anteriores
    document.body.classList.remove('tema-claro', 'tema-oscuro', 'tema-azul');
    
    // Aplicar nuevo tema
    document.body.classList.add(`tema-${tema}`);
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    window.location.href = 'index.html';
}

// Event Listeners
guardarConfigBtn.addEventListener('click', guardarConfiguracion);
btnCerrarSesion.addEventListener('click', cerrarSesion);

// Función para formatear moneda según la configuración
function formatearMoneda(valor, moneda = null) {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuarioActual) return valor;
    
    const configuracion = JSON.parse(localStorage.getItem(`config_${usuarioActual.email}`)) || {};
    const monedaSeleccionada = moneda || configuracion.moneda || 'USD';
    
    const opciones = {
        style: 'currency',
        currency: monedaSeleccionada
    };
    
    return new Intl.NumberFormat('es-ES', opciones).format(valor);
}

// Función para formatear fecha según la configuración
function formatearFecha(fecha, formato = null) {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuarioActual) return fecha;
    
    const configuracion = JSON.parse(localStorage.getItem(`config_${usuarioActual.email}`)) || {};
    const formatoSeleccionado = formato || configuracion.formatoFecha || 'DD/MM/YYYY';
    
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const año = fechaObj.getFullYear();
    
    switch (formatoSeleccionado) {
        case 'DD/MM/YYYY':
            return `${dia}/${mes}/${año}`;
        case 'MM/DD/YYYY':
            return `${mes}/${dia}/${año}`;
        case 'YYYY-MM-DD':
            return `${año}-${mes}-${dia}`;
        default:
            return `${dia}/${mes}/${año}`;
    }
}

// Exportar funciones para uso en otros archivos
window.formatearMoneda = formatearMoneda;
window.formatearFecha = formatearFecha; 
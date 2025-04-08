// Elementos del DOM
const btnCambioTema = document.getElementById('btn-cambio-tema');
const iconoTema = document.querySelector('.icono-tema');

// Cargar el tema guardado al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const temaGuardado = localStorage.getItem('tema') || 'claro';
    aplicarTema(temaGuardado);
    actualizarIconoTema(temaGuardado);
});

// Función para cambiar el tema
function cambiarTema() {
    const temaActual = document.body.classList.contains('tema-oscuro') ? 'oscuro' : 'claro';
    const nuevoTema = temaActual === 'oscuro' ? 'claro' : 'oscuro';
    
    aplicarTema(nuevoTema);
    actualizarIconoTema(nuevoTema);
    
    // Guardar preferencia en localStorage
    localStorage.setItem('tema', nuevoTema);
}

// Función para aplicar el tema seleccionado
function aplicarTema(tema) {
    document.body.classList.remove('tema-claro', 'tema-oscuro', 'tema-azul');
    document.body.classList.add(`tema-${tema}`);
}

// Función para actualizar el icono del tema
function actualizarIconoTema(tema) {
    if (tema === 'oscuro') {
        iconoTema.textContent = '☀️'; // Sol para tema oscuro
    } else {
        iconoTema.textContent = '🌙'; // Luna para tema claro
    }
}

// Event listener para el botón de cambio de tema
if (btnCambioTema) {
    btnCambioTema.addEventListener('click', cambiarTema);
} 
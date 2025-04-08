// Elementos del DOM
const monedaSelect = document.getElementById('moneda-select');
const idiomaSelect = document.getElementById('idioma-select');
const formatoFechaSelect = document.getElementById('formato-fecha-select');
const temaSelect = document.getElementById('tema-select');
const guardarConfigBtn = document.getElementById('guardar-config');
const nombreUsuarioSpan = document.getElementById('nombre-usuario');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

// Variables para almacenar la configuración temporal
let configuracionTemporal = {};

// Verificar si el usuario está autenticado
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    cargarConfiguracion();
});

// Función para verificar si el usuario está autenticado
async function verificarAutenticacion() {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Mostrar nombre del usuario
    nombreUsuarioSpan.textContent = user.displayName;
}

// Función para cargar la configuración guardada
async function cargarConfiguracion() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const doc = await db.collection('usuarios').doc(user.uid).get();
        if (doc.exists) {
            const datos = doc.data();
            configuracionTemporal = datos.configuracion || {
                moneda: 'USD',
                idioma: 'es',
                formatoFecha: 'DD/MM/YYYY',
                tema: 'claro'
            };

            // Cargar valores en los selectores
            monedaSelect.value = configuracionTemporal.moneda;
            idiomaSelect.value = configuracionTemporal.idioma;
            formatoFechaSelect.value = configuracionTemporal.formatoFecha;
            temaSelect.value = configuracionTemporal.tema;

            // Aplicar tema y traducción actual
            aplicarTema(configuracionTemporal.tema);
            traducirInterfaz(configuracionTemporal.idioma);
        }
    } catch (error) {
        console.error('Error al cargar configuración:', error);
        mostrarError(getTranslation('settingsError', configuracionTemporal.idioma));
    }
}

// Función para guardar la configuración
async function guardarConfiguracion() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Actualizar configuración temporal con los valores actuales
        configuracionTemporal = {
            moneda: monedaSelect.value,
            idioma: idiomaSelect.value,
            formatoFecha: formatoFechaSelect.value,
            tema: temaSelect.value
        };

        // Guardar en Firestore
        await db.collection('usuarios').doc(user.uid).update({
            configuracion: configuracionTemporal
        });

        // Aplicar cambios
        aplicarTema(configuracionTemporal.tema);
        traducirInterfaz(configuracionTemporal.idioma);

        // Mostrar mensaje de éxito
        mostrarMensajeExito(getTranslation('settingsSaved', configuracionTemporal.idioma));
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        mostrarError(getTranslation('settingsError', configuracionTemporal.idioma));
    }
}

// Función para traducir la interfaz
function traducirInterfaz(idioma) {
    // Traducir títulos y encabezados
    document.title = getTranslation('appTitle', idioma);
    document.querySelector('h1').textContent = getTranslation('appTitle', idioma);
    document.querySelector('h2').textContent = getTranslation('settingsTitle', idioma);

    // Traducir etiquetas de configuración
    const configItems = document.querySelectorAll('.config-item h3');
    configItems[0].textContent = getTranslation('currency', idioma);
    configItems[1].textContent = getTranslation('language', idioma);
    configItems[2].textContent = getTranslation('dateFormat', idioma);
    configItems[3].textContent = getTranslation('theme', idioma);

    // Traducir botones
    guardarConfigBtn.textContent = getTranslation('saveChanges', idioma);
    btnCerrarSesion.textContent = getTranslation('logout', idioma);

    // Traducir enlaces del menú
    const menuLinks = document.querySelectorAll('.menu-principal a');
    menuLinks[0].textContent = getTranslation('home', idioma);
    menuLinks[1].textContent = getTranslation('settings', idioma);

    // Traducir opciones del tema
    const temaOptions = temaSelect.options;
    temaOptions[0].textContent = getTranslation('lightTheme', idioma);
    temaOptions[1].textContent = getTranslation('darkTheme', idioma);
    temaOptions[2].textContent = getTranslation('blueTheme', idioma);
}

// Función para aplicar el tema seleccionado
function aplicarTema(tema) {
    document.body.classList.remove('tema-claro', 'tema-oscuro', 'tema-azul');
    document.body.classList.add(`tema-${tema}`);
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    const mensajeError = document.createElement('div');
    mensajeError.className = 'mensaje-error';
    mensajeError.textContent = mensaje;
    
    mostrarMensaje(mensajeError);
}

// Función para mostrar mensajes de éxito
function mostrarMensajeExito(mensaje) {
    const mensajeExito = document.createElement('div');
    mensajeExito.className = 'mensaje-exito';
    mensajeExito.textContent = mensaje;
    
    mostrarMensaje(mensajeExito);
}

// Función para mostrar mensajes temporales
function mostrarMensaje(elementoMensaje) {
    document.querySelector('.seccion-configuracion').appendChild(elementoMensaje);
    
    setTimeout(() => {
        elementoMensaje.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
        elementoMensaje.style.opacity = '0';
        setTimeout(() => {
            elementoMensaje.remove();
        }, 300);
    }, 3000);
}

// Event Listeners
guardarConfigBtn.addEventListener('click', guardarConfiguracion);

// Event Listeners para los selectores
monedaSelect.addEventListener('change', () => {
    configuracionTemporal.moneda = monedaSelect.value;
});

idiomaSelect.addEventListener('change', () => {
    configuracionTemporal.idioma = idiomaSelect.value;
    traducirInterfaz(idiomaSelect.value);
});

formatoFechaSelect.addEventListener('change', () => {
    configuracionTemporal.formatoFecha = formatoFechaSelect.value;
});

temaSelect.addEventListener('change', () => {
    configuracionTemporal.tema = temaSelect.value;
    aplicarTema(temaSelect.value);
});

// Event Listener para cerrar sesión
btnCerrarSesion.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
        mostrarError(getTranslation('settingsError', configuracionTemporal.idioma));
    });
});

// Configuración de categorías y subcategorías de gastos
const categoriasGastosDiarios = [
    {
        nombre: "Alimentación",
        subcategorias: [
            "Comidas fuera de casa",
            "Compras de supermercado",
            "Cafés y bebidas",
            "Snacks y golosinas",
            "Otros alimentos"
        ]
    },
    {
        nombre: "Transporte",
        subcategorias: [
            "Uber/Taxi",
            "Transporte público",
            "Combustible",
            "Estacionamiento",
            "Peaje",
            "Otros gastos de transporte"
        ]
    },
    {
        nombre: "Cuidado personal",
        subcategorias: [
            "Cosméticos",
            "Productos de higiene",
            "Medicamentos",
            "Suplementos",
            "Peluquería/Barbería",
            "Otros cuidados personales"
        ]
    },
    {
        nombre: "Entretenimiento",
        subcategorias: [
            "Cine",
            "Eventos",
            "Compras de ocio",
            "Ropa",
            "Accesorios",
            "Juegos y pasatiempos",
            "Otros entretenimientos"
        ]
    },
    {
        nombre: "Mascotas",
        subcategorias: [
            "Comida para mascotas",
            "Veterinario",
            "Accesorios para mascotas",
            "Higiene de mascotas",
            "Otros gastos de mascotas"
        ]
    },
    {
        nombre: "Misceláneos",
        subcategorias: [
            "Compras imprevistas",
            "Propinas",
            "Pagos pequeños",
            "Regalos",
            "Otros gastos misceláneos"
        ]
    }
];

// Configuración de categorías y subcategorías de gastos fijos
const categoriasGastosFijos = [
    {
        nombre: "Vivienda",
        subcategorias: [
            "Alquiler/Hipoteca",
            "Servicios (luz, agua, gas)",
            "Internet",
            "TV por cable/streaming",
            "Mantenimiento",
            "Seguro de hogar",
            "Otros gastos de vivienda"
        ]
    },
    {
        nombre: "Transporte",
        subcategorias: [
            "Seguro de auto",
            "Mantenimiento de vehículo",
            "Pago de auto",
            "Transporte público mensual",
            "Otros gastos fijos de transporte"
        ]
    },
    {
        nombre: "Salud",
        subcategorias: [
            "Seguro médico",
            "Medicamentos recetados",
            "Consultas médicas regulares",
            "Gimnasio",
            "Otros gastos fijos de salud"
        ]
    },
    {
        nombre: "Finanzas",
        subcategorias: [
            "Ahorros",
            "Inversiones",
            "Seguros de vida",
            "Préstamos",
            "Tarjetas de crédito",
            "Otros gastos financieros"
        ]
    },
    {
        nombre: "Educación",
        subcategorias: [
            "Matrícula",
            "Cursos",
            "Materiales educativos",
            "Suscripciones educativas",
            "Otros gastos fijos de educación"
        ]
    },
    {
        nombre: "Servicios",
        subcategorias: [
            "Teléfono móvil",
            "Servicios de limpieza",
            "Servicios de jardinería",
            "Almacenamiento",
            "Otros servicios fijos"
        ]
    }
];

// Configuración de la aplicación
const config = {
    // Configuración de fecha
    fecha: {
        formato: 'DD/MM/YYYY',
        separador: '/'
    }
};

// Función para formatear fecha
function formatearFecha(fecha) {
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const año = fechaObj.getFullYear();
    return `${dia}${config.fecha.separador}${mes}${config.fecha.separador}${año}`;
}

// Exportar las configuraciones y funciones
window.categoriasGastosDiarios = categoriasGastosDiarios;
window.categoriasGastosFijos = categoriasGastosFijos;
window.config = config;
window.formatearFecha = formatearFecha; 
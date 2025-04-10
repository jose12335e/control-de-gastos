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
let usuarioActual = null;

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si Firebase está disponible
    if (!window.isFirebaseAvailable()) {
        console.error('Firebase no está disponible');
        window.location.href = 'index.html';
        return;
    }

    // Verificar estado de autenticación
    auth.onAuthStateChanged(async user => {
        if (user) {
            try {
                // Obtener datos del usuario desde Firestore
                const doc = await window.db.collection('usuarios').doc(user.uid).get();
                if (doc.exists) {
                    usuarioActual = doc.data();
                    cargarConfiguracion();
                } else {
                    console.error('No se encontraron datos del usuario');
                    auth.signOut();
                }
            } catch (error) {
                console.error('Error al obtener datos del usuario:', error);
                mostrarError('Error al cargar los datos del usuario');
            }
        } else {
            window.location.href = 'index.html';
        }
    });
});

// Función para cargar la configuración guardada
function cargarConfiguracion() {
    if (!usuarioActual) return;

    try {
        configuracionTemporal = usuarioActual.configuracion || {
            moneda: 'DOP',
            idioma: 'es',
            formatoFecha: 'DD/MM/YYYY',
            tema: 'claro'
        };

        // Cargar valores en los selectores
        if (monedaSelect) monedaSelect.value = configuracionTemporal.moneda;
        if (idiomaSelect) idiomaSelect.value = configuracionTemporal.idioma;
        if (formatoFechaSelect) formatoFechaSelect.value = configuracionTemporal.formatoFecha;
        if (temaSelect) temaSelect.value = configuracionTemporal.tema;

        // Mostrar nombre del usuario
        if (nombreUsuarioSpan) {
            nombreUsuarioSpan.textContent = usuarioActual.nombre || 'Usuario';
        }

        // Aplicar tema y traducción actual
        aplicarTema(configuracionTemporal.tema);
        traducirInterfaz(configuracionTemporal.idioma);

    } catch (error) {
        console.error('Error al cargar configuración:', error);
        mostrarError('Error al cargar la configuración');
    }
}

// Función para guardar la configuración
async function guardarConfiguracion() {
    if (!usuarioActual) return;

    try {
        // Actualizar configuración temporal con los valores actuales
        configuracionTemporal = {
            moneda: monedaSelect ? monedaSelect.value : configuracionTemporal.moneda,
            idioma: idiomaSelect ? idiomaSelect.value : configuracionTemporal.idioma,
            formatoFecha: formatoFechaSelect ? formatoFechaSelect.value : configuracionTemporal.formatoFecha,
            tema: temaSelect ? temaSelect.value : configuracionTemporal.tema
        };

        // Guardar en Firestore
        await window.db.collection('usuarios').doc(usuarioActual.id).update({
            configuracion: configuracionTemporal
        });

        // Aplicar cambios
        aplicarTema(configuracionTemporal.tema);
        traducirInterfaz(configuracionTemporal.idioma);

        mostrarExito('Configuración guardada correctamente');
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        mostrarError('Error al guardar la configuración');
    }
}

// Función para traducir la interfaz
function traducirInterfaz(idioma) {
    const traducciones = obtenerTraducciones(idioma);
    
    // Traducir elementos de la página
    document.querySelectorAll('[data-traducir]').forEach(elemento => {
        const clave = elemento.getAttribute('data-traducir');
        if (traducciones[clave]) {
            elemento.textContent = traducciones[clave];
        }
    });
}

// Función para obtener traducciones según el idioma
function obtenerTraducciones(idioma) {
    const traducciones = {
        es: {
            appTitle: 'Control de Gastos',
            settingsTitle: 'Configuración',
            currency: 'Moneda',
            language: 'Idioma',
            dateFormat: 'Formato de fecha',
            theme: 'Tema',
            saveChanges: 'Guardar cambios',
            logout: 'Cerrar sesión',
            home: 'Inicio',
            settings: 'Configuración',
            lightTheme: 'Tema claro',
            darkTheme: 'Tema oscuro',
            blueTheme: 'Tema azul',
            settingsSaved: 'Configuración guardada correctamente',
            settingsError: 'Error al guardar la configuración'
        },
        en: {
            appTitle: 'Expense Tracker',
            settingsTitle: 'Settings',
            currency: 'Currency',
            language: 'Language',
            dateFormat: 'Date format',
            theme: 'Theme',
            saveChanges: 'Save changes',
            logout: 'Logout',
            home: 'Home',
            settings: 'Settings',
            lightTheme: 'Light theme',
            darkTheme: 'Dark theme',
            blueTheme: 'Blue theme',
            settingsSaved: 'Settings saved successfully',
            settingsError: 'Error saving settings'
        }
    };
    
    return traducciones[idioma] || traducciones['es'];
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
function mostrarExito(mensaje) {
    const mensajeExito = document.createElement('div');
    mensajeExito.className = 'mensaje-exito';
    mensajeExito.textContent = mensaje;
    mostrarMensaje(mensajeExito);
}

// Función para mostrar mensajes temporales
function mostrarMensaje(elementoMensaje) {
    document.body.appendChild(elementoMensaje);
    setTimeout(() => elementoMensaje.classList.add('mostrar'), 100);
    setTimeout(() => {
        elementoMensaje.classList.remove('mostrar');
        setTimeout(() => elementoMensaje.remove(), 300);
    }, 3000);
}

// Event Listeners
if (guardarConfigBtn) {
    guardarConfigBtn.addEventListener('click', guardarConfiguracion);
}

// Event Listeners para los selectores
if (monedaSelect) {
    monedaSelect.addEventListener('change', () => {
        configuracionTemporal.moneda = monedaSelect.value;
    });
}

if (idiomaSelect) {
    idiomaSelect.addEventListener('change', () => {
        configuracionTemporal.idioma = idiomaSelect.value;
        traducirInterfaz(idiomaSelect.value);
    });
}

if (formatoFechaSelect) {
    formatoFechaSelect.addEventListener('change', () => {
        configuracionTemporal.formatoFecha = formatoFechaSelect.value;
    });
}

if (temaSelect) {
    temaSelect.addEventListener('change', () => {
        configuracionTemporal.tema = temaSelect.value;
        aplicarTema(temaSelect.value);
    });
}

// Event Listener para cerrar sesión
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
        auth.signOut()
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch(error => {
                console.error('Error al cerrar sesión:', error);
                mostrarError('Error al cerrar sesión');
            });
    });
}

// Exportar funciones necesarias
window.formatearMoneda = function(monto, moneda = configuracionTemporal.moneda) {
    return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: moneda
    }).format(monto);
};

window.formatearFecha = function(fecha, formato = configuracionTemporal.formatoFecha) {
    const date = new Date(fecha);
    const opciones = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    return date.toLocaleDateString('es-DO', opciones);
};

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
    // Configuración de fechas
    fecha: {
        formato: 'DD/MM/YYYY',
        separador: '/',
        orden: ['dia', 'mes', 'año']
    },
    
    // Configuración de notificaciones
    notificaciones: {
        porcentajeAlerta: 80, // Porcentaje del sueldo gastado para activar la alerta
        intervaloVerificacion: 1000 * 60 * 60, // Verificar cada hora
        mensajes: {
            limiteCercano: '¡Alerta! Has gastado el {porcentaje}% de tu sueldo mensual',
            limiteAlcanzado: '¡Advertencia! Has alcanzado el {porcentaje}% de tu sueldo mensual',
            limiteExcedido: '¡Peligro! Has excedido el {porcentaje}% de tu sueldo mensual'
        }
    }
};

// Función para formatear fechas
function formatearFecha(fecha) {
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const año = fechaObj.getFullYear();
    
    return `${dia}${config.fecha.separador}${mes}${config.fecha.separador}${año}`;
}

// Función para verificar límites de gastos
function verificarLimiteGastos(sueldo, gastosFijos, gastosDiarios) {
    const totalGastosFijos = gastosFijos.reduce((total, gasto) => total + gasto.monto, 0);
    const totalGastosDiarios = gastosDiarios.reduce((total, gasto) => total + gasto.monto, 0);
    const totalGastos = totalGastosFijos + totalGastosDiarios;
    
    const porcentajeGastado = (totalGastos / sueldo) * 100;
    
    if (porcentajeGastado >= 100) {
        return {
            alerta: true,
            mensaje: config.notificaciones.mensajes.limiteExcedido.replace('{porcentaje}', Math.round(porcentajeGastado))
        };
    } else if (porcentajeGastado >= config.notificaciones.porcentajeAlerta) {
        return {
            alerta: true,
            mensaje: config.notificaciones.mensajes.limiteAlcanzado.replace('{porcentaje}', Math.round(porcentajeGastado))
        };
    } else if (porcentajeGastado >= config.notificaciones.porcentajeAlerta * 0.8) {
        return {
            alerta: true,
            mensaje: config.notificaciones.mensajes.limiteCercano.replace('{porcentaje}', Math.round(porcentajeGastado))
        };
    }
    
    return {
        alerta: false,
        mensaje: ''
    };
}

// Exportar configuración y funciones
window.categoriasGastosDiarios = categoriasGastosDiarios;
window.categoriasGastosFijos = categoriasGastosFijos;
window.config = config;
window.formatearFecha = formatearFecha;
window.verificarLimiteGastos = verificarLimiteGastos; 
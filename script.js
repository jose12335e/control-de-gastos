// Variables globales
let graficoGastos = null;
let graficoGastosFijos = null;
let graficoGastosDiarios = null;
let usuarioActual = null;
let ultimaFechaSistema = null;

// Variables para el sistema de notificaciones
let notificacionesActivas = false;
let ultimaNotificacion = null;

// Categorías predefinidas para gastos fijos
const categoriasGastosFijos = [
    {
        nombre: "Vivienda",
        subcategorias: ["Alquiler", "Hipoteca", "Servicios básicos", "Mantenimiento"]
    },
    {
        nombre: "Transporte",
        subcategorias: ["Combustible", "Transporte público", "Mantenimiento vehículo", "Seguro"]
    },
    {
        nombre: "Alimentación",
        subcategorias: ["Supermercado", "Restaurantes", "Delivery", "Otros"]
    },
    {
        nombre: "Servicios",
        subcategorias: ["Internet", "Teléfono", "TV por cable", "Otros servicios"]
    },
    {
        nombre: "Salud",
        subcategorias: ["Seguro médico", "Medicamentos", "Consultas médicas", "Otros gastos de salud"]
    },
    {
        nombre: "Educación",
        subcategorias: ["Colegiatura", "Materiales", "Cursos", "Otros gastos educativos"]
    }
];

// Categorías predefinidas para gastos diarios
const categoriasGastosDiarios = [
    {
        nombre: "Alimentación",
        subcategorias: ["Desayuno", "Almuerzo", "Cena", "Snacks", "Bebidas"]
    },
    {
        nombre: "Transporte",
        subcategorias: ["Taxi", "Bus", "Metro", "Otros"]
    },
    {
        nombre: "Entretenimiento",
        subcategorias: ["Cine", "Teatro", "Deportes", "Otros"]
    },
    {
        nombre: "Compras",
        subcategorias: ["Ropa", "Calzado", "Accesorios", "Otros"]
    },
    {
        nombre: "Salud",
        subcategorias: ["Farmacia", "Consultas", "Otros"]
    }
];

// Elementos del DOM
const formSalario = document.getElementById('form-salario');
const inputSalario = document.getElementById('salario');
const inputDiaCobro = document.getElementById('dia-cobro');
const salarioResumen = document.getElementById('salario-resumen');
const diaCobroResumen = document.getElementById('dia-cobro-resumen');

let formGastosFijos;
let formGastosDiarios;
let categoriaGastoFijo;
let subcategoriaGastoFijo;
let inputMontoFijo;
let inputComentarioFijo;
let categoriaGastoDiario;
let subcategoriaGastoDiario;
let inputMontoDiario;
let inputComentarioDiario;

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM cargado, inicializando aplicación...");
    
    // Inicializar elementos del DOM
    formGastosFijos = document.getElementById('form-gastos-fijos');
    formGastosDiarios = document.getElementById('form-gastos-diarios');
    categoriaGastoFijo = document.getElementById('categoria-gasto-fijo');
    subcategoriaGastoFijo = document.getElementById('subcategoria-gasto-fijo');
    inputMontoFijo = document.getElementById('monto-fijo');
    inputComentarioFijo = document.getElementById('comentario-fijo');
    categoriaGastoDiario = document.getElementById('categoria-gasto-diario');
    subcategoriaGastoDiario = document.getElementById('subcategoria-gasto-diario');
    inputMontoDiario = document.getElementById('monto-diario');
    inputComentarioDiario = document.getElementById('comentario-diario');
    
    // Inicializar categorías
    inicializarCategorias();
    
    // Inicializar formulario de salario
    inicializarFormularioSalario();
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Cargar datos del usuario
    await cargarDatosUsuario();
});

// Función para inicializar las categorías
function inicializarCategorias() {
    console.log("Inicializando categorías...");
    
    if (!categoriaGastoFijo || !categoriaGastoDiario) {
        console.error("No se encontraron los elementos de categorías en el DOM");
        return;
    }
    
    // Limpiar opciones existentes
    categoriaGastoFijo.innerHTML = '<option value="">Selecciona una categoría</option>';
    categoriaGastoDiario.innerHTML = '<option value="">Selecciona una categoría</option>';
    
    // Llenar categorías de gastos fijos
    categoriasGastosFijos.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.nombre;
        option.textContent = categoria.nombre;
        categoriaGastoFijo.appendChild(option);
    });
    
    // Llenar categorías de gastos diarios
    categoriasGastosDiarios.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.nombre;
        option.textContent = categoria.nombre;
        categoriaGastoDiario.appendChild(option);
    });
    
    // Event listeners para cambios en categorías
    categoriaGastoFijo.addEventListener('change', () => {
        const categoriaSeleccionada = categoriaGastoFijo.value;
        cargarSubcategoriasFijos(categoriaSeleccionada);
    });
    
    categoriaGastoDiario.addEventListener('change', () => {
        const categoriaSeleccionada = categoriaGastoDiario.value;
        cargarSubcategoriasDiarios(categoriaSeleccionada);
    });
    
    console.log("Categorías inicializadas correctamente");
}

// Función para cargar subcategorías de gastos fijos
function cargarSubcategoriasFijos(categoriaSeleccionada) {
    console.log("Cargando subcategorías para gastos fijos:", categoriaSeleccionada);
    
    if (!subcategoriaGastoFijo) {
        console.error("No se encontró el elemento de subcategorías de gastos fijos");
        return;
    }
    
    // Limpiar opciones actuales
    subcategoriaGastoFijo.innerHTML = '<option value="">Selecciona una subcategoría</option>';
    
    // Encontrar la categoría seleccionada
    const categoria = categoriasGastosFijos.find(cat => cat.nombre === categoriaSeleccionada);
    if (categoria) {
        // Agregar las subcategorías correspondientes
        categoria.subcategorias.forEach(subcategoria => {
            const option = document.createElement('option');
            option.value = subcategoria;
            option.textContent = subcategoria;
            subcategoriaGastoFijo.appendChild(option);
        });
        console.log("Subcategorías cargadas:", categoria.subcategorias);
    } else {
        console.warn("No se encontró la categoría seleccionada:", categoriaSeleccionada);
    }
}

// Función para cargar subcategorías de gastos diarios
function cargarSubcategoriasDiarios(categoriaSeleccionada) {
    console.log("Cargando subcategorías para gastos diarios:", categoriaSeleccionada);
    
    if (!subcategoriaGastoDiario) {
        console.error("No se encontró el elemento de subcategorías de gastos diarios");
        return;
    }
    
    // Limpiar opciones actuales
    subcategoriaGastoDiario.innerHTML = '<option value="">Selecciona una subcategoría</option>';
    
    // Encontrar la categoría seleccionada
    const categoria = categoriasGastosDiarios.find(cat => cat.nombre === categoriaSeleccionada);
    if (categoria) {
        // Agregar las subcategorías correspondientes
        categoria.subcategorias.forEach(subcategoria => {
            const option = document.createElement('option');
            option.value = subcategoria;
            option.textContent = subcategoria;
            subcategoriaGastoDiario.appendChild(option);
        });
        console.log("Subcategorías cargadas:", categoria.subcategorias);
    } else {
        console.warn("No se encontró la categoría seleccionada:", categoriaSeleccionada);
    }
}

// Función para inicializar el formulario de salario
function inicializarFormularioSalario() {
    console.log("Inicializando formulario de salario...");
    
    if (!formSalario || !inputDiaCobro) {
        console.error("No se encontraron los elementos del formulario de salario");
        return;
    }
    
    // Establecer la fecha actual en el campo de fecha del sistema
    const fechaSistema = document.getElementById('fecha-sistema');
    if (fechaSistema) {
        const hoy = new Date();
        fechaSistema.value = hoy.toISOString().split('T')[0];
        ultimaFechaSistema = hoy;
    }
    
    // Event listener para el formulario de salario
    formSalario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const salario = parseFloat(document.getElementById('salario').value);
        const diaCobro = parseInt(document.getElementById('dia-cobro').value);
        const fechaSistema = document.getElementById('fecha-sistema').value;
        
        if (isNaN(salario) || salario <= 0) {
            mostrarMensaje('Por favor, ingresa un salario válido', 'error');
            return;
        }
        
        if (isNaN(diaCobro) || diaCobro < 1 || diaCobro > 31) {
            mostrarMensaje('Por favor, ingresa un día de cobro válido (1-31)', 'error');
            return;
        }
        
        try {
            await guardarSalario(salario, diaCobro, fechaSistema);
            mostrarMensaje('Salario guardado correctamente', 'success');
            
            // Actualizar la variable global
            if (usuarioActual) {
                usuarioActual.salario = salario;
                usuarioActual.diaCobro = diaCobro;
                usuarioActual.ultimaFechaSistema = fechaSistema;
            }
        } catch (error) {
            console.error('Error al guardar el salario:', error);
            mostrarMensaje('Error al guardar el salario: ' + error.message, 'error');
        }
    });
    
    console.log("Formulario de salario inicializado correctamente");
}

// Función para verificar el cambio de mes
async function verificarCambioMes(fechaActual) {
    const usuario = await obtenerUsuarioActual();
    if (!usuario || !usuario.ultimaFechaSistema) return;
    
    const ultimaFecha = new Date(usuario.ultimaFechaSistema);
    const nuevaFecha = new Date(fechaActual);
    
    // Verificar si ha cambiado el mes
    if (ultimaFecha.getMonth() !== nuevaFecha.getMonth() || 
        ultimaFecha.getFullYear() !== nuevaFecha.getFullYear()) {
        
        // 1. Guardar gastos del mes anterior en el historial
        const nombreMesAnterior = ultimaFecha.toLocaleDateString('es-ES', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        const historialMes = {
            nombre: nombreMesAnterior,
            gastosFijos: usuario.gastosFijos || [],
            gastosDiarios: usuario.gastosDiarios || [],
            salarioInicial: usuario.salario || 0,
            salarioRestante: usuario.salario - calcularTotalGastos(usuario)
        };
        
        // Inicializar el array de historial si no existe
        if (!usuario.historialMensual) {
            usuario.historialMensual = [];
        }
        
        // Agregar el mes al historial
        usuario.historialMensual.push(historialMes);
        
        // 2. Reiniciar el salario restante
        usuario.salarioRestante = usuario.salario;
        
        // 3. Vaciar las listas de gastos
        usuario.gastosFijos = [];
        usuario.gastosDiarios = [];
        
        // Actualizar la última fecha del sistema
        usuario.ultimaFechaSistema = fechaActual;
        
        // Guardar los cambios en Firebase
        if (window.db && usuario.uid) {
            await window.db.collection('usuarios').doc(usuario.uid).update({
                historialMensual: usuario.historialMensual,
                gastosFijos: usuario.gastosFijos,
                gastosDiarios: usuario.gastosDiarios,
                salarioRestante: usuario.salarioRestante,
                ultimaFechaSistema: usuario.ultimaFechaSistema,
                ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Actualizar localStorage
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        
        // Actualizar la variable global
        window.usuarioActual = usuario;
        
        // Actualizar la interfaz
        await actualizarEstadisticas();
        await actualizarHistorialGastos();
        
        mostrarMensaje(`Se ha iniciado un nuevo mes: ${nombreMesAnterior}`, 'success');
    }
}

// Función auxiliar para calcular el total de gastos
function calcularTotalGastos(usuario) {
    const gastosFijos = usuario.gastosFijos || [];
    const gastosDiarios = usuario.gastosDiarios || [];
    
    const totalFijos = gastosFijos.reduce((total, gasto) => total + gasto.monto, 0);
    const totalDiarios = gastosDiarios.reduce((total, gasto) => total + gasto.monto, 0);
    
    return totalFijos + totalDiarios;
}

// Función para configurar event listeners
function configurarEventListeners() {
    console.log("Configurando event listeners...");
    
    if (formGastosFijos) {
        formGastosFijos.addEventListener('submit', guardarGastoFijo);
        console.log("Event listener para gastos fijos configurado");
    } else {
        console.warn("No se encontró el formulario de gastos fijos");
    }
    
    if (formGastosDiarios) {
        formGastosDiarios.addEventListener('submit', guardarGastoDiario);
        console.log("Event listener para gastos diarios configurado");
    } else {
        console.warn("No se encontró el formulario de gastos diarios");
    }
    
    console.log("Event listeners configurados correctamente");
}

// Función para formatear moneda
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

// Función para mostrar mensajes
function mostrarMensaje(mensaje, tipo) {
    console.log(`Mensaje (${tipo}):`, mensaje);
    
    const mensajeElement = document.createElement('div');
    mensajeElement.className = `mensaje ${tipo}`;
    mensajeElement.textContent = mensaje;
    
    document.body.appendChild(mensajeElement);
    
    setTimeout(() => {
        mensajeElement.remove();
    }, 3000);
}

// Función para actualizar estadísticas
async function actualizarEstadisticas() {
    const usuario = await obtenerUsuarioActual();
    if (!usuario) return;

    // Actualizar resumen de salario
    const salarioResumen = document.getElementById('salario-resumen');
    const diaCobroResumen = document.getElementById('dia-cobro-resumen');
    if (salarioResumen) salarioResumen.textContent = formatearMoneda(usuario.salario);
    if (diaCobroResumen) diaCobroResumen.textContent = usuario.diaCobro;

    // Calcular totales de gastos
    const gastosFijos = usuario.gastosFijos || [];
    const gastosDiarios = usuario.gastosDiarios || [];
    
    const totalGastosFijos = gastosFijos.reduce((total, gasto) => total + gasto.monto, 0);
    const totalGastosDiarios = gastosDiarios.reduce((total, gasto) => total + gasto.monto, 0);
    const totalGastos = totalGastosFijos + totalGastosDiarios;

    // Actualizar elementos de estadísticas
    const salarioActual = document.getElementById('salario-actual');
    const gastosFijosTotal = document.getElementById('gastos-fijos-total');
    const gastosDiariosTotal = document.getElementById('gastos-diarios-total');
    const totalGastosElement = document.getElementById('total-gastos');
    const salarioRestante = document.getElementById('salario-restante');

    if (salarioActual) salarioActual.textContent = formatearMoneda(usuario.salario);
    if (gastosFijosTotal) gastosFijosTotal.textContent = formatearMoneda(totalGastosFijos);
    if (gastosDiariosTotal) gastosDiariosTotal.textContent = formatearMoneda(totalGastosDiarios);
    if (totalGastosElement) totalGastosElement.textContent = formatearMoneda(totalGastos);
    if (salarioRestante) salarioRestante.textContent = formatearMoneda(usuario.salario - totalGastos);

    // Actualizar gráficos
    actualizarGraficos(gastosFijos, gastosDiarios);
}

// Función para actualizar gráficos
function actualizarGraficos(gastosFijos, gastosDiarios) {
    // Agrupar todos los gastos por categoría
    const gastosPorCategoria = {};
    
    // Agregar gastos fijos
    gastosFijos.forEach(gasto => {
        if (!gastosPorCategoria[gasto.categoria]) {
            gastosPorCategoria[gasto.categoria] = 0;
        }
        gastosPorCategoria[gasto.categoria] += gasto.monto;
    });
    
    // Agregar gastos diarios
    gastosDiarios.forEach(gasto => {
        if (!gastosPorCategoria[gasto.categoria]) {
            gastosPorCategoria[gasto.categoria] = 0;
        }
        gastosPorCategoria[gasto.categoria] += gasto.monto;
    });

    // Preparar datos para el gráfico
    const labels = Object.keys(gastosPorCategoria);
    const data = Object.values(gastosPorCategoria);

    // Crear el gráfico de pastel
    const ctx = document.getElementById('grafico-gastos');
    if (ctx) {
        if (graficoGastos) {
            graficoGastos.destroy();
        }
        graficoGastos = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Distribución de Gastos por Categoría'
                    }
                }
            }
        });
    }
}

// Función para actualizar el historial de gastos
async function actualizarHistorialGastos() {
    const tbody = document.getElementById('historial-gastos-body');
    const tipoFiltro = document.getElementById('filtro-tipo-gasto').value;
    const mesFiltro = document.getElementById('filtro-mes').value;
    
    if (!tbody) return;
    
    // Limpiar la tabla
    tbody.innerHTML = '';
    
    // Obtener usuario actual
    const usuario = await obtenerUsuarioActual();
    if (!usuario) return;
    
    // Obtener todos los gastos
    let gastos = [];
    
    // Agregar gastos fijos
    if (tipoFiltro === 'todos' || tipoFiltro === 'fijos') {
        const gastosFijos = usuario.gastosFijos || [];
        gastosFijos.forEach(gasto => {
            gastos.push({
                ...gasto,
                tipo: 'Fijo',
                fecha: new Date(gasto.fecha)
            });
        });
    }
    
    // Agregar gastos diarios
    if (tipoFiltro === 'todos' || tipoFiltro === 'diarios') {
        const gastosDiarios = usuario.gastosDiarios || [];
        gastosDiarios.forEach(gasto => {
            gastos.push({
                ...gasto,
                tipo: 'Diario',
                fecha: new Date(gasto.fecha)
            });
        });
    }
    
    // Filtrar por mes si se seleccionó uno
    if (mesFiltro) {
        const [year, month] = mesFiltro.split('-');
        gastos = gastos.filter(gasto => {
            const fecha = gasto.fecha;
            return fecha.getFullYear() === parseInt(year) && 
                   fecha.getMonth() === parseInt(month) - 1;
        });
    }
    
    // Ordenar por fecha (más reciente primero)
    gastos.sort((a, b) => b.fecha - a.fecha);
    
    // Crear filas de la tabla
    gastos.forEach(gasto => {
        const tr = document.createElement('tr');
        
        // Formatear la fecha
        const fecha = gasto.fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        tr.innerHTML = `
            <td>${fecha}</td>
            <td>${gasto.tipo}</td>
            <td>${gasto.categoria}</td>
            <td>${gasto.subcategoria || '-'}</td>
            <td>${formatearMoneda(gasto.monto)}</td>
            <td>${gasto.comentario || '-'}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Agregar event listeners para los filtros
document.addEventListener('DOMContentLoaded', () => {
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroMes = document.getElementById('filtro-mes');
    
    if (filtroTipo) {
        filtroTipo.addEventListener('change', actualizarHistorialGastos);
    }
    
    if (filtroMes) {
        filtroMes.addEventListener('change', actualizarHistorialGastos);
    }
});

// Función para guardar gasto fijo
async function guardarGastoFijo(event) {
    event.preventDefault();
    
    const usuario = await obtenerUsuarioActual();
    if (!usuario) {
        mostrarMensaje('Debes iniciar sesión para guardar gastos', 'error');
        return;
    }
    
    const categoria = document.getElementById('categoria-gasto-fijo').value;
    const subcategoria = document.getElementById('subcategoria-gasto-fijo').value;
    const monto = parseFloat(document.getElementById('monto-fijo').value);
    const comentario = document.getElementById('comentario-fijo').value;
    const fecha = document.getElementById('fecha-gasto-fijo').value;
    
    if (!categoria || !subcategoria || isNaN(monto) || !fecha) {
        mostrarMensaje('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    try {
        // Crear el objeto del gasto
        const nuevoGasto = {
            categoria,
            subcategoria,
            monto,
            comentario,
            fecha,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Inicializar el array de gastos fijos si no existe
        if (!usuario.gastosFijos) {
            usuario.gastosFijos = [];
        }
        
        // Agregar el nuevo gasto
        usuario.gastosFijos.push(nuevoGasto);
        
        // Actualizar en Firebase si está disponible
        if (window.db && usuario.uid) {
            await window.db.collection('usuarios').doc(usuario.uid).update({
                gastosFijos: usuario.gastosFijos,
                ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Actualizar en localStorage
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        
        // Actualizar la variable global
        window.usuarioActual = usuario;
        
        // Actualizar la interfaz
        await actualizarEstadisticas();
        await actualizarHistorialGastos();
        
        // Limpiar el formulario
        document.getElementById('form-gastos-fijos').reset();
        
        mostrarMensaje('Gasto fijo guardado correctamente', 'success');
    } catch (error) {
        console.error('Error al guardar el gasto fijo:', error);
        mostrarMensaje('Error al guardar el gasto fijo: ' + error.message, 'error');
    }
}

// Función para guardar gasto diario
async function guardarGastoDiario(event) {
    event.preventDefault();
    
    const usuario = await obtenerUsuarioActual();
    if (!usuario) {
        mostrarMensaje('Debes iniciar sesión para guardar gastos', 'error');
        return;
    }
    
    const categoria = document.getElementById('categoria-gasto-diario').value;
    const subcategoria = document.getElementById('subcategoria-gasto-diario').value;
    const monto = parseFloat(document.getElementById('monto-diario').value);
    const comentario = document.getElementById('comentario-diario').value;
    const fecha = document.getElementById('fecha-gasto-diario').value;
    
    if (!categoria || !subcategoria || isNaN(monto) || !fecha) {
        mostrarMensaje('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    try {
        // Crear el objeto del gasto
        const nuevoGasto = {
            categoria,
            subcategoria,
            monto,
            comentario,
            fecha,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Inicializar el array de gastos diarios si no existe
        if (!usuario.gastosDiarios) {
            usuario.gastosDiarios = [];
        }
        
        // Agregar el nuevo gasto
        usuario.gastosDiarios.push(nuevoGasto);
        
        // Actualizar en Firebase si está disponible
        if (window.db && usuario.uid) {
            await window.db.collection('usuarios').doc(usuario.uid).update({
                gastosDiarios: usuario.gastosDiarios,
                ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Actualizar en localStorage
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        
        // Actualizar la variable global
        window.usuarioActual = usuario;
        
        // Actualizar la interfaz
        await actualizarEstadisticas();
        await actualizarHistorialGastos();
        
        // Limpiar el formulario
        document.getElementById('form-gastos-diarios').reset();
        
        mostrarMensaje('Gasto diario guardado correctamente', 'success');
    } catch (error) {
        console.error('Error al guardar el gasto diario:', error);
        mostrarMensaje('Error al guardar el gasto diario: ' + error.message, 'error');
    }
}

// Función para cargar datos del usuario
async function cargarDatosUsuario() {
    console.log("Cargando datos del usuario...");
    
    try {
        const usuario = await obtenerUsuarioActual();
        if (!usuario) {
            console.warn("No hay usuario actual para cargar datos");
            return;
        }
        
        // Actualizar la variable global
        usuarioActual = usuario;
        
        // Actualizar salario y día de cobro
        if (usuario.salario) {
            inputSalario.value = usuario.salario;
            salarioResumen.textContent = formatearMoneda(usuario.salario);
        }
        
        if (usuario.diaCobro) {
            const fecha = new Date();
            fecha.setDate(usuario.diaCobro);
            inputDiaCobro.value = fecha.toISOString().split('T')[0];
            diaCobroResumen.textContent = usuario.diaCobro;
        }
        
        // Actualizar estadísticas
        await actualizarEstadisticas();
        
        console.log("Datos del usuario cargados correctamente");
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        mostrarMensaje('Error al cargar los datos', 'error');
    }
}

// Función para obtener usuario actual
async function obtenerUsuarioActual() {
    console.log("Obteniendo usuario actual...");
    
    // Verificar si hay un usuario en la variable global
    if (window.usuarioActual) {
        console.log("Usuario encontrado en variable global");
        return window.usuarioActual;
    }
    
    // Verificar si hay un usuario en localStorage
    const usuarioLocalStorage = localStorage.getItem('usuarioActual');
    if (usuarioLocalStorage) {
        try {
            const usuario = JSON.parse(usuarioLocalStorage);
            console.log("Usuario encontrado en localStorage");
            window.usuarioActual = usuario;
            return usuario;
        } catch (error) {
            console.error("Error al parsear usuario de localStorage:", error);
            localStorage.removeItem('usuarioActual');
        }
    }
    
    // Verificar si hay un usuario autenticado en Firebase
    const auth = window.auth;
    if (!auth) {
        console.error('Firebase Auth no está disponible');
        return null;
    }
    
    const usuario = auth.currentUser;
    if (!usuario) {
        console.warn("No hay usuario autenticado en Firebase");
        return null;
    }
    
    try {
        // Obtener datos del usuario desde Firestore
        const usuarioRef = window.db.collection('usuarios').doc(usuario.uid);
        const usuarioDoc = await usuarioRef.get();
        
        if (usuarioDoc.exists) {
            const datosUsuario = usuarioDoc.data();
            const usuarioCompleto = {
                uid: usuario.uid,
                email: usuario.email,
                salario: datosUsuario.salario || 0,
                diaCobro: datosUsuario.diaCobro || 1,
                gastosFijos: datosUsuario.gastosFijos || [],
                gastosDiarios: datosUsuario.gastosDiarios || [],
                ultimaFechaSistema: datosUsuario.ultimaFechaSistema || null,
                salarioRestante: datosUsuario.salarioRestante || 0
            };
            
            // Guardar en localStorage y variable global
            localStorage.setItem('usuarioActual', JSON.stringify(usuarioCompleto));
            window.usuarioActual = usuarioCompleto;
            
            console.log("Usuario obtenido de Firestore");
            return usuarioCompleto;
        } else {
            // Si el documento no existe, crearlo con valores por defecto
            const nuevoUsuario = {
                uid: usuario.uid,
                email: usuario.email,
                salario: 0,
                diaCobro: 1,
                gastosFijos: [],
                gastosDiarios: [],
                ultimaFechaSistema: null,
                salarioRestante: 0
            };
            
            await usuarioRef.set({
                ...nuevoUsuario,
                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Guardar en localStorage y variable global
            localStorage.setItem('usuarioActual', JSON.stringify(nuevoUsuario));
            window.usuarioActual = nuevoUsuario;
            
            console.log("Nuevo usuario creado en Firestore");
            return nuevoUsuario;
        }
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        return null;
    }
}

// Función para actualizar el resumen de salario
function actualizarResumenSalario(salario, diaCobro) {
    const salarioResumen = document.getElementById('salario-resumen');
    const diaCobroResumen = document.getElementById('dia-cobro-resumen');
    
    if (salarioResumen && diaCobroResumen) {
        salarioResumen.textContent = formatearMoneda(salario);
        // Asegurarnos de que el día de cobro sea un número
        const dia = parseInt(diaCobro);
        diaCobroResumen.textContent = dia;
    }
}

// Modificar la función guardarSalario para incluir la fecha del sistema
async function guardarSalario(salario, diaCobro, fechaSistema) {
    const usuario = await obtenerUsuarioActual();
    if (!usuario) {
        throw new Error('No hay usuario autenticado');
    }

    try {
        // Validar que el día de cobro sea un número entre 1 y 31
        const dia = parseInt(diaCobro);
        if (isNaN(dia) || dia < 1 || dia > 31) {
            throw new Error('El día de cobro debe ser un número entre 1 y 31');
        }

        // Verificar cambio de mes
        await verificarCambioMes(fechaSistema);

        // Actualizar en Firebase si está disponible
        if (window.db && usuario.uid) {
            const usuarioRef = window.db.collection('usuarios').doc(usuario.uid);
            await usuarioRef.update({
                salario: salario,
                diaCobro: dia,
                ultimaFechaSistema: fechaSistema,
                ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Si no hay Firebase, actualizar en localStorage
            usuario.salario = salario;
            usuario.diaCobro = dia;
            usuario.ultimaFechaSistema = fechaSistema;
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        }

        // Actualizar la variable global
        window.usuarioActual = usuario;
        window.usuarioActual.salario = salario;
        window.usuarioActual.diaCobro = dia;
        window.usuarioActual.ultimaFechaSistema = fechaSistema;

        // Actualizar estadísticas
        await actualizarEstadisticas();
        
        // Actualizar resumen de salario
        actualizarResumenSalario(salario, dia);
        
        return true;
    } catch (error) {
        console.error('Error al guardar el salario:', error);
        throw error;
    }
} 
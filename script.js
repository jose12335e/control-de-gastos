// Variables globales
let graficoGastos = null;

// Categorías predefinidas para gastos fijos
const categoriasGastosFijos = [
    {
        nombre: "Vivienda",
        subcategorias: ["Hipoteca o alquiler", "Impuestos sobre la propiedad", "Seguro de vivienda"]
    },
    {
        nombre: "Servicios públicos",
        subcategorias: ["Electricidad", "Agua", "Gas", "Internet", "Teléfono fijo"]
    },
    {
        nombre: "Transporte",
        subcategorias: ["Pago de préstamo o arrendamiento de vehículo", "Seguro de automóvil", "Combustible", "Mantenimiento del vehículo"]
    },
    {
        nombre: "Seguros",
        subcategorias: ["Seguro de salud", "Seguro de vida", "Seguro de automóvil"]
    },
    {
        nombre: "Educación",
        subcategorias: ["Colegiaturas", "Material educativo"]
    },
    {
        nombre: "Alimentación",
        subcategorias: ["Despensa mensual"]
    },
    {
        nombre: "Entretenimiento y suscripciones",
        subcategorias: ["Servicios de streaming (Netflix, Spotify, etc.)", "Gimnasio", "Suscripciones a revistas o periódicos"]
    },
    {
        nombre: "Otros gastos fijos",
        subcategorias: ["Cuidado personal", "Gastos en mascotas", "Donaciones o aportaciones regulares"]
    }
];

// Categorías predefinidas para gastos diarios
const categoriasGastosDiarios = [
    {
        nombre: "Alimentación",
        subcategorias: ["Desayuno", "Almuerzo", "Cena", "Snacks", "Bebidas", "Restaurantes"]
    },
    {
        nombre: "Transporte",
        subcategorias: ["Transporte público", "Taxi/Uber", "Combustible", "Estacionamiento", "Peaje"]
    },
    {
        nombre: "Entretenimiento",
        subcategorias: ["Cine", "Teatro", "Conciertos", "Deportes", "Juegos", "Otros eventos"]
    },
    {
        nombre: "Compras",
        subcategorias: ["Ropa", "Calzado", "Accesorios", "Regalos", "Artículos varios"]
    },
    {
        nombre: "Salud",
        subcategorias: ["Farmacia", "Consultas médicas", "Vitaminas", "Cuidado personal"]
    },
    {
        nombre: "Servicios",
        subcategorias: ["Lavandería", "Peluquería", "Spa", "Limpieza", "Reparaciones"]
    },
    {
        nombre: "Otros gastos diarios",
        subcategorias: ["Donaciones", "Propinas", "Gastos imprevistos"]
    }
];

// Elementos del DOM
const formSueldo = document.getElementById('form-sueldo');
const inputSueldo = document.getElementById('sueldo');
const inputDiaCobro = document.getElementById('dia-cobro');
const selectMoneda = document.getElementById('moneda');
const sueldoRestanteElement = document.getElementById('sueldo-restante').querySelector('h2');

const formGastoFijo = document.getElementById('form-gasto-fijo');
const categoriaGastoFijo = document.getElementById('categoria-gasto-fijo');
const subcategoriaGastoFijo = document.getElementById('subcategoria-gasto-fijo');
const inputDescripcionFijo = document.getElementById('descripcion-fijo');
const inputMontoFijo = document.getElementById('monto-fijo');
const inputFechaFijo = document.getElementById('fecha-fijo');
const listaGastosFijos = document.getElementById('lista-gastos-fijos');

const formGastoDiario = document.getElementById('form-gasto-diario');
const categoriaGastoDiario = document.getElementById('categoria-gasto-diario');
const subcategoriaGastoDiario = document.getElementById('subcategoria-gasto-diario');
const inputDescripcionDiario = document.getElementById('descripcion-diario');
const inputMontoDiario = document.getElementById('monto-diario');
const inputFechaDiario = document.getElementById('fecha-diario');
const listaGastosDiarios = document.getElementById('lista-gastos-diarios');

const btnVerGastos = document.getElementById('btn-ver-gastos');
const estadisticasDiv = document.getElementById('estadisticas');

// Elementos para el historial de gastos
const filtroTipo = document.getElementById('filtro-tipo');
const ordenarPor = document.getElementById('ordenar-por');
const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');
const historialGastosDiv = document.getElementById('historial-gastos');

// Obtener el usuario actual
const usuario = obtenerUsuarioActual();
if (!usuario) {
    // Si no hay usuario autenticado, redirigir al login
    window.location.href = 'index.html';
}

// Cargar datos del usuario
let sueldo = usuario.sueldo || 0;
let diaCobro = usuario.diaCobro || 1;
let gastosFijos = usuario.gastosFijos || [];
let gastosDiarios = usuario.gastosDiarios || [];

// Cargar configuración del usuario
let configuracion = {};
if (window.formatearMoneda) {
    // Si el archivo config.js está cargado, obtener la configuración
    const configGuardada = localStorage.getItem(`config_${usuario.email}`);
    if (configGuardada) {
        configuracion = JSON.parse(configGuardada);
    }
}

// Actualizar la interfaz con los datos del usuario
inputSueldo.value = sueldo;
inputDiaCobro.value = diaCobro;
actualizarSueldoRestante();
mostrarGastosFijos();
mostrarGastosDiarios();
actualizarGrafico();
mostrarHistorialGastos(); // Mostrar el historial de gastos al cargar la página

// Cargar la moneda guardada al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const usuarioActual = obtenerUsuarioActual();
    if (usuarioActual && usuarioActual.moneda) {
        selectMoneda.value = usuarioActual.moneda;
    }
});

// Event Listeners
formSueldo.addEventListener('submit', (e) => {
    e.preventDefault();
    const sueldo = parseFloat(inputSueldo.value);
    const diaCobro = parseInt(inputDiaCobro.value);
    const moneda = selectMoneda.value;

    // Obtener usuario actual y actualizar sus datos
    const usuarioActual = obtenerUsuarioActual();
    if (usuarioActual) {
        usuarioActual.sueldo = sueldo;
        usuarioActual.diaCobro = diaCobro;
        usuarioActual.moneda = moneda;
        guardarUsuarioActual(usuarioActual);
    }

    actualizarSueldoRestante();
    mostrarExito('Sueldo actualizado correctamente');
});

formGastoFijo.addEventListener('submit', (e) => {
    e.preventDefault();
    const tipo = categoriaGastoFijo.value;
    const subcategoria = subcategoriaGastoFijo.value;
    const descripcion = inputDescripcionFijo.value;
    const monto = parseFloat(inputMontoFijo.value);
    const fecha = inputFechaFijo.value;
    
    const nuevoGasto = {
        id: Date.now().toString(),
        tipo,
        subcategoria,
        descripcion,
        monto,
        fecha
    };
    
    gastosFijos.push(nuevoGasto);
    
    // Guardar en el usuario actual
    usuario.gastosFijos = gastosFijos;
    guardarUsuarioActual(usuario);
    
    mostrarGastosFijos();
    actualizarSueldoRestante();
    actualizarGrafico();
    mostrarHistorialGastos(); // Actualizar el historial de gastos
    
    // Limpiar formulario
    formGastoFijo.reset();
});

formGastoDiario.addEventListener('submit', (e) => {
    e.preventDefault();
    const tipo = categoriaGastoDiario.value;
    const subcategoria = subcategoriaGastoDiario.value;
    const descripcion = inputDescripcionDiario.value;
    const monto = parseFloat(inputMontoDiario.value);
    const fecha = inputFechaDiario.value;
    
    const nuevoGasto = {
        id: Date.now().toString(),
        tipo,
        subcategoria,
        descripcion,
        monto,
        fecha
    };
    
    gastosDiarios.push(nuevoGasto);
    
    // Guardar en el usuario actual
    usuario.gastosDiarios = gastosDiarios;
    guardarUsuarioActual(usuario);
    
    mostrarGastosDiarios();
    actualizarSueldoRestante();
    actualizarGrafico();
    mostrarHistorialGastos();
    
    // Limpiar formulario
    formGastoDiario.reset();
});

btnVerGastos.addEventListener('click', () => {
    mostrarEstadisticas();
});

// Event listener para el botón de aplicar filtros
if (btnAplicarFiltros) {
    btnAplicarFiltros.addEventListener('click', () => {
        mostrarHistorialGastos();
    });
}

// Funciones
function actualizarSueldoRestante() {
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) return;

    const sueldo = usuarioActual.sueldo || 0;
    const gastosFijos = usuarioActual.gastosFijos || [];
    const gastosDiarios = usuarioActual.gastosDiarios || [];
    const moneda = usuarioActual.moneda || 'DOP';

    const totalGastosFijos = gastosFijos.reduce((total, gasto) => total + gasto.monto, 0);
    const totalGastosDiarios = gastosDiarios.reduce((total, gasto) => total + gasto.monto, 0);
    const sueldoRestante = sueldo - totalGastosFijos - totalGastosDiarios;

    const simboloMoneda = obtenerSimboloMoneda(moneda);
    sueldoRestanteElement.textContent = `Sueldo Restante: ${simboloMoneda}${sueldoRestante.toFixed(2)}`;
}

function mostrarGastosFijos() {
    listaGastosFijos.innerHTML = '';
    
    gastosFijos.forEach(gasto => {
        const li = document.createElement('li');
        
        // Usar la función de formateo de fecha si está disponible
        const fechaFormateada = window.formatearFecha ? formatearFecha(gasto.fecha) : formatearFechaLocal(gasto.fecha);
        
        // Usar la función de formateo de moneda si está disponible
        const montoFormateado = window.formatearMoneda ? formatearMoneda(gasto.monto) : `$${gasto.monto.toFixed(2)}`;
        
        li.innerHTML = `
            <div class="gasto-item">
                <div class="gasto-info">
                    <span class="gasto-tipo">${gasto.tipo} - ${gasto.subcategoria}</span>
                    <span class="gasto-descripcion">${gasto.descripcion}</span>
                    <span class="gasto-fecha">${fechaFormateada}</span>
                </div>
                <div class="gasto-monto">${montoFormateado}</div>
                <button class="btn-eliminar" data-id="${gasto.id}">×</button>
            </div>
        `;
        
        listaGastosFijos.appendChild(li);
    });
    
    // Agregar event listeners para los botones de eliminar
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            eliminarGastoFijo(id);
        });
    });
}

function mostrarGastosDiarios() {
    listaGastosDiarios.innerHTML = '';
    
    gastosDiarios.forEach(gasto => {
        const li = document.createElement('li');
        
        // Usar la función de formateo de fecha si está disponible
        const fechaFormateada = window.formatearFecha ? formatearFecha(gasto.fecha) : formatearFechaLocal(gasto.fecha);
        
        // Usar la función de formateo de moneda si está disponible
        const montoFormateado = window.formatearMoneda ? formatearMoneda(gasto.monto) : `$${gasto.monto.toFixed(2)}`;
        
        li.innerHTML = `
            <div class="gasto-item">
                <div class="gasto-info">
                    <span class="gasto-descripcion">${gasto.descripcion}</span>
                    <span class="gasto-fecha">${fechaFormateada}</span>
                </div>
                <div class="gasto-monto">${montoFormateado}</div>
                <button class="btn-eliminar" data-id="${gasto.id}">×</button>
            </div>
        `;
        
        listaGastosDiarios.appendChild(li);
    });
    
    // Agregar event listeners para los botones de eliminar
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            eliminarGastoDiario(id);
        });
    });
}

function eliminarGastoFijo(id) {
    gastosFijos = gastosFijos.filter(gasto => gasto.id !== id);
    
    // Guardar en el usuario actual
    usuario.gastosFijos = gastosFijos;
    guardarUsuarioActual(usuario);
    
    mostrarGastosFijos();
    actualizarSueldoRestante();
    actualizarGrafico();
    mostrarHistorialGastos(); // Actualizar el historial de gastos
}

function eliminarGastoDiario(id) {
    gastosDiarios = gastosDiarios.filter(gasto => gasto.id !== id);
    
    // Guardar en el usuario actual
    usuario.gastosDiarios = gastosDiarios;
    guardarUsuarioActual(usuario);
    
    mostrarGastosDiarios();
    actualizarSueldoRestante();
    actualizarGrafico();
    mostrarHistorialGastos(); // Actualizar el historial de gastos
}

function mostrarEstadisticas() {
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) return;

    const gastosFijos = usuarioActual.gastosFijos || [];
    const gastosDiarios = usuarioActual.gastosDiarios || [];
    const sueldo = usuarioActual.sueldo || 0;
    const moneda = usuarioActual.moneda || 'DOP';

    const totalGastosFijos = gastosFijos.reduce((total, gasto) => total + gasto.monto, 0);
    const totalGastosDiarios = gastosDiarios.reduce((total, gasto) => total + gasto.monto, 0);
    const totalGastos = totalGastosFijos + totalGastosDiarios;
    const sueldoRestante = sueldo - totalGastos;

    // Calcular gastos por tipo
    const gastosPorTipo = {};
    gastosFijos.forEach(gasto => {
        if (!gastosPorTipo[gasto.tipo]) {
            gastosPorTipo[gasto.tipo] = 0;
        }
        gastosPorTipo[gasto.tipo] += gasto.monto;
    });

    const simboloMoneda = obtenerSimboloMoneda(moneda);

    // Crear HTML para estadísticas
    let html = `
        <div class="estadisticas-container">
            <div class="estadistica-general">
                <h3>Resumen General</h3>
                <p>Sueldo: ${simboloMoneda}${sueldo.toFixed(2)}</p>
                <p>Gastos Fijos: ${simboloMoneda}${totalGastosFijos.toFixed(2)}</p>
                <p>Gastos Diarios: ${simboloMoneda}${totalGastosDiarios.toFixed(2)}</p>
                <p>Total Gastos: ${simboloMoneda}${totalGastos.toFixed(2)}</p>
                <p>Sueldo Restante: ${simboloMoneda}${sueldoRestante.toFixed(2)}</p>
            </div>
            <div class="estadistica-tipos">
                <h3>Gastos por Tipo</h3>
    `;

    // Agregar gastos por tipo
    for (const tipo in gastosPorTipo) {
        html += `<p>${tipo}: ${simboloMoneda}${gastosPorTipo[tipo].toFixed(2)}</p>`;
    }

    html += `
            </div>
        </div>
    `;

    estadisticasDiv.innerHTML = html;
    estadisticasDiv.style.display = 'block';
}

function actualizarGrafico() {
    // Calcular gastos por tipo
    const gastosPorTipo = {};
    gastosFijos.forEach(gasto => {
        if (!gastosPorTipo[gasto.tipo]) {
            gastosPorTipo[gasto.tipo] = 0;
        }
        gastosPorTipo[gasto.tipo] += gasto.monto;
    });
    
    // Agregar gastos diarios como una categoría
    const gastosDiariosTotal = gastosDiarios.reduce((total, gasto) => total + gasto.monto, 0);
    if (gastosDiariosTotal > 0) {
        gastosPorTipo['Gastos Diarios'] = gastosDiariosTotal;
    }
    
    // Agregar sueldo restante como una categoría
    const gastosFijosTotal = gastosFijos.reduce((total, gasto) => total + gasto.monto, 0);
    const sueldoRestante = sueldo - gastosFijosTotal - gastosDiariosTotal;
    if (sueldoRestante > 0) {
        gastosPorTipo['Sueldo Restante'] = sueldoRestante;
    }
    
    // Preparar datos para el gráfico
    const labels = Object.keys(gastosPorTipo);
    const data = Object.values(gastosPorTipo);
    const backgroundColors = labels.map(() => getColorAleatorio());
    
    // Destruir el gráfico anterior si existe
    if (graficoGastos) {
        graficoGastos.destroy();
    }
    
    // Crear nuevo gráfico
    const ctx = document.getElementById('grafico-gastos').getContext('2d');
    graficoGastos = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            
                            // Usar la función de formateo de moneda si está disponible
                            const formatearMonto = window.formatearMoneda ? formatearMoneda : (valor) => `$${valor.toFixed(2)}`;
                            
                            return `${label}: ${formatearMonto(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function getColorAleatorio() {
    const letras = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letras[Math.floor(Math.random() * 16)];
    }
    return color;
}

function verificarDiaCobro() {
    const hoy = new Date();
    const diaActual = hoy.getDate();
    
    if (diaActual === diaCobro) {
        // Es día de cobro, resetear sueldo
        sueldo = parseFloat(inputSueldo.value);
        
        // Guardar en el usuario actual
        usuario.sueldo = sueldo;
        guardarUsuarioActual(usuario);
        
        actualizarSueldoRestante();
        actualizarGrafico();
        
        mostrarExito(`¡Es día de cobro! Tu sueldo ha sido actualizado.`);
    }
}

// Verificar día de cobro al cargar la página
verificarDiaCobro();

// Verificar día de cobro cada día a medianoche
setInterval(() => {
    const ahora = new Date();
    if (ahora.getHours() === 0 && ahora.getMinutes() === 0) {
        verificarDiaCobro();
    }
}, 60000); // Verificar cada minuto

// Funciones auxiliares
function mostrarExito(mensaje) {
    alert(mensaje);
}

function mostrarError(mensaje) {
    alert(mensaje);
}

// Función para obtener el usuario actual
function obtenerUsuarioActual() {
    return JSON.parse(localStorage.getItem('usuarioActual'));
}

// Función para guardar el usuario actual
function guardarUsuarioActual(usuario) {
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
}

// Función para mostrar el historial de gastos
function mostrarHistorialGastos() {
    const historialDiv = document.getElementById('historialGastos');
    if (!historialDiv) return;

    // Combinar todos los gastos
    const todosLosGastos = [
        ...gastosFijos.map(gasto => ({...gasto, tipo: 'Fijo'})),
        ...gastosDiarios.map(gasto => ({...gasto, tipo: 'Diario'}))
    ];

    // Ordenar por fecha (más reciente primero)
    todosLosGastos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Limpiar el contenedor
    historialDiv.innerHTML = '';

    if (todosLosGastos.length === 0) {
        historialDiv.innerHTML = '<p class="mensaje-sin-gastos">No hay gastos registrados</p>';
        return;
    }

    // Mostrar cada gasto
    todosLosGastos.forEach(gasto => {
        const fechaFormateada = window.formatearFecha ? formatearFecha(gasto.fecha) : formatearFechaLocal(gasto.fecha);
        const montoFormateado = window.formatearMoneda ? formatearMoneda(gasto.monto) : `$${gasto.monto.toFixed(2)}`;
        
        const gastoElement = document.createElement('div');
        gastoElement.className = 'historial-item';
        gastoElement.innerHTML = `
            <div class="historial-info">
                <span class="historial-fecha">${fechaFormateada}</span>
                <span class="historial-tipo">${gasto.tipo}</span>
                <span class="historial-descripcion">${gasto.tipo === 'Fijo' ? `${gasto.tipo}: ${gasto.descripcion}` : gasto.descripcion}</span>
                <span class="historial-monto">${montoFormateado}</span>
            </div>
        `;
        
        historialDiv.appendChild(gastoElement);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar categorías al iniciar
    cargarCategorias();
    
    // Event listeners para cambios en las categorías
    categoriaGastoFijo.addEventListener('change', (e) => {
        cargarSubcategoriasFijos(e.target.value);
    });
    
    categoriaGastoDiario.addEventListener('change', (e) => {
        cargarSubcategoriasDiarios(e.target.value);
    });

    // Event listeners para filtros de fecha
    const btnFiltrar = document.getElementById('btnFiltrar');
    const btnMostrarTodos = document.getElementById('btnMostrarTodos');
    
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', filtrarGastos);
    }
    
    if (btnMostrarTodos) {
        btnMostrarTodos.addEventListener('click', mostrarTodosLosGastos);
    }
});

// Función para cargar las categorías
function cargarCategorias() {
    // Limpiar selectores
    categoriaGastoFijo.innerHTML = '<option value="" data-translate="selectCategory">Seleccione una categoría</option>';
    subcategoriaGastoFijo.innerHTML = '<option value="" data-translate="selectSubcategory">Seleccione una subcategoría</option>';
    categoriaGastoDiario.innerHTML = '<option value="" data-translate="selectCategory">Seleccione una categoría</option>';
    subcategoriaGastoDiario.innerHTML = '<option value="" data-translate="selectSubcategory">Seleccione una subcategoría</option>';

    // Cargar categorías de gastos fijos
    categoriasGastosFijos.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.nombre;
        option.textContent = categoria.nombre;
        categoriaGastoFijo.appendChild(option);
    });

    // Cargar categorías de gastos diarios
    categoriasGastosDiarios.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.nombre;
        option.textContent = categoria.nombre;
        categoriaGastoDiario.appendChild(option);
    });
}

// Función para cargar subcategorías de gastos fijos
function cargarSubcategoriasFijos(categoriaSeleccionada) {
    subcategoriaGastoFijo.innerHTML = '<option value="" data-translate="selectSubcategory">Seleccione una subcategoría</option>';
    
    if (!categoriaSeleccionada) return;

    const categoria = categoriasGastosFijos.find(cat => cat.nombre === categoriaSeleccionada);
    if (categoria && categoria.subcategorias) {
        categoria.subcategorias.forEach(subcategoria => {
            const option = document.createElement('option');
            option.value = subcategoria;
            option.textContent = subcategoria;
            subcategoriaGastoFijo.appendChild(option);
        });
    }
}

// Función para cargar subcategorías de gastos diarios
function cargarSubcategoriasDiarios(categoriaSeleccionada) {
    subcategoriaGastoDiario.innerHTML = '<option value="" data-translate="selectSubcategory">Seleccione una subcategoría</option>';
    
    if (!categoriaSeleccionada) return;

    const categoria = categoriasGastosDiarios.find(cat => cat.nombre === categoriaSeleccionada);
    if (categoria && categoria.subcategorias) {
        categoria.subcategorias.forEach(subcategoria => {
            const option = document.createElement('option');
            option.value = subcategoria;
            option.textContent = subcategoria;
            subcategoriaGastoDiario.appendChild(option);
        });
    }
}

// Función local para formatear fecha (si no está disponible la función global)
function formatearFechaLocal(fecha) {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString();
}

// Función para filtrar gastos por fecha
function filtrarGastos() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    if (!fechaInicio || !fechaFin) {
        alert('Por favor, selecciona un rango de fechas');
        return;
    }
    
    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);
    
    // Combinar todos los gastos
    const todosLosGastos = [
        ...gastosFijos.map(gasto => ({...gasto, tipo: 'Fijo'})),
        ...gastosDiarios.map(gasto => ({...gasto, tipo: 'Diario'}))
    ];

    // Filtrar por fecha
    const gastosFiltrados = todosLosGastos.filter(gasto => {
        const fechaGasto = new Date(gasto.fecha);
        return fechaGasto >= fechaInicioObj && fechaGasto <= fechaFinObj;
    });

    // Ordenar por fecha (más reciente primero)
    gastosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Mostrar gastos filtrados
    mostrarGastosFiltradosEnHistorial(gastosFiltrados);
}

// Función para mostrar todos los gastos
function mostrarTodosLosGastos() {
    // Limpiar los filtros de fecha
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    
    // Mostrar todos los gastos
    mostrarHistorialGastos();
}

// Función para mostrar gastos filtrados en el historial
function mostrarGastosFiltradosEnHistorial(gastosFiltrados) {
    const historialDiv = document.getElementById('historialGastos');
    if (!historialDiv) return;

    // Limpiar el contenedor
    historialDiv.innerHTML = '';

    if (gastosFiltrados.length === 0) {
        historialDiv.innerHTML = '<p class="mensaje-sin-gastos">No hay gastos en el rango de fechas seleccionado</p>';
        return;
    }

    // Mostrar cada gasto
    gastosFiltrados.forEach(gasto => {
        const fechaFormateada = window.formatearFecha ? formatearFecha(gasto.fecha) : formatearFechaLocal(gasto.fecha);
        const montoFormateado = window.formatearMoneda ? formatearMoneda(gasto.monto) : `$${gasto.monto.toFixed(2)}`;
        
        const gastoElement = document.createElement('div');
        gastoElement.className = 'historial-item';
        gastoElement.innerHTML = `
            <div class="historial-info">
                <span class="historial-fecha">${fechaFormateada}</span>
                <span class="historial-tipo">${gasto.tipo}</span>
                <span class="historial-descripcion">${gasto.tipo === 'Fijo' ? `${gasto.tipo}: ${gasto.descripcion}` : gasto.descripcion}</span>
                <span class="historial-monto">${montoFormateado}</span>
            </div>
        `;
        
        historialDiv.appendChild(gastoElement);
    });
}

// Función para obtener el símbolo de la moneda
function obtenerSimboloMoneda(codigoMoneda) {
    const simbolosMoneda = {
        'USD': '$',
        'EUR': '€',
        'MXN': '$',
        'COP': '$',
        'ARS': '$',
        'CLP': '$',
        'PEN': 'S/',
        'BRL': 'R$',
        'UYU': '$U',
        'VES': 'Bs',
        'DOP': 'RD$'
    };
    return simbolosMoneda[codigoMoneda] || '$';
} 
// Variables globales
let graficoGastos = null;

// Elementos del DOM
const formSueldo = document.getElementById('form-sueldo');
const inputSueldo = document.getElementById('sueldo');
const inputDiaCobro = document.getElementById('dia-cobro');
const sueldoRestanteElement = document.getElementById('sueldo-restante').querySelector('h2');

const formGastoFijo = document.getElementById('form-gasto-fijo');
const inputTipoGastoFijo = document.getElementById('tipo-gasto-fijo');
const inputDescripcionFijo = document.getElementById('descripcion-fijo');
const inputMontoFijo = document.getElementById('monto-fijo');
const inputFechaFijo = document.getElementById('fecha-fijo');
const listaGastosFijos = document.getElementById('lista-gastos-fijos');

const formGastoDiario = document.getElementById('form-gasto-diario');
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

// Event Listeners
formSueldo.addEventListener('submit', (e) => {
    e.preventDefault();
    sueldo = parseFloat(inputSueldo.value);
    diaCobro = parseInt(inputDiaCobro.value);
    
    // Guardar en el usuario actual
    usuario.sueldo = sueldo;
    usuario.diaCobro = diaCobro;
    guardarUsuarioActual(usuario);
    
    actualizarSueldoRestante();
    actualizarGrafico();
});

formGastoFijo.addEventListener('submit', (e) => {
    e.preventDefault();
    const tipo = inputTipoGastoFijo.value;
    const descripcion = inputDescripcionFijo.value;
    const monto = parseFloat(inputMontoFijo.value);
    const fecha = inputFechaFijo.value;
    
    const nuevoGasto = {
        id: Date.now().toString(),
        tipo,
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
    const descripcion = inputDescripcionDiario.value;
    const monto = parseFloat(inputMontoDiario.value);
    const fecha = inputFechaDiario.value;
    
    const nuevoGasto = {
        id: Date.now().toString(),
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
    mostrarHistorialGastos(); // Actualizar el historial de gastos
    
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
    const gastosFijosTotal = gastosFijos.reduce((total, gasto) => total + gasto.monto, 0);
    const gastosDiariosTotal = gastosDiarios.reduce((total, gasto) => total + gasto.monto, 0);
    const sueldoRestante = sueldo - gastosFijosTotal - gastosDiariosTotal;
    
    // Usar la función de formateo de moneda si está disponible
    if (window.formatearMoneda) {
        sueldoRestanteElement.textContent = `Sueldo Restante: ${formatearMoneda(sueldoRestante)}`;
    } else {
        sueldoRestanteElement.textContent = `Sueldo Restante: $${sueldoRestante.toFixed(2)}`;
    }
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
                    <span class="gasto-tipo">${gasto.tipo}</span>
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
    const gastosFijosTotal = gastosFijos.reduce((total, gasto) => total + gasto.monto, 0);
    const gastosDiariosTotal = gastosDiarios.reduce((total, gasto) => total + gasto.monto, 0);
    const totalGastos = gastosFijosTotal + gastosDiariosTotal;
    const sueldoRestante = sueldo - totalGastos;
    
    // Calcular gastos por tipo
    const gastosPorTipo = {};
    gastosFijos.forEach(gasto => {
        if (!gastosPorTipo[gasto.tipo]) {
            gastosPorTipo[gasto.tipo] = 0;
        }
        gastosPorTipo[gasto.tipo] += gasto.monto;
    });
    
    // Usar la función de formateo de moneda si está disponible
    const formatearMonto = window.formatearMoneda ? formatearMoneda : (valor) => `$${valor.toFixed(2)}`;
    
    // Crear HTML para estadísticas
    let html = `
        <div class="estadisticas-container">
            <div class="estadistica-general">
                <h3>Resumen General</h3>
                <p>Sueldo: ${formatearMonto(sueldo)}</p>
                <p>Gastos Fijos: ${formatearMonto(gastosFijosTotal)}</p>
                <p>Gastos Diarios: ${formatearMonto(gastosDiariosTotal)}</p>
                <p>Total Gastos: ${formatearMonto(totalGastos)}</p>
                <p>Sueldo Restante: ${formatearMonto(sueldoRestante)}</p>
            </div>
            <div class="estadistica-tipos">
                <h3>Gastos por Tipo</h3>
    `;
    
    // Agregar gastos por tipo
    for (const tipo in gastosPorTipo) {
        html += `<p>${tipo}: ${formatearMonto(gastosPorTipo[tipo])}</p>`;
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

// Agregar event listeners para los filtros
document.addEventListener('DOMContentLoaded', () => {
    const filtroTipo = document.getElementById('filtro-tipo');
    const ordenarPor = document.getElementById('ordenar-por');
    const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');

    if (filtroTipo) {
        filtroTipo.addEventListener('change', mostrarHistorialGastos);
    }
    if (ordenarPor) {
        ordenarPor.addEventListener('change', mostrarHistorialGastos);
    }
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', mostrarHistorialGastos);
    }

    // Mostrar historial inicial
    mostrarHistorialGastos();
});

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
        mostrarError('Por favor, selecciona un rango de fechas');
        return;
    }
    
    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);
    
    // Obtener el usuario actual
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
        mostrarError('No hay usuario activo');
        return;
    }
    
    // Filtrar gastos fijos
    const gastosFijosFiltrados = usuarioActual.gastosFijos.filter(gasto => {
        const fechaGasto = new Date(gasto.fecha);
        return fechaGasto >= fechaInicioObj && fechaGasto <= fechaFinObj;
    });
    
    // Filtrar gastos diarios
    const gastosDiariosFiltrados = usuarioActual.gastosDiarios.filter(gasto => {
        const fechaGasto = new Date(gasto.fecha);
        return fechaGasto >= fechaInicioObj && fechaGasto <= fechaFinObj;
    });
    
    // Mostrar gastos filtrados
    mostrarGastosFiltrados(gastosFijosFiltrados, gastosDiariosFiltrados);
}

// Función para mostrar todos los gastos
function mostrarTodosLosGastos() {
    // Limpiar los filtros de fecha
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    
    // Mostrar todos los gastos
    mostrarGastosFijos();
    mostrarGastosDiarios();
    mostrarHistorialGastos();
}

// Función para mostrar gastos filtrados
function mostrarGastosFiltrados(gastosFijosFiltrados, gastosDiariosFiltrados) {
    // Mostrar gastos fijos filtrados
    listaGastosFijos.innerHTML = '';
    gastosFijosFiltrados.forEach(gasto => {
        const li = document.createElement('li');
        
        // Usar la función de formateo de fecha si está disponible
        const fechaFormateada = window.formatearFecha ? window.formatearFecha(gasto.fecha) : formatearFechaLocal(gasto.fecha);
        
        // Usar la función de formateo de moneda si está disponible
        const montoFormateado = window.formatearMoneda ? window.formatearMoneda(gasto.monto) : `$${gasto.monto.toFixed(2)}`;
        
        li.innerHTML = `
            <div class="gasto-info">
                <span class="gasto-tipo">${gasto.tipo}</span>
                <span class="gasto-descripcion">${gasto.descripcion}</span>
                <span class="gasto-fecha">${fechaFormateada}</span>
                <span class="gasto-monto">${montoFormateado}</span>
            </div>
            <button class="btn-eliminar" onclick="eliminarGastoFijo('${gasto.id}')">×</button>
        `;
        listaGastosFijos.appendChild(li);
    });
    
    // Mostrar gastos diarios filtrados
    listaGastosDiarios.innerHTML = '';
    gastosDiariosFiltrados.forEach(gasto => {
        const li = document.createElement('li');
        
        // Usar la función de formateo de fecha si está disponible
        const fechaFormateada = window.formatearFecha ? window.formatearFecha(gasto.fecha) : formatearFechaLocal(gasto.fecha);
        
        // Usar la función de formateo de moneda si está disponible
        const montoFormateado = window.formatearMoneda ? window.formatearMoneda(gasto.monto) : `$${gasto.monto.toFixed(2)}`;
        
        li.innerHTML = `
            <div class="gasto-info">
                <span class="gasto-descripcion">${gasto.descripcion}</span>
                <span class="gasto-fecha">${fechaFormateada}</span>
                <span class="gasto-monto">${montoFormateado}</span>
            </div>
            <button class="btn-eliminar" onclick="eliminarGastoDiario('${gasto.id}')">×</button>
        `;
        listaGastosDiarios.appendChild(li);
    });
    
    // Actualizar el historial
    mostrarHistorialGastos();
} 
// Variables globales
let sueldo = 0;
let diaCobro = 0;
let gastosFijos = [];
let gastosDiarios = [];
let graficoGastos = null;

// Elementos del DOM
const formSueldo = document.getElementById('form-sueldo');
const inputSueldo = document.getElementById('sueldo');
const inputDiaCobro = document.getElementById('dia-cobro');
const sueldoRestante = document.getElementById('sueldo-restante');
const formGastosFijos = document.getElementById('form-gasto-fijo');
const formGastosDiarios = document.getElementById('form-gasto-diario');
const listaGastosFijos = document.getElementById('lista-gastos-fijos');
const listaGastosDiarios = document.getElementById('lista-gastos-diarios');
const btnVerGastos = document.getElementById('btn-ver-gastos');
const estadisticas = document.getElementById('estadisticas');
const canvasGrafico = document.getElementById('grafico-gastos');

// Cargar datos del localStorage al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    actualizarSueldoRestante();
    mostrarGastos();
    crearGraficoGastos();
    verificarReinicioMensual();
    // Verificar cada día a medianoche
    setInterval(verificarReinicioMensual, 24 * 60 * 60 * 1000);
});

// Manejar el formulario de sueldo
formSueldo.addEventListener('submit', (e) => {
    e.preventDefault();
    sueldo = parseFloat(inputSueldo.value);
    diaCobro = parseInt(inputDiaCobro.value);
    
    if (sueldo > 0 && diaCobro >= 1 && diaCobro <= 31) {
        guardarDatos();
        actualizarSueldoRestante();
        actualizarGraficoGastos();
        inputSueldo.value = '';
        inputDiaCobro.value = '';
    } else {
        alert('Por favor ingrese un sueldo válido y un día de cobro entre 1 y 31');
    }
});

// Manejar el formulario de gastos fijos
formGastosFijos.addEventListener('submit', (e) => {
    e.preventDefault();
    const tipo = document.getElementById('tipo-gasto-fijo').value;
    const descripcion = document.getElementById('descripcion-fijo').value;
    const monto = parseFloat(document.getElementById('monto-fijo').value);
    const fecha = document.getElementById('fecha-fijo').value;

    if (descripcion && monto > 0 && fecha) {
        gastosFijos.push({ 
            tipo, 
            descripcion, 
            monto,
            fecha: new Date(fecha).toLocaleDateString() 
        });
        guardarDatos();
        mostrarGastos();
        actualizarGraficoGastos();
        formGastosFijos.reset();
    } else {
        alert('Por favor complete todos los campos correctamente');
    }
});

// Manejar el formulario de gastos diarios
formGastosDiarios.addEventListener('submit', (e) => {
    e.preventDefault();
    const descripcion = document.getElementById('descripcion-diario').value;
    const monto = parseFloat(document.getElementById('monto-diario').value);
    const fecha = document.getElementById('fecha-diario').value;

    if (descripcion && monto > 0 && fecha) {
        gastosDiarios.push({ 
            descripcion, 
            monto, 
            fecha: new Date(fecha).toLocaleDateString() 
        });
        guardarDatos();
        mostrarGastos();
        actualizarGraficoGastos();
        formGastosDiarios.reset();
    } else {
        alert('Por favor complete todos los campos correctamente');
    }
});

// Mostrar/ocultar estadísticas
btnVerGastos.addEventListener('click', () => {
    const estaVisible = estadisticas.style.display === 'block';
    estadisticas.style.display = estaVisible ? 'none' : 'block';
    if (!estaVisible) {
        mostrarEstadisticas();
    }
});

// Funciones para el filtrado por fecha
document.getElementById('btn-filtrar').addEventListener('click', filtrarGastosPorFecha);
document.getElementById('btn-mostrar-todos').addEventListener('click', mostrarTodosLosGastos);

function filtrarGastosPorFecha() {
    const fechaInicio = new Date(document.getElementById('fecha-inicio').value);
    const fechaFin = new Date(document.getElementById('fecha-fin').value);
    
    if (!fechaInicio || !fechaFin) {
        alert('Por favor seleccione un rango de fechas');
        return;
    }

    const gastosFiltradosFijos = gastosFijos.filter(gasto => {
        const fechaGasto = new Date(gasto.fecha);
        return fechaGasto >= fechaInicio && fechaGasto <= fechaFin;
    });

    const gastosFiltradosDiarios = gastosDiarios.filter(gasto => {
        const fechaGasto = new Date(gasto.fecha);
        return fechaGasto >= fechaInicio && fechaGasto <= fechaFin;
    });

    mostrarGastosFiltrados(gastosFiltradosFijos, gastosFiltradosDiarios);
}

function mostrarGastosFiltrados(gastosFijosFiltrados, gastosDiariosFiltrados) {
    const contenedor = document.getElementById('gastos-filtrados');
    const totalFijos = gastosFijosFiltrados.reduce((total, gasto) => total + gasto.monto, 0);
    const totalDiarios = gastosDiariosFiltrados.reduce((total, gasto) => total + gasto.monto, 0);

    contenedor.innerHTML = `
        <h3>Gastos Fijos en el Período</h3>
        <ul>
            ${gastosFijosFiltrados.map((gasto, index) => `
                <li>
                    <span>${gasto.fecha} - ${gasto.tipo}: ${gasto.descripcion} - $${gasto.monto.toFixed(2)}</span>
                </li>
            `).join('')}
        </ul>
        <p>Total Gastos Fijos: $${totalFijos.toFixed(2)}</p>

        <h3>Gastos Diarios en el Período</h3>
        <ul>
            ${gastosDiariosFiltrados.map((gasto, index) => `
                <li>
                    <span>${gasto.fecha} - ${gasto.descripcion} - $${gasto.monto.toFixed(2)}</span>
                </li>
            `).join('')}
        </ul>
        <p>Total Gastos Diarios: $${totalDiarios.toFixed(2)}</p>
        <p>Total General: $${(totalFijos + totalDiarios).toFixed(2)}</p>
    `;
}

function mostrarTodosLosGastos() {
    document.getElementById('fecha-inicio').value = '';
    document.getElementById('fecha-fin').value = '';
    document.getElementById('gastos-filtrados').innerHTML = '';
}

// Funciones auxiliares
function actualizarSueldoRestante() {
    const totalGastosFijos = gastosFijos.reduce((total, gasto) => total + gasto.monto, 0);
    const totalGastosDiarios = gastosDiarios.reduce((total, gasto) => total + gasto.monto, 0);
    const restante = sueldo - totalGastosFijos - totalGastosDiarios;
    
    sueldoRestante.innerHTML = `
        <h3>Sueldo Restante</h3>
        <p>$${restante.toFixed(2)}</p>
    `;
}

function mostrarGastos() {
    // Mostrar gastos fijos
    listaGastosFijos.innerHTML = gastosFijos.map((gasto, index) => `
        <li>
            <span>${gasto.fecha} - ${gasto.tipo}: ${gasto.descripcion} - $${gasto.monto.toFixed(2)}</span>
            <button onclick="eliminarGastoFijo(${index})">Eliminar</button>
        </li>
    `).join('');

    // Mostrar gastos diarios
    listaGastosDiarios.innerHTML = gastosDiarios.map((gasto, index) => `
        <li>
            <span>${gasto.fecha} - ${gasto.descripcion} - $${gasto.monto.toFixed(2)}</span>
            <button onclick="eliminarGastoDiario(${index})">Eliminar</button>
        </li>
    `).join('');

    actualizarSueldoRestante();
}

function mostrarEstadisticas() {
    const totalGastosFijos = gastosFijos.reduce((total, gasto) => total + gasto.monto, 0);
    const totalGastosDiarios = gastosDiarios.reduce((total, gasto) => total + gasto.monto, 0);
    const gastosPorTipo = {};
    
    gastosFijos.forEach(gasto => {
        gastosPorTipo[gasto.tipo] = (gastosPorTipo[gasto.tipo] || 0) + gasto.monto;
    });

    estadisticas.innerHTML = `
        <h3>Estadísticas de Gastos</h3>
        <h4>Resumen General</h4>
        <ul>
            <li>Sueldo Total: $${sueldo.toFixed(2)}</li>
            <li>Gastos Fijos Totales: $${totalGastosFijos.toFixed(2)}</li>
            <li>Gastos Diarios Totales: $${totalGastosDiarios.toFixed(2)}</li>
            <li>Saldo Restante: $${(sueldo - totalGastosFijos - totalGastosDiarios).toFixed(2)}</li>
        </ul>
        <h4>Gastos por Categoría</h4>
        <ul>
            ${Object.entries(gastosPorTipo).map(([tipo, monto]) => 
                `<li>${tipo}: $${monto.toFixed(2)}</li>`
            ).join('')}
        </ul>
    `;
}

function eliminarGastoFijo(index) {
    if (confirm('¿Está seguro de eliminar este gasto fijo?')) {
        gastosFijos.splice(index, 1);
        guardarDatos();
        mostrarGastos();
        actualizarGraficoGastos();
    }
}

function eliminarGastoDiario(index) {
    if (confirm('¿Está seguro de eliminar este gasto diario?')) {
        gastosDiarios.splice(index, 1);
        guardarDatos();
        mostrarGastos();
        actualizarGraficoGastos();
    }
}

function guardarDatos() {
    localStorage.setItem('sueldo', sueldo);
    localStorage.setItem('sueldoBase', sueldo); // Guardar el sueldo base para reinicio
    localStorage.setItem('diaCobro', diaCobro);
    localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
    localStorage.setItem('gastosDiarios', JSON.stringify(gastosDiarios));
}

function cargarDatos() {
    sueldo = parseFloat(localStorage.getItem('sueldo')) || 0;
    diaCobro = parseInt(localStorage.getItem('diaCobro')) || 0;
    gastosFijos = JSON.parse(localStorage.getItem('gastosFijos')) || [];
    gastosDiarios = JSON.parse(localStorage.getItem('gastosDiarios')) || [];
}

// Función para verificar si es día de reinicio
function verificarReinicioMensual() {
    const hoy = new Date();
    const diaActual = hoy.getDate();
    
    if (diaActual === diaCobro) {
        // Es día de cobro, reiniciar sueldo
        sueldo = parseFloat(localStorage.getItem('sueldoBase')) || 0;
        guardarDatos();
        actualizarSueldoRestante();
        mostrarGastos();
        actualizarGraficoGastos();
    }
}

// Funciones para el gráfico de distribución de gastos
function crearGraficoGastos() {
    const ctx = canvasGrafico.getContext('2d');
    
    // Colores para las diferentes categorías
    const colores = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
        '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
    ];
    
    // Preparar datos para el gráfico
    const datos = prepararDatosGrafico();
    
    // Crear el gráfico
    graficoGastos = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: datos.labels,
            datasets: [{
                data: datos.valores,
                backgroundColor: colores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function actualizarGraficoGastos() {
    if (!graficoGastos) {
        crearGraficoGastos();
        return;
    }
    
    const datos = prepararDatosGrafico();
    
    graficoGastos.data.labels = datos.labels;
    graficoGastos.data.datasets[0].data = datos.valores;
    graficoGastos.update();
}

function prepararDatosGrafico() {
    // Agrupar gastos fijos por tipo
    const gastosPorTipo = {};
    gastosFijos.forEach(gasto => {
        gastosPorTipo[gasto.tipo] = (gastosPorTipo[gasto.tipo] || 0) + gasto.monto;
    });
    
    // Agrupar gastos diarios
    const totalGastosDiarios = gastosDiarios.reduce((total, gasto) => total + gasto.monto, 0);
    
    // Preparar datos para el gráfico
    const labels = [];
    const valores = [];
    
    // Agregar gastos fijos por tipo
    Object.entries(gastosPorTipo).forEach(([tipo, monto]) => {
        labels.push(tipo);
        valores.push(monto);
    });
    
    // Agregar gastos diarios como una categoría
    if (totalGastosDiarios > 0) {
        labels.push('Gastos Diarios');
        valores.push(totalGastosDiarios);
    }
    
    // Agregar sueldo restante
    const totalGastos = valores.reduce((total, valor) => total + valor, 0);
    const sueldoRestante = sueldo - totalGastos;
    
    if (sueldoRestante > 0) {
        labels.push('Sueldo Restante');
        valores.push(sueldoRestante);
    }
    
    return { labels, valores };
} 
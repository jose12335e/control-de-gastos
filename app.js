// Variables globales
let currentUser = null;
let sueldo = 0;
let gastosFijos = [];
let gastos = [];
let categorias = ['Comida', 'Transporte', 'Entretenimiento', 'Servicios', 'Salud', 'Educación', 'Otros'];

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay un usuario logueado
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = user;
    document.getElementById('user-name').textContent = `Bienvenido, ${currentUser.name}`;
    
    // Cargar datos del usuario
    sueldo = currentUser.sueldo || 0;
    gastosFijos = currentUser.gastosFijos || [];
    gastos = currentUser.gastos || [];

    // Actualizar UI
    document.getElementById('sueldo').value = sueldo;
    document.getElementById('restante').textContent = sueldo.toFixed(2);
    if (sueldo > 0) {
        document.getElementById('sueldo').disabled = true;
    }

    inicializarCategorias();
    verificarGastosFijos();
});

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Inicializar el selector de categorías
function inicializarCategorias() {
    const categoriaSelect = document.getElementById('categoria');
    categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        categoriaSelect.appendChild(option);
    });
}

// Bloquear sueldo hasta el siguiente mes
document.getElementById('sueldo').addEventListener('input', function(event) {
    const nuevoSueldo = parseFloat(event.target.value);
    if (nuevoSueldo <= 0) {
        alert('El sueldo debe ser mayor a 0');
        event.target.value = '';
        return;
    }
    if (sueldo === 0) {
        sueldo = nuevoSueldo;
        document.getElementById('restante').textContent = sueldo.toFixed(2);
        event.target.disabled = true;
        actualizarUsuario();
    }
});

// Registrar gastos fijos
document.getElementById('agregar-fijo').addEventListener('click', function() {
    const tipoGasto = document.getElementById('tipo-gasto-fijo').value;
    const descripcionFijo = document.getElementById('descripcion-fijo').value.trim();
    const montoFijo = parseFloat(document.getElementById('monto-fijo').value);
    const fechaPago = document.getElementById('fecha-pago').value;

    if (!tipoGasto || !descripcionFijo || !montoFijo || !fechaPago) {
        alert('Por favor completa todos los campos');
        return;
    }

    if (montoFijo <= 0) {
        alert('El monto debe ser mayor a 0');
        return;
    }

    gastosFijos.push({ 
        tipo: tipoGasto,
        descripcion: descripcionFijo, 
        monto: montoFijo, 
        fechaPago 
    });
    
    actualizarUsuario();
    verificarGastosFijos();

    // Limpiar los campos
    document.getElementById('tipo-gasto-fijo').value = '';
    document.getElementById('descripcion-fijo').value = '';
    document.getElementById('monto-fijo').value = '';
    document.getElementById('fecha-pago').value = '';
    
    alert("Gasto Fijo agregado correctamente.");
});

// Función para verificar si el día de pago ha llegado
function verificarGastosFijos() {
    const fechaHoy = new Date();
    const fechaActual = `${fechaHoy.getFullYear()}-${('0' + (fechaHoy.getMonth() + 1)).slice(-2)}-${('0' + fechaHoy.getDate()).slice(-2)}`;

    gastosFijos.forEach(gasto => {
        if (gasto.fechaPago === fechaActual) {
            const confirmacion = confirm(`¿Se pagó el gasto fijo de ${gasto.tipo} - ${gasto.descripcion} por ${gasto.monto} pesos?`);
            if (confirmacion) {
                if (sueldo < gasto.monto) {
                    alert('No hay suficiente saldo para este gasto fijo');
                    return;
                }
                sueldo -= gasto.monto;
                document.getElementById('restante').textContent = sueldo.toFixed(2);
                actualizarUsuario();
                alert(`Gasto de ${gasto.tipo} - ${gasto.descripcion} aplicado correctamente.`);
            }
        }
    });
}

// Función para agregar un gasto y restar del sueldo
document.getElementById('gasto-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const categoria = document.getElementById('categoria').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const descripcion = document.getElementById('descripcion').value.trim();

    if (!categoria || !monto || !descripcion) {
        alert('Por favor completa todos los campos');
        return;
    }

    if (monto <= 0) {
        alert('El monto debe ser mayor a 0');
        return;
    }

    if (monto > sueldo) {
        alert('No hay suficiente saldo para este gasto');
        return;
    }

    const gasto = { 
        categoria, 
        monto, 
        descripcion,
        fecha: new Date().toISOString()
    };

    sueldo -= monto;
    document.getElementById('restante').textContent = sueldo.toFixed(2);
    
    gastos.push(gasto);
    actualizarUsuario();
    cargarGastos();
    actualizarEstadisticas();

    // Limpiar los campos
    document.getElementById('categoria').value = '';
    document.getElementById('monto').value = '';
    document.getElementById('descripcion').value = '';
});

// Cargar los gastos registrados
function cargarGastos() {
    const gastosLista = document.getElementById('gastos-lista');
    gastosLista.innerHTML = '';

    gastos.forEach((gasto, index) => {
        const li = document.createElement('li');
        const fecha = new Date(gasto.fecha).toLocaleDateString();
        li.innerHTML = `
            <div>
                <strong>${gasto.categoria}</strong>: $${gasto.monto.toFixed(2)} - ${gasto.descripcion}
                <br>
                <small>Fecha: ${fecha}</small>
            </div>
            <button onclick="eliminarGasto(${index})">Eliminar</button>
        `;
        gastosLista.appendChild(li);
    });
}

// Eliminar un gasto
function eliminarGasto(index) {
    if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
        const gastoEliminado = gastos[index];
        sueldo += gastoEliminado.monto;
        document.getElementById('restante').textContent = sueldo.toFixed(2);
        
        gastos.splice(index, 1);
        actualizarUsuario();
        
        cargarGastos();
        actualizarEstadisticas();
    }
}

// Mostrar u ocultar los gastos guardados
document.getElementById('btn-ver-gastos').addEventListener('click', function() {
    const gastosGuardados = document.getElementById('gastos-guardados');
    const esVisible = gastosGuardados.style.display === 'block';

    if (esVisible) {
        gastosGuardados.style.display = 'none';
    } else {
        gastosGuardados.style.display = 'block';
        cargarGastos();
        actualizarEstadisticas();
    }
});

// Función para actualizar estadísticas
function actualizarEstadisticas() {
    const estadisticasDiv = document.getElementById('estadisticas');
    if (!estadisticasDiv) return;

    const gastosPorCategoria = {};
    let totalGastos = 0;

    gastos.forEach(gasto => {
        gastosPorCategoria[gasto.categoria] = (gastosPorCategoria[gasto.categoria] || 0) + gasto.monto;
        totalGastos += gasto.monto;
    });

    let estadisticasHTML = '<h3>Estadísticas de Gastos</h3>';
    estadisticasHTML += `<p>Total Gastado: $${totalGastos.toFixed(2)}</p>`;
    estadisticasHTML += '<h4>Gastos por Categoría:</h4><ul>';

    for (const categoria in gastosPorCategoria) {
        const porcentaje = ((gastosPorCategoria[categoria] / totalGastos) * 100).toFixed(1);
        estadisticasHTML += `
            <li>${categoria}: $${gastosPorCategoria[categoria].toFixed(2)} (${porcentaje}%)</li>
        `;
    }

    estadisticasHTML += '</ul>';
    estadisticasDiv.innerHTML = estadisticasHTML;
}

// Función para actualizar los datos del usuario
function actualizarUsuario() {
    currentUser.sueldo = sueldo;
    currentUser.gastosFijos = gastosFijos;
    currentUser.gastos = gastos;

    // Actualizar usuario en localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Actualizar usuario en la lista de usuarios
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Función para exportar datos
function exportarDatos() {
    const datos = {
        usuario: currentUser.name,
        email: currentUser.email,
        sueldo,
        gastosFijos,
        gastos,
        fechaExportacion: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_${currentUser.name}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Objeto con las traducciones
const translations = {
    es: {
        // Títulos y encabezados
        appTitle: "Control de Gastos",
        homeLink: "Inicio",
        configLink: "Configuración",
        salaryTitle: "Sueldo",
        fixedExpensesTitle: "Gastos Fijos",
        dailyExpensesTitle: "Gastos Diarios",
        distributionTitle: "Distribución de Gastos",
        historyTitle: "Historial de Gastos",
        statisticsTitle: "Estadísticas",

        // Formularios
        salaryLabel: "Ingrese su sueldo:",
        paymentDayLabel: "Día de cobro mensual:",
        expenseCategoryLabel: "Categoría:",
        expenseSubcategoryLabel: "Subcategoría:",
        descriptionLabel: "Descripción (opcional):",
        amountLabel: "Monto:",
        dateLabel: "Fecha:",
        startDateLabel: "Fecha inicio:",
        endDateLabel: "Fecha fin:",
        selectCategory: "Seleccione una categoría",
        selectSubcategory: "Seleccione una subcategoría",

        // Botones
        saveBtn: "Actualizar Sueldo",
        addBtn: "Agregar Gasto",
        deleteBtn: "Eliminar",
        filterBtn: "Filtrar",
        showAllBtn: "Mostrar Todos",
        viewStatisticsBtn: "Ver Estadísticas",
        logoutBtn: "Cerrar Sesión",

        // Mensajes
        remainingSalary: "Sueldo Restante:",
        noFixedExpenses: "No hay gastos fijos registrados",
        noDailyExpenses: "No hay gastos diarios registrados",
        noExpenses: "No hay gastos registrados",
        confirmDelete: "¿Está seguro de que desea eliminar este gasto?",
        expenseAdded: "Gasto agregado correctamente",
        expenseDeleted: "Gasto eliminado correctamente",
        salaryUpdated: "Sueldo actualizado correctamente",

        // Filtros
        filterAll: "Todos",
        filterFixed: "Fijos",
        filterDaily: "Diarios",
        sortDateDesc: "Fecha (más reciente)",
        sortDateAsc: "Fecha (más antigua)",
        sortAmountDesc: "Monto (mayor)",
        sortAmountAsc: "Monto (menor)",

        // Estadísticas
        totalExpenses: "Total de Gastos:",
        fixedExpenses: "Gastos Fijos:",
        dailyExpenses: "Gastos Diarios:",
        averageDaily: "Promedio Diario:",
        averageFixed: "Promedio Mensual:",
        highestExpense: "Gasto más Alto:",
        lowestExpense: "Gasto más Bajo:"
    },
    en: {
        // Títulos y encabezados
        appTitle: "Expense Control",
        homeLink: "Home",
        configLink: "Settings",
        salaryTitle: "Salary",
        fixedExpensesTitle: "Fixed Expenses",
        dailyExpensesTitle: "Daily Expenses",
        distributionTitle: "Expense Distribution",
        historyTitle: "Expense History",
        statisticsTitle: "Statistics",

        // Formularios
        salaryLabel: "Enter your salary:",
        paymentDayLabel: "Monthly payment day:",
        expenseCategoryLabel: "Category:",
        expenseSubcategoryLabel: "Subcategory:",
        descriptionLabel: "Description (optional):",
        amountLabel: "Amount:",
        dateLabel: "Date:",
        startDateLabel: "Start date:",
        endDateLabel: "End date:",
        selectCategory: "Select a category",
        selectSubcategory: "Select a subcategory",

        // Botones
        saveBtn: "Update Salary",
        addBtn: "Add Expense",
        deleteBtn: "Delete",
        filterBtn: "Filter",
        showAllBtn: "Show All",
        viewStatisticsBtn: "View Statistics",
        logoutBtn: "Logout",

        // Mensajes
        remainingSalary: "Remaining Salary:",
        noFixedExpenses: "No fixed expenses registered",
        noDailyExpenses: "No daily expenses registered",
        noExpenses: "No expenses registered",
        confirmDelete: "Are you sure you want to delete this expense?",
        expenseAdded: "Expense added successfully",
        expenseDeleted: "Expense deleted successfully",
        salaryUpdated: "Salary updated successfully",

        // Filtros
        filterAll: "All",
        filterFixed: "Fixed",
        filterDaily: "Daily",
        sortDateDesc: "Date (most recent)",
        sortDateAsc: "Date (oldest)",
        sortAmountDesc: "Amount (highest)",
        sortAmountAsc: "Amount (lowest)",

        // Estadísticas
        totalExpenses: "Total Expenses:",
        fixedExpenses: "Fixed Expenses:",
        dailyExpenses: "Daily Expenses:",
        averageDaily: "Daily Average:",
        averageFixed: "Monthly Average:",
        highestExpense: "Highest Expense:",
        lowestExpense: "Lowest Expense:"
    }
};

// Función para cambiar el idioma
function changeLanguage(lang) {
    // Guardar la preferencia de idioma
    localStorage.setItem('language', lang);
    
    // Actualizar todos los elementos con atributo data-translate
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
}

// Establecer español como idioma predeterminado
document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('language') || 'es';
    changeLanguage(savedLanguage);
}); 
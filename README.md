# Control de Gastos

Una aplicación web para gestionar tus gastos personales, con visualización de datos y sistema de usuarios.

## Descripción

Control de Gastos es una aplicación web que te permite gestionar tus gastos personales de forma sencilla e intuitiva. Puedes registrar tu sueldo, añadir gastos fijos y diarios, y visualizar estadísticas sobre tus gastos. La aplicación incluye un sistema de usuarios para que cada persona pueda gestionar sus propios gastos de forma privada.

## Características

- **Sistema de usuarios**: Registro, inicio de sesión y gestión de datos personales
- **Gestión de sueldo**: Configura tu sueldo mensual y el día de cobro
- **Gastos fijos**: Registra gastos recurrentes como alquiler, servicios, etc.
- **Gastos diarios**: Añade gastos ocasionales con descripción y fecha
- **Estadísticas detalladas**: Visualiza un resumen de tus gastos y el dinero restante
- **Gráfico de distribución**: Visualiza cómo se distribuyen tus gastos en un gráfico interactivo
- **Filtrado por fecha**: Filtra tus gastos por rango de fechas
- **Configuración personalizada**: Personaliza la moneda, idioma, formato de fecha y tema de la aplicación
- **Almacenamiento local**: Tus datos se guardan en el navegador para que puedas acceder a ellos más tarde
- **Reset automático**: El sueldo se resetea automáticamente en el día de cobro configurado

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js para visualización de datos
- localStorage para persistencia de datos

## Instalación local

1. Clona este repositorio o descarga los archivos
2. Abre el archivo `index.html` en tu navegador
3. Alternativamente, puedes usar un servidor local como live-server:
   ```
   npx live-server
   ```

## Uso

1. **Registro e inicio de sesión**:
   - Regístrate con tu nombre, correo electrónico y contraseña
   - Inicia sesión con tu correo y contraseña

2. **Configuración inicial**:
   - Ve a la sección "Configuración" para personalizar la moneda, idioma, formato de fecha y tema
   - Configura tu sueldo mensual y el día de cobro

3. **Gestión de gastos**:
   - Añade gastos fijos seleccionando el tipo, descripción, monto y fecha
   - Añade gastos diarios con descripción, monto y fecha
   - Visualiza tus gastos en las listas correspondientes
   - Elimina gastos individuales haciendo clic en el botón "×"

4. **Visualización de datos**:
   - Haz clic en "Ver Estadísticas" para ver un resumen de tus gastos
   - Observa el gráfico de distribución para visualizar cómo se distribuyen tus gastos
   - Filtra tus gastos por rango de fechas

## Despliegue

Esta aplicación puede ser desplegada en cualquier servicio de hosting estático como:

- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

## Licencia

Este proyecto está bajo la Licencia MIT.  

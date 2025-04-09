// Configuración de Firebase
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto de Firebase
// Puedes obtenerlos desde la consola de Firebase: https://console.firebase.google.com/
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

// Variables para los servicios de Firebase
let auth = null;
let db = null;
let isInitialized = false;

// Función para inicializar Firebase
function inicializarFirebase(config) {
    try {
        // Verificar si las credenciales son válidas
        if (config.apiKey === "TU_API_KEY" || !config.apiKey) {
            console.warn('Firebase no está configurado. Por favor, actualiza las credenciales en firebase-config.js');
            return false;
        }

        // Inicializar Firebase si aún no está inicializado
        if (!isInitialized) {
            firebase.initializeApp(config);
            auth = firebase.auth();
            db = firebase.firestore();
            isInitialized = true;

            // Configurar persistencia offline para Firestore
            db.enablePersistence()
                .catch((err) => {
                    if (err.code === 'failed-precondition') {
                        console.warn('La persistencia offline falló: múltiples pestañas abiertas');
                    } else if (err.code === 'unimplemented') {
                        console.warn('El navegador no soporta persistencia offline');
                    }
                });

            // Configurar el idioma de Firebase Auth
            auth.languageCode = 'es';

            console.log('Firebase inicializado correctamente');
            return true;
        }
    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
        return false;
    }
}

// Exportar servicios y funciones de Firebase
window.db = db;
window.auth = auth;
window.inicializarFirebase = inicializarFirebase;
window.isFirebaseAvailable = () => isInitialized && auth !== null && db !== null;

// Intentar inicializar Firebase con la configuración actual
document.addEventListener('DOMContentLoaded', () => {
    inicializarFirebase(firebaseConfig);
}); 
// ========== CARGADOR DE VARIABLES DE ENTORNO ==========
// Este archivo carga las variables de entorno del archivo .env

(function() {
    'use strict';

    // Objeto global para almacenar las variables de entorno
    window.ENV = window.ENV || {};

    /**
     * Carga las variables de entorno desde un archivo .env
     * Para uso en desarrollo, las variables se pueden definir directamente aquí
     */
    function loadEnvironmentVariables() {
        // OPCIÓN 1: Variables definidas manualmente (recomendado para frontend)
        // Actualiza estos valores según tu entorno
        const envVars = {
            // API Configuration
            API_BASE_URL: 'http://98.90.108.255:7000',

            // Session Configuration
            SESSION_DURATION: '86400000' // 24 horas en milisegundos
        };

        // Asignar al objeto global
        Object.assign(window.ENV, envVars);

        console.log('Variables de entorno cargadas:', Object.keys(window.ENV));
    }

    /**
     * OPCIÓN 2: Cargar desde archivo .env (requiere un servidor backend o build process)
     * Esta función hace fetch al archivo .env y parsea las variables
     *
     * NOTA: No funciona directamente en el navegador por políticas CORS
     * Necesitas un servidor web o un proceso de build como Webpack/Vite
     */
    async function loadFromEnvFile() {
        try {
            const response = await fetch('/.env');
            const text = await response.text();

            // Parsear el archivo .env
            const lines = text.split('\n');
            lines.forEach(line => {
                // Ignorar comentarios y líneas vacías
                if (line.trim() && !line.trim().startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    const value = valueParts.join('=').trim();

                    if (key && value) {
                        window.ENV[key.trim()] = value;
                    }
                }
            });

            console.log('Variables de entorno cargadas desde .env');
        } catch (error) {
            console.warn('No se pudo cargar el archivo .env, usando valores por defecto');
            loadEnvironmentVariables();
        }
    }

    /**
     * OPCIÓN 3: Inyectar variables en tiempo de build
     * Si usas un bundler como Webpack, Vite, o Parcel, puedes usar:
     *
     * Webpack:
     * new webpack.DefinePlugin({
     *   'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL)
     * })
     *
     * Vite:
     * define: {
     *   'import.meta.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL)
     * }
     */

    // Inicializar las variables de entorno
    loadEnvironmentVariables();

    // Método helper para obtener una variable de entorno
    window.getEnv = function(key, defaultValue = null) {
        return window.ENV[key] || defaultValue;
    };

    // Método helper para verificar si una variable existe
    window.hasEnv = function(key) {
        return key in window.ENV;
    };

    // Método para actualizar una variable en tiempo de ejecución (solo para desarrollo)
    window.setEnv = function(key, value) {
        if (typeof value === 'undefined') {
            console.warn(`Intento de establecer ${key} con valor undefined`);
            return;
        }
        window.ENV[key] = value;
        console.log(`Variable de entorno actualizada: ${key} = ${value}`);

        // Si APIConfig está disponible, actualizar su configuración
        if (window.APIConfig && key === 'API_BASE_URL') {
            window.APIConfig.updateConfig({ baseURL: value });
        }
        if (window.APIConfig && key === 'SESSION_DURATION') {
            window.APIConfig.updateConfig({ sessionDuration: parseInt(value) });
        }
    };

    // Congelar el objeto ENV para evitar modificaciones accidentales
    // (comentado para permitir cambios en desarrollo)
    // Object.freeze(window.ENV);

})();

// ========== CONFIGURACIÓN POR ENTORNO ==========

/**
 * Para diferentes entornos, puedes crear archivos separados:
 *
 * - env-loader.dev.js     (desarrollo local)
 * - env-loader.staging.js (staging/pruebas)
 * - env-loader.prod.js    (producción)
 *
 * Y cargar el apropiado según el entorno:
 *
 * <script src="config/env-loader.dev.js"></script>
 */

// Detectar entorno automáticamente
(function detectEnvironment() {
    const hostname = window.location.hostname;

    let environment = 'production';

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        environment = 'development';
    } else if (hostname.includes('staging') || hostname.includes('test')) {
        environment = 'staging';
    }

    window.ENV.ENVIRONMENT = environment;

    // Aplicar configuraciones específicas del entorno
    if (environment === 'development') {
        // Habilitar logs de debug en desarrollo
        window.ENV.DEBUG = 'true';
        console.log('🔧 Modo desarrollo activado');
    } else if (environment === 'staging') {
        console.log('🧪 Modo staging activado');
    } else {
        console.log('🚀 Modo producción activado');
    }

    console.log(`Entorno detectado: ${environment}`);
})();

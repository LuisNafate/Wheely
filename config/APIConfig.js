// ========== CONFIGURACIÓN DE LA API ==========
// Este archivo centraliza todas las configuraciones de la API

class APIConfig {
    constructor() {
        // Configuración base - PRODUCCIÓN
        this.baseURL = 'http://98.90.108.255:7000';

        // Otras configuraciones
        this.sessionDuration = parseInt(this.getEnvVar('SESSION_DURATION', '86400000')); // 24 horas
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        this.autoRefreshInterval = 60000; // 1 minuto
        this.requestTimeout = 30000; // 30 segundos

        // Inicializar módulos de endpoints
        this._initializeEndpoints();
    }

    // Inicializar todos los módulos de endpoints
    _initializeEndpoints() {
        // Cargar endpoints organizados por módulos
        this.rutas = new (window.RutasEndpoints || class {})(this.baseURL);
        this.usuarios = new (window.UsuariosEndpoints || class {})(this.baseURL);
        this.reportes = new (window.ReportesEndpoints || class {})(this.baseURL);
        this.sistema = new (window.SistemaEndpoints || class {})(this.baseURL);
    }

    // Método para obtener variables de entorno (simulado para frontend)
    getEnvVar(key, defaultValue) {
        // Verificar variables de entorno del navegador
        if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
            return window.ENV[key];
        }
        return defaultValue;
    }

    // ===== GETTERS PRINCIPALES =====

    getBaseURL() {
        return this.baseURL;
    }

    getSessionDuration() {
        return this.sessionDuration;
    }

    getCacheTimeout() {
        return this.cacheTimeout;
    }

    getAutoRefreshInterval() {
        return this.autoRefreshInterval;
    }

    getRequestTimeout() {
        return this.requestTimeout;
    }

    // ===== MÉTODOS HELPER PARA URLs =====

    // Método para construir URLs de endpoints personalizados
    buildURL(endpoint) {
        const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${base}${path}`;
    }

    // ===== CONFIGURACIÓN DE HEADERS =====

    // Configuración de headers por defecto
    getDefaultHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Método para agregar token de autenticación a los headers
    getAuthHeaders(token = null) {
        const headers = this.getDefaultHeaders();

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            // Intentar obtener token del localStorage
            const userData = localStorage.getItem('wheelyUser');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user.token) {
                        headers['Authorization'] = `Bearer ${user.token}`;
                    }
                } catch (error) {
                    console.warn('Error al obtener token del usuario:', error);
                }
            }
        }

        return headers;
    }

    // ===== CONFIGURACIÓN DE FETCH =====

    // Configuración de fetch por defecto
    getFetchConfig(method = 'GET', body = null, token = null) {
        const config = {
            method: method,
            headers: token ? this.getAuthHeaders(token) : this.getDefaultHeaders(),
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'omit'
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(body);
        }

        return config;
    }

    // ===== MÉTODOS DE PETICIÓN HTTP =====

    // Método helper para hacer peticiones a la API con manejo de errores
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            token = null,
            customHeaders = {},
            timeout = this.requestTimeout
        } = options;

        try {
            const config = this.getFetchConfig(method, body, token);

            // Merge custom headers
            config.headers = { ...config.headers, ...customHeaders };

            // Implementar timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            config.signal = controller.signal;

            const response = await fetch(endpoint, config);
            clearTimeout(timeoutId);

            // Intentar parsear JSON
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new Error(data.message || data || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('La petición excedió el tiempo límite');
            }
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Métodos de conveniencia para diferentes tipos de peticiones
    async get(endpoint, token = null) {
        return this.request(endpoint, { method: 'GET', token });
    }

    async post(endpoint, body, token = null) {
        return this.request(endpoint, { method: 'POST', body, token });
    }

    async put(endpoint, body, token = null) {
        return this.request(endpoint, { method: 'PUT', body, token });
    }

    async patch(endpoint, body, token = null) {
        return this.request(endpoint, { method: 'PATCH', body, token });
    }

    async delete(endpoint, token = null) {
        return this.request(endpoint, { method: 'DELETE', token });
    }

    // ===== MÉTODOS DE UTILIDAD =====

    // Método para validar la conectividad con la API
    async checkConnection() {
        try {
            const response = await fetch(this.sistema.health(), {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.error('API connection check failed:', error);
            return false;
        }
    }

    // Método para actualizar la configuración en tiempo de ejecución
    updateConfig(newConfig) {
        let needsReinitialization = false;

        if (newConfig.baseURL && newConfig.baseURL !== this.baseURL) {
            this.baseURL = newConfig.baseURL;
            needsReinitialization = true;
        }
        if (newConfig.sessionDuration) {
            this.sessionDuration = newConfig.sessionDuration;
        }
        if (newConfig.cacheTimeout) {
            this.cacheTimeout = newConfig.cacheTimeout;
        }
        if (newConfig.autoRefreshInterval) {
            this.autoRefreshInterval = newConfig.autoRefreshInterval;
        }
        if (newConfig.requestTimeout) {
            this.requestTimeout = newConfig.requestTimeout;
        }

        // Re-inicializar endpoints si cambió la baseURL
        if (needsReinitialization) {
            this._initializeEndpoints();
        }
    }

    // Método para cambiar entre producción y desarrollo
    setEnvironment(env) {
        if (env === 'production') {
            this.baseURL = 'http://98.90.108.255:7000';
        } else if (env === 'development') {
            this.baseURL = 'http://localhost:7000';
        }
        this._initializeEndpoints();
        console.log(`Entorno cambiado a: ${env} (${this.baseURL})`);
    }

    // Obtener información del entorno actual
    getEnvironmentInfo() {
        return {
            baseURL: this.baseURL,
            sessionDuration: this.sessionDuration,
            cacheTimeout: this.cacheTimeout,
            autoRefreshInterval: this.autoRefreshInterval,
            requestTimeout: this.requestTimeout,
            isProduction: this.baseURL.includes('98.90.108.255')
        };
    }
}

// Exportar una instancia única (Singleton)
const apiConfig = new APIConfig();

// Para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiConfig;
}

// Para uso en navegadores
if (typeof window !== 'undefined') {
    window.APIConfig = apiConfig;

    // Mensaje de información en consola
    console.log('%c🚌 Wheely API Config Cargado', 'color: #FB6D10; font-weight: bold; font-size: 14px;');
    console.log('%cEntorno:', 'color: #3b82f6; font-weight: bold;', apiConfig.baseURL);
    console.log('%cMódulos disponibles:', 'color: #3b82f6; font-weight: bold;', 'rutas, usuarios, reportes, sistema');
    console.log('%cEjemplo de uso:', 'color: #10b981; font-weight: bold;', 'APIConfig.rutas.getAll()');
}

// ========== CONFIGURACIÓN DE LA API ==========
// Este archivo centraliza todas las configuraciones de la API

class APIConfig {
    constructor() {
        // Cargar configuración desde variables de entorno o usar valores por defecto
        this.baseURL = this.getEnvVar('API_BASE_URL', 'http://localhost:7000');
        this.sessionDuration = parseInt(this.getEnvVar('SESSION_DURATION', '86400000')); // 24 horas por defecto
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        this.autoRefreshInterval = 60000; // 1 minuto
    }

    // Método para obtener variables de entorno (simulado para frontend)
    getEnvVar(key, defaultValue) {
        // En un entorno real, esto podría leer de process.env o de un archivo de configuración
        // Para frontend, necesitarás un sistema de build que inyecte estas variables
        if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
            return window.ENV[key];
        }
        return defaultValue;
    }

    // Getters para acceder a la configuración
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

    // Método para construir URLs de endpoints
    buildURL(endpoint) {
        const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${base}${path}`;
    }

    // Endpoints específicos
    endpoints() {
        return {
            // Rutas
            rutas: this.buildURL('/rutas'),
            rutaById: (id) => this.buildURL(`/rutas/${id}`),

            // Usuarios
            usuarios: this.buildURL('/usuarios'),
            usuarioById: (id) => this.buildURL(`/usuarios/${id}`),

            // Favoritos
            rutasFavoritas: (usuarioId) => this.buildURL(`/usuarios/${usuarioId}/rutas-favoritas`),
            agregarFavorita: (usuarioId) => this.buildURL(`/usuarios/${usuarioId}/rutas-favoritas`),
            eliminarFavorita: (usuarioId, rutaId) => this.buildURL(`/usuarios/${usuarioId}/rutas-favoritas/${rutaId}`),

            // Autenticación
            login: this.buildURL('/auth/login'),
            register: this.buildURL('/auth/register'),
            logout: this.buildURL('/auth/logout'),

            // Reportes
            reportes: this.buildURL('/reportes'),
            reporteById: (id) => this.buildURL(`/reportes/${id}`)
        };
    }

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
        }

        return headers;
    }

    // Configuración de fetch por defecto
    getFetchConfig(method = 'GET', body = null, token = null) {
        const config = {
            method: method,
            headers: token ? this.getAuthHeaders(token) : this.getDefaultHeaders(),
            mode: 'cors',
            cache: 'no-cache'
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(body);
        }

        return config;
    }

    // Método helper para hacer peticiones a la API
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            token = null,
            customHeaders = {}
        } = options;

        try {
            const config = this.getFetchConfig(method, body, token);

            // Merge custom headers
            config.headers = { ...config.headers, ...customHeaders };

            const response = await fetch(endpoint, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
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

    async delete(endpoint, token = null) {
        return this.request(endpoint, { method: 'DELETE', token });
    }

    // Método para validar la conectividad con la API
    async checkConnection() {
        try {
            const response = await fetch(this.buildURL('/health'), {
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
        if (newConfig.baseURL) {
            this.baseURL = newConfig.baseURL;
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
}

// ========== ENDPOINTS DEL SISTEMA ==========
// Centraliza endpoints de configuración, salud y utilidades del sistema

class SistemaEndpoints {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    // Helper para construir URLs
    _buildURL(path) {
        const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
        const endpoint = path.startsWith('/') ? path : `/${path}`;
        return `${base}${endpoint}`;
    }

    // ===== Salud del Sistema =====

    // Verificar estado del servidor
    health() {
        return this._buildURL('/health');
    }

    // Verificar estado detallado
    healthDetailed() {
        return this._buildURL('/health/detailed');
    }

    // Ping al servidor
    ping() {
        return this._buildURL('/ping');
    }

    // ===== Configuración =====

    // Obtener configuración pública
    getConfig() {
        return this._buildURL('/config');
    }

    // Obtener versión del sistema
    getVersion() {
        return this._buildURL('/version');
    }

    // ===== Estadísticas Generales =====

    // Obtener estadísticas del sistema
    getStats() {
        return this._buildURL('/estadisticas');
    }

    // Obtener métricas del sistema
    getMetrics() {
        return this._buildURL('/metricas');
    }

    // Dashboard de administrador
    getDashboard() {
        return this._buildURL('/admin/dashboard');
    }

    // ===== Búsqueda Global =====

    // Búsqueda global en el sistema
    search(query) {
        return this._buildURL(`/buscar?q=${encodeURIComponent(query)}`);
    }

    // Sugerencias de búsqueda
    searchSuggestions(query) {
        return this._buildURL(`/buscar/sugerencias?q=${encodeURIComponent(query)}`);
    }

    // ===== Notificaciones =====

    // Obtener notificaciones del sistema
    getNotifications() {
        return this._buildURL('/notificaciones');
    }

    // Marcar notificación como leída
    markNotificationRead(id) {
        return this._buildURL(`/notificaciones/${id}/leer`);
    }

    // Obtener alertas del sistema
    getAlerts() {
        return this._buildURL('/alertas');
    }

    // ===== Logs y Auditoría =====

    // Obtener logs del sistema (solo admin)
    getLogs(limit = 100) {
        return this._buildURL(`/admin/logs?limit=${limit}`);
    }

    // Obtener auditoría (solo admin)
    getAudit() {
        return this._buildURL('/admin/auditoria');
    }

    // ===== Mantenimiento =====

    // Verificar si el sistema está en mantenimiento
    checkMaintenance() {
        return this._buildURL('/mantenimiento/estado');
    }

    // Activar modo mantenimiento (solo admin)
    enableMaintenance() {
        return this._buildURL('/admin/mantenimiento/activar');
    }

    // Desactivar modo mantenimiento (solo admin)
    disableMaintenance() {
        return this._buildURL('/admin/mantenimiento/desactivar');
    }

    // ===== Cache =====

    // Limpiar cache (solo admin)
    clearCache() {
        return this._buildURL('/admin/cache/limpiar');
    }

    // Obtener estado del cache
    getCacheStatus() {
        return this._buildURL('/admin/cache/estado');
    }

    // ===== Configuración Regional =====

    // Obtener zonas disponibles
    getZones() {
        return this._buildURL('/zonas');
    }

    // Obtener información de zona específica
    getZoneInfo(zonaId) {
        return this._buildURL(`/zonas/${zonaId}`);
    }

    // ===== API Info =====

    // Obtener documentación de la API
    getApiDocs() {
        return this._buildURL('/api/docs');
    }

    // Obtener endpoints disponibles
    getEndpoints() {
        return this._buildURL('/api/endpoints');
    }
}

// Exportar para uso en diferentes entornos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaEndpoints;
}

if (typeof window !== 'undefined') {
    window.SistemaEndpoints = SistemaEndpoints;
}

// ========== ENDPOINTS DE REPORTES ==========
// Centraliza todos los endpoints relacionados con reportes

class ReportesEndpoints {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    // Helper para construir URLs
    _buildURL(path) {
        const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
        const endpoint = path.startsWith('/') ? path : `/${path}`;
        return `${base}${endpoint}`;
    }

    // ===== Reportes Principales =====

    // Obtener todos los reportes
    getAll() {
        return this._buildURL('/reportes');
    }

    // Obtener reporte por ID
    getById(id) {
        return this._buildURL(`/reportes/${id}`);
    }

    // Crear nuevo reporte
    create() {
        return this._buildURL('/reportes');
    }

    // Actualizar reporte
    update(id) {
        return this._buildURL(`/reportes/${id}`);
    }

    // Eliminar reporte
    delete(id) {
        return this._buildURL(`/reportes/${id}`);
    }

    // ===== Filtrado de Reportes =====

    // Obtener reportes por ruta
    getByRoute(rutaId) {
        return this._buildURL(`/reportes/ruta/${rutaId}`);
    }

    // Obtener reportes por usuario
    getByUser(usuarioId) {
        return this._buildURL(`/reportes/usuario/${usuarioId}`);
    }

    // Obtener reportes por tipo
    getByType(tipoReporte) {
        return this._buildURL(`/reportes/tipo/${tipoReporte}`);
    }

    // Obtener reportes públicos
    getPublic() {
        return this._buildURL('/reportes/publicos');
    }

    // Obtener reportes recientes
    getRecent(limit = 10) {
        return this._buildURL(`/reportes/recientes?limit=${limit}`);
    }

    // ===== Tipos de Reporte =====

    // Obtener todos los tipos de reporte
    getTypes() {
        return this._buildURL('/tipos-reporte');
    }

    // Obtener tipo de reporte por ID
    getTypeById(id) {
        return this._buildURL(`/tipos-reporte/${id}`);
    }

    // Crear nuevo tipo de reporte
    createType() {
        return this._buildURL('/tipos-reporte');
    }

    // ===== Estado de Reportes =====

    // Obtener reportes pendientes
    getPending() {
        return this._buildURL('/reportes/pendientes');
    }

    // Obtener reportes resueltos
    getResolved() {
        return this._buildURL('/reportes/resueltos');
    }

    // Marcar reporte como resuelto
    markAsResolved(id) {
        return this._buildURL(`/reportes/${id}/resolver`);
    }

    // ===== Búsqueda y Estadísticas =====

    // Buscar reportes
    search(query) {
        return this._buildURL(`/reportes/buscar?q=${encodeURIComponent(query)}`);
    }

    // Obtener estadísticas de reportes
    getStats() {
        return this._buildURL('/reportes/estadisticas');
    }

    // Obtener estadísticas por ruta
    getStatsByRoute(rutaId) {
        return this._buildURL(`/reportes/estadisticas/ruta/${rutaId}`);
    }

    // ===== Interacciones con Reportes =====

    // Votar por un reporte (útil/no útil)
    vote(id) {
        return this._buildURL(`/reportes/${id}/votar`);
    }

    // Comentar en un reporte
    comment(id) {
        return this._buildURL(`/reportes/${id}/comentarios`);
    }

    // Obtener comentarios de un reporte
    getComments(id) {
        return this._buildURL(`/reportes/${id}/comentarios`);
    }

    // ===== Archivos Adjuntos =====

    // Subir archivo al reporte
    uploadFile(id) {
        return this._buildURL(`/reportes/${id}/archivos`);
    }

    // Obtener archivos del reporte
    getFiles(id) {
        return this._buildURL(`/reportes/${id}/archivos`);
    }

    // Eliminar archivo del reporte
    deleteFile(reporteId, archivoId) {
        return this._buildURL(`/reportes/${reporteId}/archivos/${archivoId}`);
    }
}

// Exportar para uso en diferentes entornos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportesEndpoints;
}

if (typeof window !== 'undefined') {
    window.ReportesEndpoints = ReportesEndpoints;
}

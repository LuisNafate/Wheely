// ========== ENDPOINTS DE RUTAS ==========
// Centraliza todos los endpoints relacionados con rutas

class RutasEndpoints {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    // Helper para construir URLs
    _buildURL(path) {
        const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
        const endpoint = path.startsWith('/') ? path : `/${path}`;
        return `${base}${endpoint}`;
    }

    // ===== Rutas Principales =====

    // Obtener todas las rutas
    getAll() {
        return this._buildURL('/rutas');
    }

    // Obtener ruta por ID
    getById(id) {
        return this._buildURL(`/rutas/${id}`);
    }

    // Crear nueva ruta
    create() {
        return this._buildURL('/rutas');
    }

    // Actualizar ruta
    update(id) {
        return this._buildURL(`/rutas/${id}`);
    }

    // Eliminar ruta
    delete(id) {
        return this._buildURL(`/rutas/${id}`);
    }

    // ===== Coordenadas de Rutas =====

    // Obtener coordenadas de una ruta
    getCoordinates(id) {
        return this._buildURL(`/rutas/${id}/coordinates`);
    }

    // Agregar coordenadas a una ruta
    addCoordinates(id) {
        return this._buildURL(`/rutas/${id}/coordinates`);
    }

    // ===== Paradas de Rutas =====

    // Obtener paradas de una ruta
    getStops(id) {
        return this._buildURL(`/rutas/${id}/paradas`);
    }

    // Agregar parada a una ruta
    addStop(id) {
        return this._buildURL(`/rutas/${id}/paradas`);
    }

    // Eliminar parada de una ruta
    deleteStop(rutaId, paradaId) {
        return this._buildURL(`/rutas/${rutaId}/paradas/${paradaId}`);
    }

    // ===== Tiempos de Rutas =====

    // Obtener tiempos de una ruta
    getTimes(id) {
        return this._buildURL(`/rutas/${id}/tiempos`);
    }

    // Obtener tiempos de ruta por periodo
    getTimesByPeriod(id, periodoId) {
        return this._buildURL(`/api/tiempos-ruta-periodo?idRuta=${id}&idPeriodo=${periodoId}`);
    }

    // Obtener todos los tiempos de ruta por periodo
    getAllTimesByPeriod(id) {
        return this._buildURL(`/api/tiempos-ruta-periodo?idRuta=${id}`);
    }

    // ===== Búsqueda y Filtrado =====

    // Buscar rutas por nombre
    searchByName(nombre) {
        return this._buildURL(`/rutas/buscar?nombre=${encodeURIComponent(nombre)}`);
    }

    // Filtrar rutas por zona
    filterByZone(zona) {
        return this._buildURL(`/rutas/zona/${zona}`);
    }

    // Filtrar rutas activas
    getActive() {
        return this._buildURL('/rutas/activas');
    }

    // ===== GeoJSON =====

    // Obtener GeoJSON de ida de una ruta
    getGeoJsonIda(id) {
        return this._buildURL(`/rutas/${id}/geojson/ida`);
    }

    // Obtener GeoJSON de regreso de una ruta
    getGeoJsonRegreso(id) {
        return this._buildURL(`/rutas/${id}/geojson/regreso`);
    }
}

// Exportar para uso en diferentes entornos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RutasEndpoints;
}

if (typeof window !== 'undefined') {
    window.RutasEndpoints = RutasEndpoints;
}

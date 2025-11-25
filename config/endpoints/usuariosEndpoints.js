// ========== ENDPOINTS DE USUARIOS ==========
// Centraliza todos los endpoints relacionados con usuarios

class UsuariosEndpoints {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    // Helper para construir URLs
    _buildURL(path) {
        const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
        const endpoint = path.startsWith('/') ? path : `/${path}`;
        return `${base}${endpoint}`;
    }

    // ===== Usuarios Principales =====

    // Obtener todos los usuarios
    getAll() {
        return this._buildURL('/usuarios');
    }

    // Obtener usuario por ID
    getById(id) {
        return this._buildURL(`/usuarios/${id}`);
    }

    // Crear nuevo usuario
    create() {
        return this._buildURL('/usuarios');
    }

    // Actualizar usuario
    update(id) {
        return this._buildURL(`/usuarios/${id}`);
    }

    // Eliminar usuario
    delete(id) {
        return this._buildURL(`/usuarios/${id}`);
    }

    // ===== Autenticación =====

    // Login de usuario
    login() {
        return this._buildURL('/usuarios/login');
    }

    // Registro de usuario
    register() {
        return this._buildURL('/usuarios/register');
    }

    // Logout de usuario
    logout() {
        return this._buildURL('/usuarios/logout');
    }

    // Verificar token
    verifyToken() {
        return this._buildURL('/usuarios/verify-token');
    }

    // Refrescar token
    refreshToken() {
        return this._buildURL('/usuarios/refresh-token');
    }

    // ===== Recuperación de Contraseña =====

    // Solicitar recuperación de contraseña
    forgotPassword() {
        return this._buildURL('/usuarios/forgot-password');
    }

    // Resetear contraseña
    resetPassword() {
        return this._buildURL('/usuarios/reset-password');
    }

    // Cambiar contraseña
    changePassword(id) {
        return this._buildURL(`/usuarios/${id}/change-password`);
    }

    // ===== Rutas Favoritas =====

    // Obtener rutas favoritas de un usuario
    getFavorites(usuarioId) {
        return this._buildURL(`/usuarios/${usuarioId}/rutas-favoritas`);
    }

    // Agregar ruta a favoritos
    addFavorite(usuarioId) {
        return this._buildURL(`/usuarios/${usuarioId}/rutas-favoritas`);
    }

    // Eliminar ruta de favoritos
    removeFavorite(usuarioId, rutaId) {
        return this._buildURL(`/usuarios/${usuarioId}/rutas-favoritas/${rutaId}`);
    }

    // Verificar si una ruta es favorita
    isFavorite(usuarioId, rutaId) {
        return this._buildURL(`/usuarios/${usuarioId}/rutas-favoritas/${rutaId}/check`);
    }

    // ===== Perfil de Usuario =====

    // Obtener perfil de usuario
    getProfile(id) {
        return this._buildURL(`/usuarios/${id}/perfil`);
    }

    // Actualizar perfil de usuario
    updateProfile(id) {
        return this._buildURL(`/usuarios/${id}/perfil`);
    }

    // Actualizar avatar
    updateAvatar(id) {
        return this._buildURL(`/usuarios/${id}/avatar`);
    }

    // ===== Historial y Actividad =====

    // Obtener historial de búsquedas
    getSearchHistory(id) {
        return this._buildURL(`/usuarios/${id}/historial-busquedas`);
    }

    // Obtener reportes del usuario
    getUserReports(id) {
        return this._buildURL(`/usuarios/${id}/reportes`);
    }

    // Obtener actividad reciente
    getRecentActivity(id) {
        return this._buildURL(`/usuarios/${id}/actividad`);
    }

    // ===== Preferencias =====

    // Obtener preferencias del usuario
    getPreferences(id) {
        return this._buildURL(`/usuarios/${id}/preferencias`);
    }

    // Actualizar preferencias
    updatePreferences(id) {
        return this._buildURL(`/usuarios/${id}/preferencias`);
    }

    // ===== Administración =====

    // Verificar si es administrador
    checkAdmin(id) {
        return this._buildURL(`/usuarios/${id}/is-admin`);
    }

    // Obtener estadísticas del usuario
    getStats(id) {
        return this._buildURL(`/usuarios/${id}/estadisticas`);
    }
}

// Exportar para uso en diferentes entornos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UsuariosEndpoints;
}

if (typeof window !== 'undefined') {
    window.UsuariosEndpoints = UsuariosEndpoints;
}

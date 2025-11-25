// ========== ÍNDICE DE ENDPOINTS ==========
// Exporta todos los módulos de endpoints para fácil importación

// Importar todos los módulos de endpoints
// (En navegador, estos ya estarán disponibles globalmente si se cargan con <script>)

// Para uso en navegadores - verificar si las clases están disponibles
if (typeof window !== 'undefined') {
    // Las clases ya están disponibles globalmente
    // Este archivo solo sirve como referencia de la estructura
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RutasEndpoints: require('./rutasEndpoints'),
        UsuariosEndpoints: require('./usuariosEndpoints'),
        ReportesEndpoints: require('./reportesEndpoints'),
        SistemaEndpoints: require('./sistemaEndpoints')
    };
}

/**
 * ESTRUCTURA DE ENDPOINTS:
 *
 * - rutasEndpoints.js: Todos los endpoints relacionados con rutas de transporte
 *   - CRUD de rutas
 *   - Coordenadas y GeoJSON
 *   - Paradas
 *   - Tiempos de viaje
 *   - Búsqueda y filtrado
 *
 * - usuariosEndpoints.js: Todos los endpoints relacionados con usuarios
 *   - CRUD de usuarios
 *   - Autenticación (login, register, logout)
 *   - Recuperación de contraseña
 *   - Rutas favoritas
 *   - Perfil y preferencias
 *   - Historial y actividad
 *
 * - reportesEndpoints.js: Todos los endpoints relacionados con reportes
 *   - CRUD de reportes
 *   - Tipos de reporte
 *   - Filtrado por ruta, usuario, tipo
 *   - Estado de reportes
 *   - Interacciones (votos, comentarios)
 *   - Archivos adjuntos
 *
 * - sistemaEndpoints.js: Endpoints del sistema y administración
 *   - Salud del sistema
 *   - Configuración
 *   - Estadísticas y métricas
 *   - Búsqueda global
 *   - Notificaciones y alertas
 *   - Mantenimiento
 *   - Logs y auditoría
 */

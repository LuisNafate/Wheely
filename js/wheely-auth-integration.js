// ========== GESTIÓN DE USUARIOS Y SESIONES ==========

// Obtener configuración de la API desde APIConfig
const API_BASE_URL = window.APIConfig ? window.APIConfig.getBaseURL() : 'http://localhost:7000';

// Función para obtener el usuario actual desde localStorage
function obtenerUsuarioActual() {
    try {
        const userData = localStorage.getItem('wheelyUser');
        if (!userData) {
            console.warn('No hay usuario autenticado');
            return null;
        }
        
        const user = JSON.parse(userData);
        
        // Verificar que la sesión no haya expirado
        const loginTime = user.loginTime;
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - loginTime;
        const SESSION_DURATION = window.APIConfig ? window.APIConfig.getSessionDuration() : 24 * 60 * 60 * 1000; // 24 horas
        
        if (timeDiff > SESSION_DURATION) {
            console.warn('Sesión expirada');
            localStorage.removeItem('wheelyUser');
            return null;
        }
        
        return user;
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        localStorage.removeItem('wheelyUser');
        return null;
    }
}

// Función para obtener el ID del usuario actual
function obtenerIdUsuarioActual() {
    const usuario = obtenerUsuarioActual();
    return usuario ? usuario.id : null;
}

// Función para verificar autenticación antes de usar APIs
function verificarAutenticacion() {
    const usuario = obtenerUsuarioActual();
    if (!usuario) {
        mostrarToast('Sesión expirada. Redirigiendo al login...', 'warning');
        setTimeout(() => {
            window.location.href = 'wheely_welcome.html';
        }, 2000);
        return false;
    }
    return true;
}

// ========== FUNCIONES DE API CON AUTENTICACIÓN ==========

// Obtener todas las rutas (no requiere autenticación específica)
async function obtenerTodasLasRutas() {
    try {
        const response = await fetch(`${API_BASE_URL}/rutas`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error al obtener rutas:', error);
        return [];
    }
}

// Obtener rutas favoritas del usuario autenticado
async function obtenerRutasFavoritas() {
    if (!verificarAutenticacion()) return [];
    
    const usuarioId = obtenerIdUsuarioActual();
    if (!usuarioId) return [];
    
    try {
        console.log(`Obteniendo favoritas para usuario ID: ${usuarioId}`);
        const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/rutas-favoritas`);
        const data = await response.json();
        
        if (data.success) {
            console.log(`Favoritas encontradas: ${data.data.length}`);
            return data.data;
        } else {
            console.warn('Error en respuesta de favoritas:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error al obtener favoritas:', error);
        return [];
    }
}

// Agregar ruta a favoritos del usuario autenticado
async function agregarRutaFavorita(rutaId) {
    if (!verificarAutenticacion()) return false;
    
    const usuarioId = obtenerIdUsuarioActual();
    if (!usuarioId) return false;
    
    try {
        console.log(`Agregando ruta ${rutaId} a favoritos del usuario ${usuarioId}`);
        const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/rutas-favoritas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rutaId: parseInt(rutaId) })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Ruta agregada a favoritos exitosamente');
            // Invalidar cache específico del usuario
            invalidarCacheFavoritas(usuarioId);
            return true;
        } else {
            console.error('Error al agregar favorita:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Error al agregar favorita:', error);
        return false;
    }
}

// Eliminar ruta de favoritos del usuario autenticado
async function eliminarRutaFavorita(rutaId) {
    if (!verificarAutenticacion()) return false;
    
    const usuarioId = obtenerIdUsuarioActual();
    if (!usuarioId) return false;
    
    try {
        console.log(`Eliminando ruta ${rutaId} de favoritos del usuario ${usuarioId}`);
        const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/rutas-favoritas/${rutaId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Ruta eliminada de favoritos exitosamente');
            // Invalidar cache específico del usuario
            invalidarCacheFavoritas(usuarioId);
            return true;
        } else {
            console.error('Error al eliminar favorita:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Error al eliminar favorita:', error);
        return false;
    }
}

// ========== SISTEMA DE CACHE POR USUARIO ==========

class RutasCache {
    constructor() {
        this.cache = new Map();
        this.timeout = 5 * 60 * 1000; // 5 minutos
    }
    
    getKey(tipo, usuarioId = null) {
        if (usuarioId) {
            return `${tipo}_usuario_${usuarioId}`;
        }
        return tipo;
    }
    
    set(key, data, usuarioId = null) {
        const finalKey = this.getKey(key, usuarioId);
        this.cache.set(finalKey, {
            data: data,
            timestamp: Date.now()
        });
        console.log(`Cache guardado: ${finalKey}`);
    }
    
    get(key, usuarioId = null) {
        const finalKey = this.getKey(key, usuarioId);
        const item = this.cache.get(finalKey);
        
        if (!item) {
            console.log(`Cache miss: ${finalKey}`);
            return null;
        }
        
        if (Date.now() - item.timestamp > this.timeout) {
            this.cache.delete(finalKey);
            console.log(`Cache expirado: ${finalKey}`);
            return null;
        }
        
        console.log(`Cache hit: ${finalKey}`);
        return item.data;
    }
    
    invalidate(key, usuarioId = null) {
        const finalKey = this.getKey(key, usuarioId);
        this.cache.delete(finalKey);
        console.log(`Cache invalidado: ${finalKey}`);
    }
    
    clear() {
        this.cache.clear();
        console.log('Cache completamente limpiado');
    }
    
    clearForUser(usuarioId) {
        const keysToDelete = [];
        for (let key of this.cache.keys()) {
            if (key.includes(`_usuario_${usuarioId}`)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => this.cache.delete(key));
        console.log(`Cache limpiado para usuario ${usuarioId}: ${keysToDelete.length} items`);
    }
}

const cache = new RutasCache();

// Función mejorada para obtener rutas con cache
async function obtenerTodasLasRutasConCache() {
    const cached = cache.get('todas_las_rutas');
    
    if (cached) {
        return cached;
    }
    
    const rutas = await obtenerTodasLasRutas();
    cache.set('todas_las_rutas', rutas);
    return rutas;
}

// Función mejorada para obtener favoritas con cache por usuario
async function obtenerRutasFavoritasConCache() {
    const usuarioId = obtenerIdUsuarioActual();
    if (!usuarioId) return [];
    
    const cached = cache.get('favoritas', usuarioId);
    
    if (cached) {
        return cached;
    }
    
    const favoritas = await obtenerRutasFavoritas();
    cache.set('favoritas', favoritas, usuarioId);
    return favoritas;
}

// Función para invalidar cache cuando se modifican favoritos
function invalidarCacheFavoritas(usuarioId = null) {
    const userId = usuarioId || obtenerIdUsuarioActual();
    if (userId) {
        cache.invalidate('favoritas', userId);
    }
}

// ========== FUNCIONES DE RENDERIZADO CON AUTENTICACIÓN ==========

// Renderizar rutas favoritas del usuario autenticado
async function renderizarRutasFavoritas() {
    const favoritasContainer = document.querySelector('#favoritos-panel .panel-content');
    if (!favoritasContainer) return;

    // Verificar autenticación
    if (!verificarAutenticacion()) {
        favoritasContainer.innerHTML = `
            <div class="error-message">
                <p>Debes iniciar sesión para ver tus favoritos.</p>
                <button class="btn-reload" onclick="window.location.href='wheely_welcome.html'">Ir al Login</button>
            </div>
        `;
        return;
    }

    const usuario = obtenerUsuarioActual();
    
    try {
        // Mostrar loading
        favoritasContainer.innerHTML = `
            <div class="loading-message">
                <p>Cargando favoritos de ${usuario.name}...</p>
            </div>
        `;

        // Obtener favoritas y rutas
        const [rutasFavoritas, todasLasRutas] = await Promise.all([
            obtenerRutasFavoritasConCache(),
            obtenerTodasLasRutasConCache()
        ]);

        // Crear un mapa de rutas por ID
        const rutasMap = {};
        todasLasRutas.forEach(ruta => {
            rutasMap[ruta.idRuta] = ruta;
        });

        // Generar HTML para las rutas favoritas
        let favoritasHTML = '';
        
        if (rutasFavoritas.length === 0) {
            favoritasHTML = `
                <div class="no-favoritas">
                    <p>Hola ${usuario.name}, no tienes rutas favoritas aún.</p>
                    <p>Agrega rutas desde la sección "Todas las Rutas".</p>
                </div>
            `;
        } else {
            rutasFavoritas.forEach(favorita => {
                const ruta = rutasMap[favorita.idRuta];
                if (ruta) {
                    const tiempoEspera = obtenerTiempoEspera(ruta.idRuta);
                    favoritasHTML += `
                        <div class="ruta-item" data-ruta="${ruta.idRuta}">
                            <div class="ruta-info">
                                <div class="ruta-icon">
                                    <i class="bi bi-bus-front-fill"></i>
                                </div>
                                <div class="ruta-details">
                                    <h4>${ruta.nombreRuta}</h4>
                                    <p><strong>Origen:</strong> ${ruta.origen}</p>
                                    <p><strong>Destino:</strong> ${ruta.destino}</p>
                                    <div class="ruta-tiempo">
                                        <i class="bi bi-clock"></i>
                                        <span>Espera: ${tiempoEspera} min</span>
                                    </div>
                                </div>
                            </div>
                            <div class="ruta-actions">
                                <span class="material-symbols-rounded action-icon report-icon" title="Reportar problema">chat_info</span>
                                <i class="bi bi-star-fill action-icon star-icon favorito" title="Quitar de favoritos" data-ruta-id="${ruta.idRuta}"></i>
                            </div>
                        </div>
                    `;
                }
            });
        }

        favoritasContainer.innerHTML = favoritasHTML;
        
        // Configurar eventos para las nuevas rutas favoritas
        configurarEventosFavoritos();
        
    } catch (error) {
        console.error('Error al renderizar favoritas:', error);
        favoritasContainer.innerHTML = `
            <div class="error-message">
                <p>Error al cargar tus rutas favoritas.</p>
                <button class="btn-reload" onclick="renderizarRutasFavoritas()">Reintentar</button>
            </div>
        `;
    }
}

// Renderizar todas las rutas con indicadores de favoritos del usuario actual
async function renderizarTodasLasRutas() {
    const rutasContainer = document.querySelector('#rutas-content');
    if (!rutasContainer) return;

    try {
        // Mostrar loading
        rutasContainer.innerHTML = `
            <div class="loading-message">
                <p>Cargando rutas disponibles...</p>
            </div>
        `;

        // Obtener rutas y favoritas (favoritas puede estar vacío si no hay usuario autenticado)
        const [todasLasRutas, rutasFavoritas] = await Promise.all([
            obtenerTodasLasRutasConCache(),
            obtenerRutasFavoritasConCache() // Esto manejará automáticamente el caso sin autenticación
        ]);

        // Crear set de IDs de rutas favoritas
        const favoritasIds = new Set(rutasFavoritas.map(fav => fav.idRuta));

        // Generar HTML para todas las rutas
        let rutasHTML = '';
        
        if (todasLasRutas.length === 0) {
            rutasHTML = '<div class="error-message">No se encontraron rutas disponibles.</div>';
        } else {
            const usuario = obtenerUsuarioActual();
            const usuarioAutenticado = !!usuario;
            
            todasLasRutas.forEach(ruta => {
                const esFavorita = favoritasIds.has(ruta.idRuta);
                const iconoEstrella = esFavorita ? 'bi-star-fill favorito' : 'bi-star';
                const titleEstrella = esFavorita ? 'Quitar de favoritos' : 'Agregar a favoritos';
                const tiempoEspera = obtenerTiempoEspera(ruta.idRuta);

                // Deshabilitar estrella si no está autenticado
                const estrellaClass = usuarioAutenticado ? iconoEstrella : 'bi-star disabled';
                const estrellaTitle = usuarioAutenticado ? titleEstrella : 'Inicia sesión para agregar favoritos';

                rutasHTML += `
                    <div class="ruta-item" data-ruta="${ruta.idRuta}" >
                        <div class="ruta-info">
                            <div class="ruta-icon">
                                <i class="bi bi-bus-front-fill"></i>
                            </div>
                            <div class="ruta-details">
                                <h4>${ruta.nombreRuta}</h4>
                                <p><strong>Origen:</strong> ${ruta.origen}</p>
                                <p><strong>Destino:</strong> ${ruta.destino}</p>
                                <div class="ruta-tiempo">
                                    <i class="bi bi-clock"></i>
                                    <span>Espera: ${tiempoEspera} min</span>
                                </div>
                            </div>
                        </div>
                        <div class="ruta-actions">
                            <span class="material-symbols-rounded action-icon report-icon" title="Reportar problema">chat_info</span>
                            <i class="bi ${estrellaClass} action-icon star-icon" title="${estrellaTitle}" data-ruta-id="${ruta.idRuta}" ${usuarioAutenticado ? '' : 'data-disabled="true"'}></i>
                        </div>
                        
                    </div>
                `;
            });
        }

        rutasContainer.innerHTML = rutasHTML;
        
        // Configurar eventos para las nuevas rutas
        configurarEventosRutas();
        configurarBusquedaRutas();
        
    } catch (error) {
        console.error('Error al renderizar rutas:', error);
        rutasContainer.innerHTML = `
            <div class="error-message">
                <p>Error al cargar rutas.</p>
                <button class="btn-reload" onclick="renderizarTodasLasRutas()">Reintentar</button>
            </div>
        `;
    }
}

// ========== CONFIGURACIÓN DE EVENTOS CON AUTENTICACIÓN ==========

// Configurar eventos para favoritos con verificación de autenticación
function configurarEventosFavoritos() {
    document.querySelectorAll('#favoritos-panel .star-icon').forEach(starIcon => {
        starIcon.addEventListener('click', async function(e) {
            e.stopPropagation();
            
            if (!verificarAutenticacion()) return;
            
            const rutaId = parseInt(this.dataset.rutaId);
            const success = await eliminarRutaFavorita(rutaId);
            
            if (success) {
                // Efecto visual
                this.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
                
                mostrarToast('Ruta eliminada de favoritos', 'success');
                
                // Volver a cargar favoritas después de un breve delay
                setTimeout(() => {
                    renderizarRutasFavoritas();
                }, 300);
                
            } else {
                mostrarToast('Error al quitar de favoritos. Inténtalo de nuevo.', 'error');
            }
        });
    });
}

// Configurar eventos para todas las rutas con verificación de autenticación
function configurarEventosRutas() {
    document.querySelectorAll('#rutas-content .star-icon').forEach(starIcon => {
        starIcon.addEventListener('click', async function(e) {
            e.stopPropagation();
            
            // Verificar si está deshabilitado (usuario no autenticado)
            if (this.dataset.disabled === 'true') {
                mostrarToast('Inicia sesión para gestionar favoritos', 'warning');
                return;
            }
            
            if (!verificarAutenticacion()) return;
            
            const rutaId = parseInt(this.dataset.rutaId);
            const esFavorita = this.classList.contains('favorito');
            
            let success = false;
            
            if (esFavorita) {
                // Quitar de favoritos
                success = await eliminarRutaFavorita(rutaId);
                if (success) {
                    this.classList.remove('bi-star-fill', 'favorito');
                    this.classList.add('bi-star');
                    this.title = 'Agregar a favoritos';
                    mostrarToast('Ruta eliminada de favoritos', 'success');
                }
            } else {
                // Agregar a favoritos
                success = await agregarRutaFavorita(rutaId);
                if (success) {
                    this.classList.remove('bi-star');
                    this.classList.add('bi-star-fill', 'favorito');
                    this.title = 'Quitar de favoritos';
                    mostrarToast('Ruta agregada a favoritos', 'success');
                }
            }
            
            if (success) {
                // Efecto visual
                this.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
            } else {
                mostrarToast('Error al actualizar favoritos. Inténtalo de nuevo.', 'error');
            }
        });
    });
}

// ========== GESTIÓN DE CAMBIOS DE USUARIO ==========

// Detectar cambios en el localStorage (cambio de usuario)
window.addEventListener('storage', function(e) {
    if (e.key === 'wheelyUser') {
        console.log('Cambio de usuario detectado');
        
        // Limpiar cache del usuario anterior
        cache.clear();
        
        // Recargar datos si hay paneles abiertos
        const favoritosVisible = document.querySelector('#favoritos-panel').style.display !== 'none';
        const rutasVisible = document.querySelector('#rutas-panel').style.display !== 'none';
        
        if (favoritosVisible) {
            renderizarRutasFavoritas();
        }
        
        if (rutasVisible) {
            renderizarTodasLasRutas();
        }
        
        // Actualizar interfaz de usuario
        const nuevoUsuario = obtenerUsuarioActual();
        if (nuevoUsuario) {
            actualizarInterfazUsuario(nuevoUsuario);
        }
    }
});

// Función para actualizar la interfaz cuando cambia el usuario
function actualizarInterfazUsuario(usuario) {
    try {
        // Actualizar nombre del usuario en el perfil
        const nameElement = document.querySelector('.profile-info .name');
        if (nameElement && usuario.name) {
            nameElement.textContent = usuario.name;
        }
        
        console.log('Interfaz actualizada para usuario:', usuario.name);
        
    } catch (error) {
        console.error('Error al actualizar interfaz de usuario:', error);
    }
}

// ========== FUNCIONES DE UTILIDAD ==========

// Sistema de notificaciones toast (reutilizado del archivo anterior)
function mostrarToast(mensaje, tipo = 'info', duracion = 3000) {
    // Remover toasts existentes
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    
    // Agregar al DOM
    document.body.appendChild(toast);
    
    // Mostrar con animación
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Ocultar y remover
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, duracion);
}

// Función para obtener tiempos de espera (simulada)
function obtenerTiempoEspera(rutaId) {
    const tiempos = [5, 8, 12, 15, 18, 20];
    return tiempos[Math.floor(Math.random() * tiempos.length)];
}

// Configurar búsqueda de rutas
function configurarBusquedaRutas() {
    const searchInput = document.querySelector('#search-rutas');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rutaItems = document.querySelectorAll('#rutas-content .ruta-item');
        
        rutaItems.forEach(item => {
            const rutaNombre = item.querySelector('h4').textContent.toLowerCase();
            const rutaOrigen = item.querySelector('p').textContent.toLowerCase();
            
            if (rutaNombre.includes(searchTerm) || rutaOrigen.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// ========== INICIALIZACIÓN ==========

// Función principal de inicialización
async function inicializarAPI() {
    console.log('Inicializando integración con API...');
    
    const usuario = obtenerUsuarioActual();
    if (usuario) {
        console.log(`Usuario autenticado: ${usuario.name} (ID: ${usuario.id})`);
        actualizarInterfazUsuario(usuario);
    } else {
        console.log('No hay usuario autenticado');
    }
    
    // Cargar datos iniciales
    await Promise.all([
        renderizarRutasFavoritas(),
        renderizarTodasLasRutas()
    ]);
    
    console.log('API integrada correctamente');
}

// Eventos de navegación con verificación de autenticación
document.addEventListener('DOMContentLoaded', function() {
    // Evento para abrir favoritos
    const favoritosButton = document.querySelector('#favoritos-trigger');
    if (favoritosButton) {
        favoritosButton.addEventListener('click', async function(e) {
            e.preventDefault();
            // Recargar favoritas cada vez que se abra el panel
            await renderizarRutasFavoritas();
        });
    }

    // Evento para abrir rutas
    const rutasButton = document.querySelector('#rutas-trigger');
    if (rutasButton) {
        rutasButton.addEventListener('click', async function(e) {
            e.preventDefault();
            // Recargar rutas cada vez que se abra el panel
            await renderizarTodasLasRutas();
        });
    }

    // Inicializar la API cuando se carga la página
    inicializarAPI();
});
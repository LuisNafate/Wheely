// Obtener configuración de la API desde APIConfig
const API_BASE_URL = window.APIConfig.getBaseURL();
const USUARIO_ID = 1; // Aquí deberías obtener el ID del usuario actual desde el login/sesión

// ========== FUNCIONES DE API ==========

// Obtener todas las rutas
async function obtenerTodasLasRutas() {
    try {
        const response = await fetch(`${API_BASE_URL}rutas`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error al obtener rutas:', error);
        return [];
    }
}

// Obtener rutas favoritas del usuario
async function obtenerRutasFavoritas() {
    try {
        const response = await fetch(`${API_BASE_URL}usuarios/${USUARIO_ID}/rutas-favoritas`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error al obtener favoritas:', error);
        return [];
    }
}

// Agregar ruta a favoritos
async function agregarRutaFavorita(rutaId) {
    try {
        const response = await fetch(`${API_BASE_URL}usuarios/${USUARIO_ID}/rutas-favoritas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rutaId: rutaId })
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Error al agregar favorita:', error);
        return false;
    }
}

// Eliminar ruta de favoritos
async function eliminarRutaFavorita(rutaId) {
    try {
        const response = await fetch(`${API_BASE_URL}usuarios/${USUARIO_ID}/rutas-favoritas/${rutaId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Error al eliminar favorita:', error);
        return false;
    }
}

// ========== FUNCIONES DE RENDERIZADO ==========

// Renderizar rutas favoritas en el panel de favoritos
async function renderizarRutasFavoritas() {
    const favoritasContainer = document.querySelector('#favoritos-panel .panel-content');
    if (!favoritasContainer) return;

    try {
        // Obtener favoritas y rutas
        const [rutasFavoritas, todasLasRutas] = await Promise.all([
            obtenerRutasFavoritas(),
            obtenerTodasLasRutas()
        ]);

        // Crear un mapa de rutas por ID para fácil acceso
        const rutasMap = {};
        todasLasRutas.forEach(ruta => {
            rutasMap[ruta.idRuta] = ruta;
        });

        // Generar HTML para las rutas favoritas
        let favoritasHTML = '';
        
        if (rutasFavoritas.length === 0) {
            favoritasHTML = `
                <div class="no-favoritas">
                    <p>No tienes rutas favoritas aún.</p>
                    <p>Agrega rutas desde la sección "Todas las Rutas".</p>
                </div>
            `;
        } else {
            rutasFavoritas.forEach(favorita => {
                const ruta = rutasMap[favorita.idRuta];
                if (ruta) {
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
                                        <span>Cargando tiempo...</span>
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
        favoritasContainer.innerHTML = '<p>Error al cargar rutas favoritas.</p>';
    }
}

// Renderizar todas las rutas en el panel de rutas
async function renderizarTodasLasRutas() {
    const rutasContainer = document.querySelector('#rutas-content');
    if (!rutasContainer) return;

    try {
        // Obtener rutas y favoritas
        const [todasLasRutas, rutasFavoritas] = await Promise.all([
            obtenerTodasLasRutas(),
            obtenerRutasFavoritas()
        ]);

        // Crear set de IDs de rutas favoritas para verificación rápida
        const favoritasIds = new Set(rutasFavoritas.map(fav => fav.idRuta));

        // Generar HTML para todas las rutas
        let rutasHTML = '';
        
        if (todasLasRutas.length === 0) {
            rutasHTML = '<p>No se encontraron rutas disponibles.</p>';
        } else {
            todasLasRutas.forEach(ruta => {
                const esFavorita = favoritasIds.has(ruta.idRuta);
                const iconoEstrella = esFavorita ? 'bi-star-fill favorito' : 'bi-star';
                const titleEstrella = esFavorita ? 'Quitar de favoritos' : 'Agregar a favoritos';

                rutasHTML += `
                    <div class="ruta-item" data-ruta="${ruta.idRuta}" data-zona="centro">
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
                                    <span>Cargando tiempo...</span>
                                </div>
                            </div>
                        </div>
                        <div class="ruta-actions">
                            <span class="material-symbols-rounded action-icon report-icon" title="Reportar problema">chat_info</span>
                            <i class="bi ${iconoEstrella} action-icon star-icon" title="${titleEstrella}" data-ruta-id="${ruta.idRuta}"></i>
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
        rutasContainer.innerHTML = '<p>Error al cargar rutas.</p>';
    }
}

// ========== CONFIGURACIÓN DE EVENTOS ==========

// Configurar eventos para favoritos
function configurarEventosFavoritos() {
    document.querySelectorAll('#favoritos-panel .star-icon').forEach(starIcon => {
        starIcon.addEventListener('click', async function(e) {
            e.stopPropagation();
            
            const rutaId = parseInt(this.dataset.rutaId);
            const success = await eliminarRutaFavorita(rutaId);
            
            if (success) {
                // Efecto visual
                this.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
                
                // Volver a cargar favoritas
                setTimeout(() => {
                    renderizarRutasFavoritas();
                }, 300);
                
                console.log('Removido de favoritos');
            } else {
                alert('Error al quitar de favoritos. Inténtalo de nuevo.');
            }
        });
    });
}

// Configurar eventos para todas las rutas
function configurarEventosRutas() {
    document.querySelectorAll('#rutas-content .star-icon').forEach(starIcon => {
        starIcon.addEventListener('click', async function(e) {
            e.stopPropagation();
            
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
                    console.log('Removido de favoritos');
                }
            } else {
                // Agregar a favoritos
                success = await agregarRutaFavorita(rutaId);
                if (success) {
                    this.classList.remove('bi-star');
                    this.classList.add('bi-star-fill', 'favorito');
                    this.title = 'Quitar de favoritos';
                    console.log('Agregado a favoritos');
                }
            }
            
            if (success) {
                // Efecto visual
                this.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
            } else {
                alert('Error al actualizar favoritos. Inténtalo de nuevo.');
            }
        });
    });
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
    
    // Cargar datos iniciales
    await Promise.all([
        renderizarRutasFavoritas(),
        renderizarTodasLasRutas()
    ]);
    
    console.log('API integrada correctamente');
}

// ========== EVENTOS DE NAVEGACIÓN ==========

// Escuchar clicks en el menú
document.addEventListener('DOMContentLoaded', function() {
    // Evento para abrir favoritos
    const favoritosButton = document.querySelector('#favoritos-trigger');
    if (favoritosButton) {
        favoritosButton.addEventListener('click', async function(e) {
            e.preventDefault();
            // Recargar favoritas cada vez que se abra el panel
            await renderizarRutasFavoritas();
            // El resto del código original para mostrar el panel se mantiene
        });
    }

    // Evento para abrir rutas
    const rutasButton = document.querySelector('#rutas-trigger');
    if (rutasButton) {
        rutasButton.addEventListener('click', async function(e) {
            e.preventDefault();
            // Recargar rutas cada vez que se abra el panel
            await renderizarTodasLasRutas();
            // El resto del código original para mostrar el panel se mantiene
        });
    }

    // Inicializar la API cuando se carga la página
    inicializarAPI();
});

// ========== FUNCIONES DE UTILIDAD ==========

// Función para obtener tiempos de espera (simulada por ahora)
function obtenerTiempoEspera(rutaId) {
    // Aquí podrías integrar con el endpoint de tiempos si existe
    const tiempos = [5, 8, 12, 15, 18, 20];
    return tiempos[Math.floor(Math.random() * tiempos.length)];
}

// Función para actualizar tiempos de espera
function actualizarTiemposEspera() {
    document.querySelectorAll('.ruta-tiempo span').forEach(span => {
        if (span.textContent === 'Cargando tiempo...') {
            const tiempo = obtenerTiempoEspera();
            span.textContent = `Espera: ${tiempo} min`;
        }
    });
}

// Actualizar tiempos cada 30 segundos
setInterval(actualizarTiemposEspera, 30000);

// ========== FUNCIONES ADICIONALES PARA LA INTEGRACIÓN ==========

// Sistema de notificaciones toast
function mostrarToast(mensaje, tipo = 'info', duracion = 3000) {
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
            document.body.removeChild(toast);
        }, 300);
    }, duracion);
}

// Indicador de estado de conexión
function mostrarEstadoConexion() {
    const statusElement = document.createElement('div');
    statusElement.className = 'connection-status connecting';
    statusElement.textContent = 'Conectando...';
    document.body.appendChild(statusElement);
    
    return {
        setOnline: () => {
            statusElement.className = 'connection-status online';
            statusElement.textContent = 'Conectado';
            setTimeout(() => {
                if (statusElement.parentNode) {
                    document.body.removeChild(statusElement);
                }
            }, 2000);
        },
        setOffline: () => {
            statusElement.className = 'connection-status offline';
            statusElement.textContent = 'Sin conexión';
        },
        setError: () => {
            statusElement.className = 'connection-status offline';
            statusElement.textContent = 'Error de conexión';
        },
        remove: () => {
            if (statusElement.parentNode) {
                document.body.removeChild(statusElement);
            }
        }
    };
}

// Cache simple para optimizar las consultas
class RutasCache {
    constructor() {
        this.cache = new Map();
        this.timeout = 5 * 60 * 1000; // 5 minutos
    }
    
    set(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.timeout) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }
    
    clear() {
        this.cache.clear();
    }
}

const cache = new RutasCache();

// Función mejorada para obtener rutas con cache
async function obtenerTodasLasRutasConCache() {
    const cacheKey = 'todas_las_rutas';
    const cached = cache.get(cacheKey);
    
    if (cached) {
        return cached;
    }
    
    const rutas = await obtenerTodasLasRutas();
    cache.set(cacheKey, rutas);
    return rutas;
}

// Función mejorada para obtener favoritas con cache
async function obtenerRutasFavoritasConCache() {
    const cacheKey = `favoritas_usuario_${USUARIO_ID}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
        return cached;
    }
    
    const favoritas = await obtenerRutasFavoritas();
    cache.set(cacheKey, favoritas);
    return favoritas;
}

// Función para invalidar cache cuando se modifican favoritos
function invalidarCacheFavoritas() {
    cache.cache.delete(`favoritas_usuario_${USUARIO_ID}`);
}

// Sistema de actualización automática
class AutoRefresh {
    constructor(intervalo = 60000) { // 1 minuto por defecto
        this.intervalo = intervalo;
        this.intervalId = null;
        this.activo = false;
    }
    
    iniciar() {
        if (this.activo) return;
        
        this.activo = true;
        this.intervalId = setInterval(async () => {
            try {
                // Limpiar cache para forzar actualización
                cache.clear();
                
                // Actualizar solo si los paneles están visibles
                const favoritosVisible = document.querySelector('#favoritos-panel').style.display !== 'none';
                const rutasVisible = document.querySelector('#rutas-panel').style.display !== 'none';
                
                if (favoritosVisible) {
                    await renderizarRutasFavoritas();
                }
                
                if (rutasVisible) {
                    await renderizarTodasLasRutas();
                }
                
                // Actualizar tiempos
                actualizarTiemposEspera();
                
            } catch (error) {
                console.error('Error en actualización automática:', error);
            }
        }, this.intervalo);
        
        console.log('Actualización automática iniciada');
    }
    
    detener() {
        if (!this.activo) return;
        
        this.activo = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        console.log('Actualización automática detenida');
    }
    
    cambiarIntervalo(nuevoIntervalo) {
        this.detener();
        this.intervalo = nuevoIntervalo;
        this.iniciar();
    }
}

const autoRefresh = new AutoRefresh();

// Función para manejar errores de red
function manejarErrorRed(error, accion = 'realizar la operación') {
    console.error(`Error al ${accion}:`, error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        mostrarToast('Sin conexión a internet', 'error');
        return 'SIN_CONEXION';
    } else if (error.message.includes('500')) {
        mostrarToast('Error del servidor, intenta más tarde', 'error');
        return 'ERROR_SERVIDOR';
    } else if (error.message.includes('404')) {
        mostrarToast('Recurso no encontrado', 'error');
        return 'NO_ENCONTRADO';
    } else {
        mostrarToast(`Error al ${accion}`, 'error');
        return 'ERROR_GENERAL';
    }
}

// Función para mostrar placeholders mientras cargan los datos
function mostrarPlaceholders(contenedor, cantidad = 3) {
    let placeholdersHTML = '';
    for (let i = 0; i < cantidad; i++) {
        placeholdersHTML += '<div class="ruta-placeholder"></div>';
    }
    contenedor.innerHTML = placeholdersHTML;
}

// Función mejorada de renderizado con manejo de errores
async function renderizarRutasFavoritasMejorado() {
    const favoritasContainer = document.querySelector('#favoritos-panel .panel-content');
    if (!favoritasContainer) return;

    const statusConexion = mostrarEstadoConexion();
    
    try {
        // Mostrar placeholders
        mostrarPlaceholders(favoritasContainer);
        
        // Obtener datos
        const [rutasFavoritas, todasLasRutas] = await Promise.all([
            obtenerRutasFavoritasConCache(),
            obtenerTodasLasRutasConCache()
        ]);
        
        statusConexion.setOnline();
        
        // Crear mapa de rutas
        const rutasMap = {};
        todasLasRutas.forEach(ruta => {
            rutasMap[ruta.idRuta] = ruta;
        });

        // Generar HTML
        let favoritasHTML = '';
        
        if (rutasFavoritas.length === 0) {
            favoritasHTML = `
                <div class="no-favoritas">
                    <p>No tienes rutas favoritas aún.</p>
                    <p>Agrega rutas desde la sección "Todas las Rutas".</p>
                </div>
            `;
        } else {
            rutasFavoritas.forEach(favorita => {
                const ruta = rutasMap[favorita.idRuta];
                if (ruta) {
                    const tiempoEspera = obtenerTiempoEspera(ruta.idRuta);
                    favoritasHTML += `
                        <div class="ruta-item fade-update" data-ruta="${ruta.idRuta}">
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
                                <span class="material-symbols-rounded action-icon report-icon" title="Reportar problema" data-ruta-id="${ruta.idRuta}">chat_info</span>
                                <i class="bi bi-star-fill action-icon star-icon favorito" title="Quitar de favoritos" data-ruta-id="${ruta.idRuta}"></i>
                            </div>
                        </div>
                    `;
                }
            });
        }

        favoritasContainer.innerHTML = favoritasHTML;
        configurarEventosFavoritos();
        
    } catch (error) {
        statusConexion.setError();
        const tipoError = manejarErrorRed(error, 'cargar rutas favoritas');
        
        let mensajeError = 'Error al cargar rutas favoritas.';
        if (tipoError === 'SIN_CONEXION') {
            mensajeError += ' <button class="btn-reload" onclick="renderizarRutasFavoritasMejorado()">Reintentar</button>';
        }
        
        favoritasContainer.innerHTML = `<div class="error-message">${mensajeError}</div>`;
    }
}

// Función mejorada para renderizar todas las rutas
async function renderizarTodasLasRutasMejorado() {
    const rutasContainer = document.querySelector('#rutas-content');
    if (!rutasContainer) return;

    const statusConexion = mostrarEstadoConexion();
    
    try {
        // Mostrar placeholders
        mostrarPlaceholders(rutasContainer, 5);
        
        // Obtener datos
        const [todasLasRutas, rutasFavoritas] = await Promise.all([
            obtenerTodasLasRutasConCache(),
            obtenerRutasFavoritasConCache()
        ]);
        
        statusConexion.setOnline();
        
        // Crear set de favoritas
        const favoritasIds = new Set(rutasFavoritas.map(fav => fav.idRuta));

        // Generar HTML
        let rutasHTML = '';
        
        if (todasLasRutas.length === 0) {
            rutasHTML = '<div class="error-message">No se encontraron rutas disponibles.</div>';
        } else {
            todasLasRutas.forEach(ruta => {
                const esFavorita = favoritasIds.has(ruta.idRuta);
                const iconoEstrella = esFavorita ? 'bi-star-fill favorito' : 'bi-star';
                const titleEstrella = esFavorita ? 'Quitar de favoritos' : 'Agregar a favoritos';
                const tiempoEspera = obtenerTiempoEspera(ruta.idRuta);

                rutasHTML += `
                    <div class="ruta-item fade-update" data-ruta="${ruta.idRuta}" data-zona="centro">
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
                            <span class="material-symbols-rounded action-icon report-icon" title="Reportar problema" data-ruta-id="${ruta.idRuta}">chat_info</span>
                            <i class="bi ${iconoEstrella} action-icon star-icon" title="${titleEstrella}" data-ruta-id="${ruta.idRuta}"></i>
                        </div>
                    </div>
                `;
            });
        }

        rutasContainer.innerHTML = rutasHTML;
        configurarEventosRutas();
        configurarBusquedaRutas();
        
    } catch (error) {
        statusConexion.setError();
        const tipoError = manejarErrorRed(error, 'cargar rutas');
        
        let mensajeError = 'Error al cargar rutas.';
        if (tipoError === 'SIN_CONEXION') {
            mensajeError += ' <button class="btn-reload" onclick="renderizarTodasLasRutasMejorado()">Reintentar</button>';
        }
        
        rutasContainer.innerHTML = `<div class="error-message">${mensajeError}</div>`;
    }
}

// Funciones mejoradas de eventos con feedback visual
async function agregarFavoritoMejorado(rutaId, elemento) {
    elemento.classList.add('updating');
    
    try {
        const success = await agregarRutaFavorita(rutaId);
        
        if (success) {
            elemento.classList.remove('bi-star');
            elemento.classList.add('bi-star-fill', 'favorito');
            elemento.title = 'Quitar de favoritos';
            
            invalidarCacheFavoritas();
            mostrarToast('Ruta agregada a favoritos', 'success');
            
            // Efecto visual
            elemento.style.transform = 'scale(1.3)';
            setTimeout(() => {
                elemento.style.transform = 'scale(1)';
            }, 200);
            
        } else {
            mostrarToast('Error al agregar a favoritos', 'error');
        }
    } catch (error) {
        manejarErrorRed(error, 'agregar a favoritos');
    } finally {
        elemento.classList.remove('updating');
    }
}

async function eliminarFavoritoMejorado(rutaId, elemento) {
    elemento.classList.add('updating');
    
    try {
        const success = await eliminarRutaFavorita(rutaId);
        
        if (success) {
            elemento.classList.remove('bi-star-fill', 'favorito');
            elemento.classList.add('bi-star');
            elemento.title = 'Agregar a favoritos';
            
            invalidarCacheFavoritas();
            mostrarToast('Ruta removida de favoritos', 'success');
            
            // Efecto visual
            elemento.style.transform = 'scale(1.3)';
            setTimeout(() => {
                elemento.style.transform = 'scale(1)';
            }, 200);
            
        } else {
            mostrarToast('Error al quitar de favoritos', 'error');
        }
    } catch (error) {
        manejarErrorRed(error, 'quitar de favoritos');
    } finally {
        elemento.classList.remove('updating');
    }
}

// Función para configurar el auto-refresh al cargar la página
function configurarAutoRefresh() {
    // Iniciar auto-refresh solo cuando hay paneles abiertos
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.style.display !== 'none') {
                autoRefresh.iniciar();
            } else {
                // Detener si no hay paneles visibles
                const favoritosVisible = document.querySelector('#favoritos-panel').style.display !== 'none';
                const rutasVisible = document.querySelector('#rutas-panel').style.display !== 'none';
                
                if (!favoritosVisible && !rutasVisible) {
                    autoRefresh.detener();
                }
            }
        });
    });
    
    observer.observe(document.querySelector('#favoritos-panel'), { 
        attributes: true, 
        attributeFilter: ['style'] 
    });
    
    observer.observe(document.querySelector('#rutas-panel'), { 
        attributes: true, 
        attributeFilter: ['style'] 
    });
}

// Función para inicializar todas las mejoras
function inicializarMejoras() {
    configurarAutoRefresh();
    
    // Configurar eventos de visibilidad de página
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            autoRefresh.detener();
        } else {
            // Reactivar si hay paneles visibles
            const favoritosVisible = document.querySelector('#favoritos-panel').style.display !== 'none';
            const rutasVisible = document.querySelector('#rutas-panel').style.display !== 'none';
            
            if (favoritasVisible || rutasVisible) {
                autoRefresh.iniciar();
            }
        }
    });
    
    console.log('Mejoras de API inicializadas');
}
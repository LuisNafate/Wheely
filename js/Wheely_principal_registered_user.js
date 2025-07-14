   const sidebar = document.querySelector('.sidebar');
const sidebarToggleBtn = document.querySelector('.sidebar-toggle');

// Elementos del panel de favoritos
const favoritosPanel = document.getElementById('favoritos-panel');
const favoritosOverlay = document.getElementById('favoritos-overlay');
const favoritosTrigger = document.getElementById('favoritos-trigger');
const closeFavoritos = document.getElementById('close-favoritos');

// Elementos del panel de rutas
const rutasPanel = document.getElementById('rutas-panel');
const rutasOverlay = document.getElementById('rutas-overlay');
const rutasTrigger = document.getElementById('rutas-trigger');
const closeRutas = document.getElementById('close-rutas');
const verFavoritos = document.getElementById('ver-favoritos');

// Elementos de búsqueda y filtros
const searchBox = document.getElementById('search-rutas');
const filterTabs = document.querySelectorAll('.filter-tab');
const rutasContent = document.getElementById('rutas-content');

// Crear el overlay para móviles
const overlay = document.createElement('div');
overlay.classList.add('sidebar-overlay');
document.body.appendChild(overlay);

// Función para detectar si estamos en móvil
function isMobile() {
    return window.innerWidth <= 768;
}

// Función para manejar el toggle del sidebar
function toggleSidebar() {
    if (isMobile()) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');

        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    } else {
        sidebar.classList.toggle('collapsed');

        // Mover los paneles si están activos
        const panels = [favoritosPanel, rutasPanel];
        panels.forEach(panel => {
            if ((favoritosPanel.classList.contains('active') || rutasPanel.classList.contains('active'))) {
                if (!sidebar.classList.contains('collapsed')) {
                    panel.classList.add('panel-shifted');
                } else {
                    panel.classList.remove('panel-shifted');
                }
            }
        });
    }
}


// Función para cerrar el sidebar en móvil
function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Funciones para el panel de favoritos
function openFavoritos() {
    closeAllPanels();
    favoritosPanel.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (!sidebar.classList.contains('collapsed') && !isMobile()) {
        favoritosPanel.classList.add('panel-shifted');
    }
}


function closeFavoritosPanel() {
    favoritosPanel.classList.remove('active');
    favoritosOverlay.classList.remove('active');
    favoritosPanel.classList.remove('panel-shifted'); // ⬅️ ESTA LÍNEA NUEVA
    document.body.style.overflow = '';
}


// Funciones para el panel de rutas
function openRutas() {
    closeAllPanels();
    rutasPanel.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (!sidebar.classList.contains('collapsed') && !isMobile()) {
        rutasPanel.classList.add('panel-shifted');
    }
}


function closeRutasPanel() {
    rutasPanel.classList.remove('active');
    rutasOverlay.classList.remove('active');
    rutasPanel.classList.remove('panel-shifted'); // ⬅️ ESTA LÍNEA NUEVA
    document.body.style.overflow = '';
}

// Función para cerrar todos los paneles
function closeAllPanels() {
    favoritosPanel.classList.remove('active');
    favoritosOverlay.classList.remove('active');
    rutasPanel.classList.remove('active');
    rutasOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners principales
sidebarToggleBtn.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', closeSidebar);

// Event listeners para favoritos, lo modificque para que se cierre tambien al hacer click en el side bar
favoritosTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (favoritosPanel.classList.contains('active')) {
        closeFavoritosPanel();
    } else {
        openFavoritos();
        if (isMobile()) {
            closeSidebar();
        }
    }
});


closeFavoritos.addEventListener('click', closeFavoritosPanel);
//favoritosOverlay.addEventListener('click', closeFavoritosPanel);

// Event listeners para rutas
rutasTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (rutasPanel.classList.contains('active')) {
        closeRutasPanel();
    } else {
        openRutas();
        if (isMobile()) {
            closeSidebar();
        }
    }
});

closeRutas.addEventListener('click', closeRutasPanel);
//rutasOverlay.addEventListener('click', closeRutasPanel);

// Navegación entre paneles
verFavoritos.addEventListener('click', (e) => {
    e.preventDefault();
    openFavoritos();
});

// Funcionalidad de búsqueda
searchBox.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const rutaItems = rutasContent.querySelectorAll('.ruta-item');
    
    rutaItems.forEach(item => {
        const rutaNumber = item.querySelector('h4').textContent.toLowerCase();
        const rutaDestination = item.querySelector('p').textContent.toLowerCase();
        
        if (rutaNumber.includes(searchTerm) || rutaDestination.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});

// Funcionalidad de filtros
filterTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        // Remover clase active de todos los tabs
        filterTabs.forEach(t => t.classList.remove('active'));
        // Agregar clase active al tab clickeado
        this.classList.add('active');
        
        const filter = this.dataset.filter;
        const rutaItems = rutasContent.querySelectorAll('.ruta-item');
        
        rutaItems.forEach(item => {
            if (filter === 'todas' || item.dataset.zona === filter) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Limpiar búsqueda al cambiar filtro
        searchBox.value = '';
    });
});

// Funcionalidad de las estrellas (favoritos)
function setupStarActions() {
    document.querySelectorAll('.star-icon').forEach(star => {
        star.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const isCurrentlyFavorite = this.classList.contains('bi-star-fill');
            
            if (isCurrentlyFavorite) {
                // Quitar de favoritos
                this.classList.remove('bi-star-fill');
                this.classList.add('bi-star');
                this.classList.remove('favorito');
                console.log('Removido de favoritos');
            } else {
                // Agregar a favoritos
                this.classList.remove('bi-star');
                this.classList.add('bi-star-fill');
                this.classList.add('favorito');
                console.log('Agregado a favoritos');
            }
            
            // Efecto visual
            this.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });
}

// Funcionalidad de reportes
function setupReportActions() {
    document.querySelectorAll('.report-icon').forEach(reportIcon => {
        reportIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const rutaItem = this.closest('.ruta-item');
            const rutaNumber = rutaItem.querySelector('h4').textContent;
            const rutaDestination = rutaItem.querySelector('p').textContent;
            
            // Efecto visual
            this.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
            
            //alert(`🚨 Reportar problema en:\n\n${rutaNumber}\n${rutaDestination}\n\n¿Qué tipo de problema deseas reportar?\n• Retraso en el servicio\n• Vehículo en mal estado\n• Conductor irresponsable\n• Ruta modificada\n• Otro problema\n\n(Aquí se abriría un formulario de reporte)`);
        });
    });
}

// Funcionalidad de los items de ruta
function setupRutaItemActions() {
    document.querySelectorAll('.ruta-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // No activar si se clickeó una acción
            if (e.target.classList.contains('action-icon')) return;
            
            const rutaNombre = this.querySelector('h4').textContent;
            const rutaDireccion = this.querySelector('p').textContent;
            const rutaTiempo = this.querySelector('.ruta-tiempo span').textContent;
            
            alert(`🚌 Detalles de la ruta:\n\n${rutaNombre}\n${rutaDireccion}\n${rutaTiempo}\n\n(Aquí se mostraría información detallada de la ruta, paradas, horarios, etc.)`);
        });
    });
}

// Funcionalidad del botón agregar favorito
document.getElementById('agregar-favorito').addEventListener('click', function() {
    alert('Función para agregar nueva ruta favorita\n(Aquí se abriría un modal o formulario para buscar y agregar rutas)');
});

// Cerrar sidebar al hacer click en un enlace del menú (solo en móvil)
const menuLinks = document.querySelectorAll('.menu-link:not(#favoritos-trigger):not(#rutas-trigger)');
menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Verificar si es el link de logout
        if (link.querySelector('.menu-label')?.textContent === 'Logout') {
            e.preventDefault();
            handleLogout();
        } else if (isMobile()) {
            closeSidebar();
        }
    });
});

// Manejar cambios de tamaño de ventana
window.addEventListener('resize', () => {
    if (!isMobile()) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        sidebar.classList.remove('collapsed');
    }
});

// Manejar navegación con teclado (accesibilidad)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (rutasPanel.classList.contains('active')) {
            closeRutasPanel();
        } else if (favoritosPanel.classList.contains('active')) {
            closeFavoritosPanel();
        } else if (isMobile() && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    }
});

// Inicializar todas las funcionalidades
setupStarActions();
setupReportActions();
setupRutaItemActions();

// Soporte para gestos de swipe en móvil
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (!isMobile()) return;
    
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    // Swipe left para cerrar sidebar
    if (diff > swipeThreshold && sidebar.classList.contains('active')) {
        closeSidebar();
    }
    
    // Swipe right para abrir sidebar (solo desde el borde izquierdo)
    if (diff < -swipeThreshold && touchStartX < 30 && !sidebar.classList.contains('active')) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Inicializar mapa de Leaflet
const map = L.map('mapa-wheely').setView([16.75, -93.12], 13); // Coordenadas iniciales de Tuxtla

L.tileLayer('https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=HlXj3HeA4zNFxaXLoaHzQ3bXUvYFKru9FpGCPa8PJGPVHw2Jsb3GX6HcJ8QFp1FD', {
  attribution: '<a href="https://jawg.io" target="_blank">&copy; Jawg</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  minZoom: 0,
  maxZoom: 22
}).addTo(map);

// Ejemplo de geo jason de como se vería una ruta

// Simulamos una ruta (ejemplo de la Ruta 45)
//const ruta45GeoJSON = {
 // "type": "Feature",
  //"geometry": {
  /*  "type": "LineString",
    "coordinates": [
      [-93.118, 16.753],
      [-93.120, 16.755],
      [-93.123, 16.757],
      [-93.125, 16.759],
      [-93.127, 16.761]
    ]
  },
  "properties": {
    "nombre": "Ruta 45"
  }
};

// Creamos la capa para pintarla en el mapa
let ruta45Layer = null;

function mostrarRuta45() {
  // Elimina la capa anterior si ya existe
  if (ruta45Layer) {
    map.removeLayer(ruta45Layer);
  }

  // Añade la ruta con estilo personalizado
  ruta45Layer = L.geoJSON(ruta45GeoJSON, {
    style: {
      color: '#FB6D10',
      weight: 5
    }
 }).addTo(map);

  // Centrar el mapa sobre la ruta
  map.fitBounds(ruta45Layer.getBounds());
}

// Vinculamos la función a un evento (por ejemplo al hacer clic en una ruta)
// Ejemplo directo (puedes reemplazar esto con un listener real)
document.querySelector('[data-ruta="45"]')?.addEventListener('click', () => {
  mostrarRuta45();
});*/

// === MANEJO DE PANELES //

// Elementos generales
const overlayReporte = document.getElementById('reporte-overlay');
const panelReporte = document.getElementById('reporte-panel');
const btnCerrarReporte = document.getElementById('close-reporte');

const overlayFormulario = document.getElementById('formulario-overlay');
const panelFormulario = document.getElementById('formulario-panel');
const btnCerrarFormulario = document.getElementById('close-formulario');

const overlayNoticias = document.getElementById('noticias-overlay');
const panelNoticias = document.getElementById('noticias-panel');
const btnCerrarNoticias = document.getElementById('close-noticias');

// Botones de acciones dentro del panel inicial
const btnVerNoticias = document.getElementById('btn-ver-noticias');
const btnRealizarReporte = document.getElementById('btn-realizar-reporte');

// Abrir el panel principal desde el ícono de reporte
const botonesReportar = document.querySelectorAll('.report-icon');
botonesReportar.forEach(btn => {
  btn.addEventListener('click', () => {
    abrirPanel(overlayReporte, panelReporte);
  });
});

// Navegar a formulario
btnRealizarReporte.addEventListener('click', () => {
  cerrarPanel(overlayReporte, panelReporte);
  abrirPanel(overlayFormulario, panelFormulario);
});

// Navegar a noticias
btnVerNoticias.addEventListener('click', () => {
  cerrarPanel(overlayReporte, panelReporte);
  abrirPanel(overlayNoticias, panelNoticias);
  mostrarNoticiasEjemplo();
});

// Cierre de cada panel
btnCerrarReporte.addEventListener('click', () => cerrarPanel(overlayReporte, panelReporte));
btnCerrarFormulario.addEventListener('click', () => cerrarPanel(overlayFormulario, panelFormulario));
btnCerrarNoticias.addEventListener('click', () => cerrarPanel(overlayNoticias, panelNoticias));

function abrirPanel(overlay, panel) {
  overlay.classList.add('active');
  panel.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cerrarPanel(overlay, panel) {
  overlay.classList.remove('active');
  panel.classList.remove('active');
  document.body.style.overflow = '';
}

// Simulación de noticias, para ver el estilo que tendra la notica cuando ya loconectemos (esto se reemplazará por fetch al backend)
function mostrarNoticiasEjemplo() {
  const lista = document.getElementById('lista-noticias');
  lista.innerHTML = '';
  
  const noticiasSimuladas = [
    { tipo: 'Incidencia', mensaje: 'La combi 45 se desvió por obras el 12 de julio.' },
    { tipo: 'Sugerencia', mensaje: 'Agregar una parada frente al mercado central.' },
    { tipo: 'Incidencia', mensaje: 'El conductor iba con exceso de velocidad.' }
  ];

  noticiasSimuladas.forEach(noticia => {
    const item = document.createElement('div');
    item.classList.add('noticia-item');
    item.innerHTML = `
      <h4>${noticia.tipo}</h4>
      <p>${noticia.mensaje}</p>
    `;
    lista.appendChild(item);
  });
}

// Función para manejar el logout
function handleLogout() {
    // Mostrar confirmación antes de cerrar sesión
    const confirmLogout = confirm('¿Estás seguro de que quieres cerrar sesión?');
    
    if (confirmLogout) {
        try {
            // Limpiar datos del usuario del localStorage
            localStorage.removeItem('wheelyUser');
            
            // Limpiar cualquier otro dato de sesión que puedas tener
            localStorage.removeItem('wheelyPreferences');
            localStorage.removeItem('wheelyFavorites');
            
            // Limpiar sessionStorage también
            sessionStorage.clear();
            
            // Mostrar mensaje de confirmación (opcional)
            console.log('Sesión cerrada exitosamente');
            
            // Redirigir a la página de bienvenida
            window.location.href = 'wheely_welcome.html';
            
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            
            // Aunque haya error, redirigir de todas formas
            window.location.href = 'wheely_welcome.html';
        }
    }
}

// Función para verificar si hay una sesión activa
function checkActiveSession() {
    const userData = localStorage.getItem('wheelyUser');
    
    if (!userData) {
        // No hay sesión activa, redirigir al login
        console.log('No hay sesión activa, redirigiendo...');
        window.location.href = 'wheely_welcome.html';
        return false;
    }
    
    try {
        const user = JSON.parse(userData);
        const loginTime = user.loginTime;
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - loginTime;
        
        // Verificar si la sesión ha expirado (24 horas = 24 * 60 * 60 * 1000 ms)
        const SESSION_DURATION = 24 * 60 * 60 * 1000;
        
        if (timeDiff > SESSION_DURATION) {
            // Sesión expirada
            console.log('Sesión expirada, cerrando automáticamente...');
            localStorage.removeItem('wheelyUser');
            alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            window.location.href = 'wheely_welcome.html';
            return false;
        }
        
        // Sesión válida, actualizar información del usuario en la interfaz
        updateUserInterface(user);
        return true;
        
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        localStorage.removeItem('wheelyUser');
        window.location.href = 'wheely_welcome.html';
        return false;
    }
}

// Función para actualizar la interfaz con información del usuario
function updateUserInterface(user) {
    try {
        // Actualizar nombre del usuario en el perfil
        const nameElement = document.querySelector('.profile-info .name');
        if (nameElement && user.name) {
            nameElement.textContent = user.name;
        }
        
        // Actualizar avatar con inicial del nombre (opcional)
        const avatarElement = document.querySelector('.profile .avatar');
        if (avatarElement && user.name) {
            // Opcional: Si quieres mostrar la inicial del nombre en lugar de imagen
            // avatarElement.style.display = 'none';
            // Crear elemento con inicial...
        }
        
        console.log('Interfaz actualizada para usuario:', user.name);
        
    } catch (error) {
        console.error('Error al actualizar interfaz de usuario:', error);
    }
}

// Función para manejar la visibilidad de la página
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        // Verificar sesión cuando el usuario regresa a la página
        checkActiveSession();
    }
}

// Función para configurar event listeners de logout
function setupLogoutListeners() {
    // Buscar todos los enlaces de logout
    const logoutLinks = document.querySelectorAll('a[aria-label="Cerrar sesión"], .menu-link[aria-label="Cerrar sesión"]');
    
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            handleLogout();
        });
    });
    
    console.log('Listeners de logout configurados para', logoutLinks.length, 'elementos');
}

// Función para manejar el cierre de sesión por inactividad (opcional)
let inactivityTimer;
const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutos

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    
    inactivityTimer = setTimeout(() => {
        const confirmStayLoggedIn = confirm('Has estado inactivo por un tiempo. ¿Quieres mantener tu sesión activa?');
        
        if (!confirmStayLoggedIn) {
            handleLogout();
        } else {
            resetInactivityTimer(); // Reiniciar timer si el usuario quiere quedarse
        }
    }, INACTIVITY_TIME);
}

// Función para detectar actividad del usuario
function detectUserActivity() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
}

// Función de inicialización
function initializeUserSession() {
    console.log('Inicializando gestión de sesión de usuario...');
    
    // Verificar sesión activa al cargar la página
    if (!checkActiveSession()) {
        return; // Si no hay sesión válida, la función ya redirige
    }
    
    // Configurar listeners de logout
    setupLogoutListeners();
    
    // Configurar verificación de visibilidad de página
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Opcional: Activar timer de inactividad
    // resetInactivityTimer();
    // detectUserActivity();
    
    console.log('Gestión de sesión inicializada correctamente');
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUserSession);
} else {
    initializeUserSession();
}

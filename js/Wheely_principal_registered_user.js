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
    favoritosOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFavoritosPanel() {
    favoritosPanel.classList.remove('active');
    favoritosOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Funciones para el panel de rutas
function openRutas() {
    closeAllPanels();
    rutasPanel.classList.add('active');
    rutasOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeRutasPanel() {
    rutasPanel.classList.remove('active');
    rutasOverlay.classList.remove('active');
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

// Event listeners para favoritos
favoritosTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    openFavoritos();
    if (isMobile()) {
        closeSidebar();
    }
});

closeFavoritos.addEventListener('click', closeFavoritosPanel);
favoritosOverlay.addEventListener('click', closeFavoritosPanel);

// Event listeners para rutas
rutasTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    openRutas();
    if (isMobile()) {
        closeSidebar();
    }
});

closeRutas.addEventListener('click', closeRutasPanel);
rutasOverlay.addEventListener('click', closeRutasPanel);

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
            
            alert(`🚨 Reportar problema en:\n\n${rutaNumber}\n${rutaDestination}\n\n¿Qué tipo de problema deseas reportar?\n• Retraso en el servicio\n• Vehículo en mal estado\n• Conductor irresponsable\n• Ruta modificada\n• Otro problema\n\n(Aquí se abriría un formulario de reporte)`);
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
    link.addEventListener('click', () => {
        if (isMobile()) {
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
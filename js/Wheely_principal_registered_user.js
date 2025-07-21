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
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
  } else {
    sidebar.classList.toggle('collapsed');

    const allPanels = [
      favoritosPanel, rutasPanel,
      document.getElementById('reporte-panel'),
      document.getElementById('formulario-panel'),
      document.getElementById('noticias-panel')
    ];

    allPanels.forEach(panel => {
      if (panel.classList.contains('active')) {
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
    activarBotonMenu('favoritos-trigger');

      // Carga las rutas favoritas al abrir el panel
 renderizarRutasFavoritas();

}


function closeFavoritosPanel() {
    favoritosPanel.classList.remove('active');
    favoritosOverlay.classList.remove('active');
    favoritosPanel.classList.remove('panel-shifted'); // ⬅️ ESTA LÍNEA NUEVA
    document.body.style.overflow = '';
    activarBotonMenu('inicio-trigger');

}


// Funciones para el panel de rutas
function openRutas() {
    closeAllPanels();
    rutasPanel.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (!sidebar.classList.contains('collapsed') && !isMobile()) {
        rutasPanel.classList.add('panel-shifted');
        
    }
    activarBotonMenu('rutas-trigger');

}
 function openDetalleRuta() {
  const detallePanel = document.getElementById('detalle-ruta-panel');
  const detalleOverlay = document.getElementById('detalle-ruta-overlay');

  closeAllPanels(); // Oculta favoritos y rutas si es necesario

  detallePanel.classList.add('active');
  detalleOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Aplica desplazamiento si el sidebar está expandido en escritorio
  if (!sidebar.classList.contains('collapsed') && !isMobile()) {
    detallePanel.classList.add('panel-shifted');
  } else {
    detallePanel.classList.remove('panel-shifted');
  }
}

function closeDetalleRuta() {
  const detallePanel = document.getElementById('detalle-ruta-panel');
  const detalleOverlay = document.getElementById('detalle-ruta-overlay');

  detallePanel.classList.remove('active');
  detalleOverlay.classList.remove('active');
  detallePanel.classList.remove('panel-shifted');
  document.body.style.overflow = '';
}

function closeRutasPanel() {
    rutasPanel.classList.remove('active');
    rutasOverlay.classList.remove('active');
    rutasPanel.classList.remove('panel-shifted'); // ⬅️ ESTA LÍNEA NUEVA
    document.body.style.overflow = '';
    activarBotonMenu('inicio-trigger');

}

// Función para cerrar todos los paneles
function closeAllPanels() {
    favoritosPanel.classList.remove('active');
    favoritosOverlay.classList.remove('active');
    rutasPanel.classList.remove('active');
    rutasOverlay.classList.remove('active');

    // También cerramos detalle
    document.getElementById('detalle-ruta-panel').classList.remove('active');
    document.getElementById('detalle-ruta-overlay').classList.remove('active');
    document.getElementById('detalle-ruta-panel').classList.remove('panel-shifted');

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
        renderizarRutasFavoritas();

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
  document.querySelectorAll('.star-icon').forEach(starIcon => {
    starIcon.addEventListener('click', function (e) {
  e.stopPropagation();
  const rutaItem = this.closest('.ruta-item');
  const rutaId = parseInt(rutaItem.dataset.ruta);
  const esFavorito = this.classList.contains("favorito");

  if (esFavorito) {
    eliminarRutaFavorita(rutaId, this);
  } else {
    agregarRutaFavorita(rutaId, this);
  }
;


      // Efecto visual
      this.style.transform = 'scale(1.2)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
    });
  });
}



// Funcionalidad de reportes
function setupReportActions() {
  document.querySelectorAll('.report-icon').forEach(reportIcon => {
    reportIcon.addEventListener('click', function (e) {
      e.stopPropagation();

      const rutaItem = this.closest('.ruta-item');
      const rutaId = rutaItem.dataset.ruta;

      // Guardamos la ruta activa para noticias y reportes
      window.rutaSeleccionada = parseInt(rutaId);

      // efecto visual (opcional)
      this.style.transform = 'scale(1.3)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);

      // Abrir panel de reporte
      abrirPanel(overlayReporte, panelReporte);
    });
  });
}


// Eso es para cargar las rutas desde el baskend

function cargarRutasDesdeBackend() {
  console.log("Intentando cargar rutas desde backend...");

  fetch('http://107.21.12.104:7000/rutas')
    .then(res => {
      if (!res.ok) throw new Error("No se pudieron cargar las rutas");
      return res.json();
    })
    .then(respuesta => {
      const rutas = respuesta.data; // 👈 AQUÍ está el arreglo real
      console.log("Rutas recibidas:", rutas);

      const contenedor = document.querySelector('#rutas-panel .panel-content');
      contenedor.innerHTML = ''; // Limpiar antes

      rutas.forEach(ruta => {
        const rutaItem = document.createElement('div');
        rutaItem.classList.add('ruta-item');
        rutaItem.dataset.ruta = ruta.idRuta;
        rutaItem.dataset.origen = ruta.origen;
        rutaItem.dataset.destino = ruta.destino;

     rutaItem.innerHTML = `
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
        <span>Espera: 5 min</span>
      </div>
    </div>
  </div>
  <div class="ruta-actions">
    <span class="material-symbols-rounded action-icon report-icon" title="Reportar problema">chat_info</span>
    <i class="bi bi-star action-icon star-icon" title="Agregar a favoritos"></i>
  </div>
`;
setupStarActions();


      
rutaItem.addEventListener('click', () => {
  const id = rutaItem.dataset.ruta;
  const origen = rutaItem.dataset.origen;
  const destino = rutaItem.dataset.destino;
  const nombreRuta = ruta.nombreRuta; // Para que ya no mejale el id y solo el no,bre de la ruta

  cargarDetalleDeRuta(id, origen, destino, nombreRuta);
  

});

fetch(`http://107.21.12.104:7000/api/tiempos-ruta-periodo?idRuta=${ruta.idRuta}`)


  .then(res => res.json())
  .then(tiemposData => {
    const tiempos = tiemposData.data;

    const tiemposValidos = tiempos
      .filter(t => t.tiempoPromedio > 0)
      .map(t => t.tiempoPromedio);

    let promedio = 'N/A';
    if (tiemposValidos.length > 0) {
      const suma = tiemposValidos.reduce((a, b) => a + b, 0);
      promedio = Math.round(suma / tiemposValidos.length) + ' min';
    }

    // Reemplazar el texto en el DOM
    const esperaEl = rutaItem.querySelector('.ruta-tiempo span');
    if (esperaEl) {
      esperaEl.textContent = `Espera: ${promedio}`;
    }
  })
  .catch(err => {
    console.warn(`No se pudieron cargar los tiempos para la ruta ${ruta.idRuta}`, err);
  });
  

contenedor.appendChild(rutaItem);

   setupStarActions();
setupReportActions();
      });
    })
    .catch(err => {
      console.error("Error cargando rutas:", err);
      alert("No se pudieron cargar las rutas.");
    });
}
// para la estrellita de favoritos
function marcarFavoritosEnRutas(favoritas) {
  document.querySelectorAll('.ruta-item').forEach(item => {
    const rutaId = parseInt(item.dataset.ruta);
    const starIcon = item.querySelector('.star-icon');

    const esFavorita = favoritas.some(f => f.idRuta === rutaId);

    if (esFavorita) {
      starIcon.classList.add('bi-star-fill');
      starIcon.classList.remove('bi-star');
      starIcon.classList.add('favorito');
    } else {
      starIcon.classList.remove('bi-star-fill');
      starIcon.classList.add('bi-star');
      starIcon.classList.remove('favorito');
    }
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
            
           // alert(`🚌 Detalles de la ruta:\n\n${rutaNombre}\n${rutaDireccion}\n${rutaTiempo}\n\n(Aquí se mostraría información detallada de la ruta, paradas, horarios, etc.)`);
        });
    });
}

// Funcionalidad del botón agregar favorito
document.getElementById('agregar-favorito').addEventListener('click', function() {
    closeFavoritosPanel(); // Cerramos el panel actual
    openRutas();           // Abrimos el panel de rutas

    // este me enfocar automáticamente el buscador
    document.getElementById('search-rutas').focus();
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
cargarRutasDesdeBackend();

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
//Para que me aparezca el panel de favoritos al cargar la página
async function renderizarRutasFavoritas() {
  const panel = document.querySelector('#favoritos-panel .panel-content');
  panel.innerHTML = ''; // limpiar contenido

  const user = JSON.parse(localStorage.getItem('wheelyUser'));
  if (!user) return;

  try {
    const [rutasRes, favsRes] = await Promise.all([
      fetch('http://107.21.12.104:7000/rutas').then(r => r.json()),
      fetch(`http://107.21.12.104:7000/usuarios/${user.id}/rutas-favoritas`).then(r => r.json())
    ]);

    const rutas = rutasRes.data;
    const favoritas = favsRes.data;

    favoritas.forEach(async fav => {
      const ruta = rutas.find(r => r.idRuta === fav.idRuta);
      if (!ruta) return;

      const rutaItem = document.createElement('div');
      rutaItem.classList.add('ruta-item');
      rutaItem.dataset.ruta = ruta.idRuta;

      rutaItem.innerHTML = `
        <div class="ruta-info">
          <div class="ruta-icon"><i class="bi bi-bus-front-fill"></i></div>
          <div class="ruta-details">
            <h4>${ruta.nombreRuta}</h4>
            <p><strong>Origen:</strong> ${ruta.origen}</p>
            <p><strong>Destino:</strong> ${ruta.destino}</p>
            <div class="ruta-tiempo">
              <i class="bi bi-clock"></i>
              <span>Espera: Cargando...</span>
            </div>
          </div>
        </div>
        <div class="ruta-actions">
          <span class="material-symbols-rounded action-icon report-icon" title="Reportar problema">chat_info</span>
          <i class="bi bi-star-fill action-icon star-icon favorito" title="Quitar de favoritos"></i>
        </div>
      `;

      // Cargar tiempos reales
      try {
        const tiemposRes = await fetch(`http://107.21.12.104:7000/api/tiempos-ruta-periodo?idRuta=${ruta.idRuta}`);
        const tiemposData = await tiemposRes.json();

        const tiempos = tiemposData.data;
        const proms = tiempos.map(t => t.tiempoPromedio).filter(t => t > 0);
        const esperaProm = proms.length ? Math.round(proms.reduce((a, b) => a + b) / proms.length) + ' min' : 'N/A';

        rutaItem.querySelector('.ruta-tiempo span').textContent = `Espera: ${esperaProm}`;
      } catch (err) {
        rutaItem.querySelector('.ruta-tiempo span').textContent = 'Espera: N/A';
        console.warn(`Error cargando tiempo de ruta ${ruta.idRuta}`, err);
      }

      rutaItem.addEventListener('click', () => {
        cargarDetalleDeRuta(ruta.idRuta);
      });

      panel.appendChild(rutaItem);
    });

    // sincroniza estrellas en rutas generales
    marcarFavoritosEnRutas(favoritas);
    setupStarActions();
    setupReportActions();
  } catch (err) {
    console.error("Error al renderizar favoritos:", err);
  }
}


// Inicializar mapa de Leaflet
const map = L.map('mapa-wheely').setView([16.75, -93.12], 13); // Coordenadas iniciales de Tuxtla

L.tileLayer('https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=HlXj3HeA4zNFxaXLoaHzQ3bXUvYFKru9FpGCPa8PJGPVHw2Jsb3GX6HcJ8QFp1FD', {
  attribution: '<a href="https://jawg.io" target="_blank">&copy; Jawg</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  minZoom: 0,
  maxZoom: 22
}).addTo(map);

// --- INICIO GESTIÓN DE FAVORITOS CON BACKEND ---

function obtenerUsuarioActual() {
  const user = JSON.parse(localStorage.getItem('wheelyUser'));
  return user?.id || null;  // ✅ usa 'id' en lugar de 'idUsuario'
}

function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('visible');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


function agregarRutaFavorita(rutaId, starIcon) {
  const user = JSON.parse(localStorage.getItem('wheelyUser'));
  const API_BASE_URL = 'http://107.21.12.104:7000';

  fetch(`${API_BASE_URL}/usuarios/${user.id}/rutas-favoritas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rutaId })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        starIcon.classList.add("favorito");
        mostrarToast("Ruta agregada a favoritos");
        renderizarRutasFavoritas();
      } else {
        mostrarToast("No se pudo agregar a favoritos");
      }
    })
    .catch(err => {
      console.error("Error al agregar a favoritos:", err);
      mostrarToast("Error al agregar a favoritos");
    });
}

function eliminarRutaFavorita(rutaId, starIcon) {
  const user = JSON.parse(localStorage.getItem('wheelyUser'));
  const API_BASE_URL = 'http://107.21.12.104:7000';

  fetch(`${API_BASE_URL}/usuarios/${user.id}/rutas-favoritas/${rutaId}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        starIcon.classList.remove("favorito");
        mostrarToast("Ruta eliminada de favoritos");
        renderizarRutasFavoritas();
      } else {
        mostrarToast("No se pudo eliminar de favoritos");
      }
    })
    .catch(err => {
      console.error("Error al eliminar favorita:", err);
      mostrarToast("Error al eliminar de favoritos");
    });
}



// --- FIN GESTIÓN DE FAVORITOS CON BACKEND ---

// Esto es la nueva manera para el detaLLE de ruta   desde aqui veo todo lo del panel de detalle de ruta

let capaIda = null;
let capaRegreso = null;

function pintarRuta(geoIda, geoRegreso) {
  // Limpiar anteriores
  if (capaIda) map.removeLayer(capaIda);
  if (capaRegreso) map.removeLayer(capaRegreso);

  capaIda = L.geoJSON(geoIda, { style: { color: 'orange', weight: 4 } });
  capaRegreso = L.geoJSON(geoRegreso, { style: { color: 'dodgerblue', weight: 4 } });
}
function limpiarRutas() {
  if (capaIda) {
    map.removeLayer(capaIda);
    capaIda = null;
  }
  if (capaRegreso) {
    map.removeLayer(capaRegreso);
    capaRegreso = null;
  }
}

function mostrarSoloIda() {
  if (capaRegreso) map.removeLayer(capaRegreso);
  if (capaIda && !map.hasLayer(capaIda)) capaIda.addTo(map);
  map.fitBounds(capaIda.getBounds());
}

function mostrarSoloRegreso() {
  if (capaIda) map.removeLayer(capaIda);
  if (capaRegreso && !map.hasLayer(capaRegreso)) capaRegreso.addTo(map);
  map.fitBounds(capaRegreso.getBounds());
}

function mostrarAmbas() {
  if (capaIda && !map.hasLayer(capaIda)) capaIda.addTo(map);
  if (capaRegreso && !map.hasLayer(capaRegreso)) capaRegreso.addTo(map);

  const group = new L.featureGroup([capaIda, capaRegreso]);
  map.fitBounds(group.getBounds());
}

//Para los detalles de ruta

function cargarGeoJsonSiExiste(url) {
  return fetch(url)
    .then(res => res.ok ? res.json() : null)
    .catch(() => null);
}


function cargarDetalleDeRuta(rutaId, origenRuta, destinoRuta, nombreRuta) {

  window.rutaSeleccionada = rutaId;

 // Si lleva /api
const tiemposURL = `http://107.21.12.104:7000/api/tiempos-ruta-periodo?idRuta=${rutaId}`;

  const urlIda = `rutas/ruta${rutaId}_ida.geojson`;
  const urlRegreso = `rutas/ruta${rutaId}_vuelta.geojson`;

  console.log(`[Ruta ${rutaId}] Cargando detalle...`);
  console.log(`Origen: ${origenRuta}, Destino: ${destinoRuta}`);

  fetch(tiemposURL)
    .then(res => {
      if (!res.ok) throw new Error("No se pudo obtener tiempos");
      return res.json();
    })
    .then(tiemposData => {
      const tiemposPorPeriodo = {
        manana: 'N/A',
        tarde: 'N/A',
        noche: 'N/A'
      };

      if (Array.isArray(tiemposData.data)) {
        tiemposData.data.forEach(item => {
          if (item.idPeriodo === 1) tiemposPorPeriodo.manana = item.tiempoPromedio + ' min';
          if (item.idPeriodo === 2) tiemposPorPeriodo.tarde = item.tiempoPromedio + ' min';
          if (item.idPeriodo === 3) tiemposPorPeriodo.noche = item.tiempoPromedio + ' min';
        });
      }
mostrarDetalleRuta({
  nombre: nombreRuta || `Ruta ${rutaId}`,
  origen: origenRuta || 'Origen desconocido',
  destino: destinoRuta || 'Destino desconocido',
  espera: calcularPromedio(tiemposPorPeriodo),
  ...tiemposPorPeriodo
});


      return Promise.all([
        cargarGeoJsonSiExiste(urlIda),
        cargarGeoJsonSiExiste(urlRegreso)
      ]);
    })
    .then(([geoIda, geoRegreso]) => {
      console.log("GeoJSON cargado:", { geoIda, geoRegreso });

      if (geoIda || geoRegreso) {
        pintarRuta(geoIda, geoRegreso);
        if (geoIda && geoRegreso) {
          mostrarAmbas();
        } else if (geoIda) {
          mostrarSoloIda();
        } else {
          mostrarSoloRegreso();
        }
      } else {
        mostrarToast("Esta ruta aún no tiene GeoJSON disponible", "info");
      }
    })
    .catch(err => {
      console.error("❌ Error real detectado:", err);
      mostrarToast("No se pudo cargar completamente la información de la ruta", "error");
    });
}


let origenActual = "";
let destinoActual = "";
let direccionInvertida = false;

// Función para mostrar el detalle de la ruta
function mostrarDetalleRuta(data) {
  document.getElementById('detalle-ruta-nombre').textContent = data.nombre;
  document.getElementById('detalle-direccion').textContent = `Origen: ${data.origen} → Destino: ${data.destino}`;
  origenActual = data.origen;
  destinoActual = data.destino;


  document.getElementById('detalle-tiempo').textContent = `Espera promedio: ${data.espera}`;
  document.getElementById('detalle-manana').textContent = `Mañana: ${data.manana}`;
  document.getElementById('detalle-tarde').textContent = `Tarde: ${data.tarde}`;
  document.getElementById('detalle-noche').textContent = `Noche: ${data.noche}`;


  mostrandoIda = true; // o false si prefieres comenzar con regreso
  // Mostrar panel


 openDetalleRuta(); // ⬅️ este se encarga de mostrar y ajustar

}

function alternarOrigenDestino() {
  direccionInvertida = !direccionInvertida;

  const origen = direccionInvertida ? destinoActual : origenActual;
  const destino = direccionInvertida ? origenActual : destinoActual;

  const direccionTexto = `Origen: ${origen} → Destino: ${destino}`;
  document.getElementById('detalle-direccion').textContent = direccionTexto;
}

/*const geojsonPorRuta = {
  "45": {
    ida: {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-93.118, 16.753],
          [-93.120, 16.755],
          [-93.123, 16.757]
        ]
      }
    },
    regreso: {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-93.123, 16.757],
          [-93.120, 16.755],
          [-93.118, 16.753]
        ]
      }
    }
  }
};*/

 closeAllPanels(); // Oculta favoritos o rutas

/*document.querySelectorAll('.ruta-item').forEach(item => {
  item.addEventListener('click', () => {
    const rutaId = item.dataset.ruta;

    // Simulación de datos para la ruta seleccionada
    const datosRuta = {
      nombre: `Ruta ${rutaId}`,
      origen:  'Parque del 5 de mayo',
      destino: 'Unach',
      espera: '8 min',
      manana: '6 min',
      tarde: '10 min',
      noche: '12 min'
    };
    


    // Supongamos que ya tienes los geojson cargados por id
    const geoIda = geojsonPorRuta[rutaId]?.ida;
    const geoRegreso = geojsonPorRuta[rutaId]?.regreso;

    pintarRuta(geoIda, geoRegreso);
    mostrarAmbas(); // Pintamos ambos de entrada
    mostrarDetalleRuta(datosRuta);

   
  });
});*/

let mostrandoIda = true; // por defecto

// funcion para alternar entre ida y regreso
function toggleDireccion() {
  if (mostrandoIda) {
    mostrarSoloRegreso();
  } else {
    mostrarSoloIda();
  }

  mostrandoIda = !mostrandoIda;
}


document.getElementById('btn-toggle-direccion').addEventListener('click', () => {
  toggleDireccion();          // esto cambia lo que se pinta en el mapa
  alternarOrigenDestino();    // esto cambia el texto de origen/destino
});

document.getElementById('btn-mostrar-ambas').addEventListener('click', mostrarAmbas);

function cerrarDetalleRuta() {
  document.getElementById('detalle-ruta-overlay').classList.remove('active');
  document.getElementById('detalle-ruta-panel').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('close-detalle-ruta').addEventListener('click', cerrarDetalleRuta);
document.getElementById('detalle-ruta-overlay').addEventListener('click', cerrarDetalleRuta);



//del nuevo chatsito
function calcularPromedio({ manana, tarde, noche }) {
  const valores = [manana, tarde, noche]
    .filter(t => typeof t === 'string' && t.includes('min'))
    .map(t => parseInt(t));

  if (valores.length === 0) return 'N/A';

  const suma = valores.reduce((a, b) => a + b, 0);
  return Math.round(suma / valores.length) + ' min';
}

// Ejemplo de geo jason de como se vería una ruta solo lo habilite en favoritos 

// Simulamos una ruta (ejemplo de la Ruta 45)
/*const ruta45GeoJSON = {
 "type": "Feature",
"geometry": {
   "type": "LineString",
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
let ruta45Layer = null;*/

/*function mostrarRuta45() {
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
  document.querySelector('[data-ruta="45"]')?.addEventListener('click', () => {
  mostrarRuta45();
  mostrarDetalleRuta({
    nombre: 'Ruta 45',
    direccion: 'Centro Histórico',
    espera: '8 min',
    manana: '6 min',
    tarde: '10 min',
    noche: '12 min'
  });
});

}

// Vinculamos la función a un evento (por ejemplo al hacer clic en una ruta)
// Ejemplo directo (puedes reemplazar esto con un listener real)
/*document.querySelector('[data-ruta="45"]')?.addEventListener('click', () => {
  mostrarRuta45();
}); 


// ELEMENTOS DEL PANEL DE DETALLE DE RUTA hola
const detalleOverlay = document.getElementById('detalle-ruta-overlay');
const detallePanel = document.getElementById('detalle-ruta-panel');
const closeDetalle = document.getElementById('close-detalle-ruta');

// Función para mostrar los datos
function mostrarDetalleRuta({ nombre, direccion, espera, manana, tarde, noche }) {
  document.getElementById('detalle-ruta-nombre').textContent = nombre;
  document.getElementById('detalle-direccion').textContent = `Dirección: ${direccion}`;
  document.getElementById('detalle-tiempo').textContent = `Espera promedio: ${espera}`;
  document.getElementById('detalle-manana').textContent = `Mañana: ${manana}`;
  document.getElementById('detalle-tarde').textContent = `Tarde: ${tarde}`;
  document.getElementById('detalle-noche').textContent = `Noche: ${noche}`;

  detalleOverlay.classList.add('active');
  detallePanel.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cerrarDetalleRuta() {
  detalleOverlay.classList.remove('active');
  detallePanel.classList.remove('active');
  document.body.style.overflow = '';
}

closeDetalle.addEventListener('click', cerrarDetalleRuta);
detalleOverlay.addEventListener('click', cerrarDetalleRuta);*/

// Ruta al archivo GeoJSON
/*fetch('rutas/rutaA.geojson')
  .then(response => response.json())
  .then(data => {
    // Estilo por tipo de color en las propiedades
    const estilos = {
      "DarkOrange": "#FB6D10",
      "DodgerBlue": "#1E90FF"
    };

    // Mostrar cada feature
    L.geoJSON(data, {
      style: function(feature) {
        const color = feature?.properties?._umap_options?.color || 'gray';
        return {
          color: estilos[color] || color,
          weight: feature?.properties?._umap_options?.weight || 3
        };
      },
      onEachFeature: function(feature, layer) {
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(`<b>${feature.properties.name}</b>`);
        }
      }
    }).addTo(map);
  })
  .catch(err => {
    console.error('Error al cargar GeoJSON:', err);
  }); */


// === MANEJO DE PANELES (CON TÍTULOS DE REPORTE) === //

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

  // Usar la ruta seleccionada desde el detalle
  if (window.rutaSeleccionada) {
    cargarNoticiasDeRuta(window.rutaSeleccionada);
  } else {
    document.getElementById('lista-noticias').innerHTML = '<p>No se seleccionó ruta.</p>';
  }
});



//Para lo de enviar reporte hola
document.getElementById('enviar-reporte').addEventListener('click', () => {
  const tipo = document.getElementById('tipo-reporte').value;
  const titulo = document.getElementById('titulo-reporte').value.trim();
  const mensaje = document.getElementById('mensaje-reporte').value.trim();

  if (!titulo || !mensaje) {
    mostrarToast('Por favor llena todos los campos.', 'error');
    return;
  }

 if (!window.rutaSeleccionada) {
  mostrarToast('No se ha seleccionado ninguna ruta.', 'error');
  return;
}

  const user = JSON.parse(localStorage.getItem('wheelyUser'));
  const tipoSeleccionado = document.getElementById('tipo-reporte').value;

const usuario = JSON.parse(localStorage.getItem('wheelyUser'));
if (!usuario || !usuario.id) {
  console.error('No se encontró el ID del usuario');
  mostrarToast('No se pudo enviar el reporte (usuario no identificado).', 'error');
  return;
}



 const body = {
  idRuta: parseInt(window.rutaSeleccionada),
  idTipoReporte: parseInt(tipoSeleccionado),
  titulo,
  descripcion: mensaje, // este es el nombre que el backend espera
  idUsuario: usuario.id
};




  console.log("Enviando body:", body);

  fetch('http://localhost:7000/reportes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al enviar reporte');
      return res.json();
    })
    .then(() => {
      mostrarToast('✅ Reporte enviado con éxito');
      cerrarPanel(
        document.getElementById('formulario-overlay'),
        document.getElementById('formulario-panel')
      );
    })
    .catch(err => {
      console.error('Error al enviar reporte:', err);
      mostrarToast('❌ No se pudo enviar el reporte.', 'error');
    });
});


// Cierre de cada panel
btnCerrarReporte.addEventListener('click', () => cerrarPanel(overlayReporte, panelReporte));
btnCerrarFormulario.addEventListener('click', () => cerrarPanel(overlayFormulario, panelFormulario));
btnCerrarNoticias.addEventListener('click', () => cerrarPanel(overlayNoticias, panelNoticias));

function abrirPanel(overlay, panel) {
  overlay.classList.add('active');
  panel.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Si el sidebar está expandido y no es móvil, aplicar desplazamiento al panel
  if (!sidebar.classList.contains('collapsed') && !isMobile()) {
    panel.classList.add('panel-shifted');
  } else {
    panel.classList.remove('panel-shifted');
  }
}


function cerrarPanel(overlay, panel) {
  overlay.classList.remove('active');
  panel.classList.remove('active');
  document.body.style.overflow = '';
}

// Simulación de noticias con título
/*function mostrarNoticiasEjemplo() {
  const lista = document.getElementById('lista-noticias');
  lista.innerHTML = '';

  const noticiasSimuladas = [
    { tipo: 'Incidencia', titulo: 'Ruta desviada por obras', mensaje: 'La combi 45 se desvió el 12 de julio.' },
    { tipo: 'Sugerencia', titulo: 'Parada en el mercado', mensaje: 'Agregar una parada frente al mercado central.' },
    { tipo: 'Incidencia', titulo: 'Conducción peligrosa', mensaje: 'El conductor iba con exceso de velocidad.' }
  ];

  noticiasSimuladas.forEach(noticia => {
    const item = document.createElement('div');
    item.classList.add('noticia-item');
    item.innerHTML = `
      <h4>${noticia.tipo}</h4>
      <h3>${noticia.titulo}</h3>
      <p>${noticia.mensaje}</p>
    `;
    lista.appendChild(item);
  });
}*/
//Ver noticias reales de una ruta
function cargarNoticiasDeRuta(idRuta) {
  fetch("http://107.21.12.104:7000/reportes")
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("lista-noticias");
      lista.innerHTML = "";

      const reportes = data.data.filter(r => r.idRuta === parseInt(idRuta));

      if (reportes.length === 0) {
        lista.innerHTML = '<p>No hay noticias para esta ruta aún.</p>';
        return;
      }

      reportes.forEach(reporte => {
        const item = document.createElement("div");
        item.classList.add("noticia-item");

        item.innerHTML = `
          <h4>${reporte.tipoReporte || 'Reporte'}</h4>
          <h3>${reporte.titulo}</h3>
          <p>${reporte.descripcion}</p>
        `;

        lista.appendChild(item);
      });
    })
    .catch(err => {
      console.error("Error al cargar reportes:", err);
      document.getElementById("lista-noticias").innerHTML =
        "<p>Error al cargar las noticias.</p>";
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
// pa que se ilumnine el panel de favoritos al abrirlo
function activarBotonMenu(id) {
  // 1. Quitar la clase active de todos los enlaces del sidebar
  document.querySelectorAll('.menu-link').forEach(link => {
    link.classList.remove('active');
  });

  // 2. Agregar la clase active al botón actual
  const boton = document.getElementById(id);
  if (boton) {
    boton.classList.add('active');
  }
}
const inicioTrigger = document.getElementById('inicio-trigger');


inicioTrigger.addEventListener('click', (e) => {
  e.preventDefault();
  closeAllPanels();  
  limpiarRutas();      // Limpiar rutas del mapa
  activarBotonMenu('inicio-trigger');
});

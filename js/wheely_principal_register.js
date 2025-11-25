
// Simular usuario visitante (sin datos de sesión)
window.isVisitor = true;
window.wheelyUser = null;

// ===== FUNCIONES MOCK PARA VISITANTE =====

function obtenerUsuarioActual() {
    return null;
}

function showRegisterModal() {
    document.getElementById('register-modal').style.display = 'flex';
}

function closeRegisterModal() {
    document.getElementById('register-modal').style.display = 'none';
}

// ===== FUNCIONES DE NOTIFICACIONES =====

function mostrarToast(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    
    const colores = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colores[tipo] || colores.info};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10001;
        opacity: 0;
        transition: opacity 0.3s ease;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// ===== SOBREESCRIBIR FUNCIONES DE FAVORITOS =====

function agregarRutaFavorita(rutaId, starIcon) {
    showRegisterModal();
    return Promise.resolve(false);
}

function eliminarRutaFavorita(rutaId, starIcon) {
    showRegisterModal();
    return Promise.resolve(false);
}

function renderizarRutasFavoritas() {
    const panel = document.querySelector('#favoritos-panel .panel-content');
    if (panel) {
        panel.innerHTML = `
            <div class="blocked-function">
                <i class="bi bi-lock-fill blocked-icon"></i>
                <h3>Función Bloqueada</h3>
                <p>Los favoritos están disponibles solo para usuarios registrados.</p>
                <a href="wheely_register.html" class="btn-register-now">Registrarse Ahora</a>
            </div>
        `;
    }
}

// ===== FUNCIONES DE NOTICIAS MEJORADAS =====

window.cargarNoticiasDeRuta = function(idRuta) {
    fetch("http://98.90.108.255:7000/reportes")
        .then(res => res.json())
        .then(data => {
            const lista = document.getElementById("lista-noticias");
            lista.innerHTML = "";

            const reportes = data.data.filter(r => r.idRuta === parseInt(idRuta));

            if (reportes.length === 0) {
                lista.innerHTML = `
                    <div class="no-news-state">
                        <i class="bi bi-newspaper no-news-icon"></i>
                        <h3 class="no-news-title">Sin noticias recientes</h3>
                        <p class="no-news-text">
                            No hay reportes públicos para esta ruta en este momento.
                        </p>
                        <div class="no-news-visitor-info">
                            <div class="no-news-visitor-content">
                                <i class="bi bi-info-circle"></i>
                                <span>
                                    <strong>Visitante:</strong> Solo puedes ver noticias públicas. 
                                    <a href="wheely_register.html">Registrate</a> 
                                    para crear reportes.
                                </span>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }

            // Agregar header informativo mejorado
            const headerDiv = document.createElement("div");
            headerDiv.className = 'news-header';
            headerDiv.innerHTML = `
                <div class="news-header-content">
                    <div class="news-icon">
                        <i class="bi bi-newspaper"></i>
                    </div>
                    <div>
                        <h4 class="news-title">Noticias Públicas de la Ruta</h4>
                        <p class="news-count">
                            Mostrando ${reportes.length} reporte${reportes.length > 1 ? 's' : ''} público${reportes.length > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <div class="news-visitor-info">
                    <div class="news-visitor-content">
                        <i class="bi bi-eye"></i>
                        <span>
                            Como visitante puedes ver reportes, pero no crearlos. 
                            <a href="wheely_register.html">¡Registrate</a> 
                            para ayudar a la comunidad.
                        </span>
                    </div>
                </div>
            `;
            lista.appendChild(headerDiv);

            // Mostrar reportes con diseño mejorado
            reportes.forEach((reporte, index) => {
                const item = document.createElement("div");
                item.classList.add("noticia-item");
                item.style.animationDelay = `${index * 0.1}s`;

                // Determinar ícono según tipo de reporte
                const iconos = {
  'Incidencia': 'bi-exclamation-triangle-fill text-warning',
  'Sugerencia': 'bi-lightbulb-fill text-success',
  'Mantenimiento': 'bi-tools text-primary',
  'Accidente': 'bi-shield-fill-exclamation text-danger'
};
const iconoClass = iconos[reporte.tipoReporte] || 'bi-megaphone-fill text-info';


                item.innerHTML = `
                    <div class="news-item-content">
                        <div class="news-emoji"><i class="bi ${iconoClass}"></i></div>

                        <div class="news-text">
                            <div class="news-type-header">
                                <h4 class="news-type">${reporte.tipoReporte || 'Reporte'}</h4>
                                <span class="news-badge">PÚBLICO</span>
                            </div>
                            <h3 class="news-title-text">${reporte.titulo}</h3>
                            <p class="news-description">${reporte.descripcion}</p>
                            <div class="news-footer">
                                <small class="news-meta">
                                    Reportado por la comunidad • Solo lectura para visitantes
                                </small>
                            </div>
                        </div>
                    </div>
                `;

                lista.appendChild(item);
            });

            // Agregar footer con call-to-action
            const footerDiv = document.createElement("div");
            footerDiv.className = 'news-cta-footer';
            footerDiv.innerHTML = `
                <div class="news-cta-icon">
                    <i class="bi bi-plus-circle"></i>
                </div>
                <h4 class="news-cta-title">¿Tienes algo que reportar?</h4>
                <p class="news-cta-text">
                    Ayuda a otros usuarios reportando incidencias, sugerencias o problemas en las rutas.
                </p>
                <a href="wheely_register.html" class="news-cta-button">
                     Registrarse para Reportar
                </a>
            `;
            lista.appendChild(footerDiv);
        })
        .catch(err => {
            console.error("Error al cargar reportes:", err);
            document.getElementById("lista-noticias").innerHTML = `
                <div class="connection-error">
                    <i class="bi bi-wifi-off error-icon"></i>
                    <h3 class="error-title">Error de Conexión</h3>
                    <p class="error-text">
                        No se pudieron cargar las noticias en este momento.
                    </p>
                    <button onclick="cargarNoticiasDeRuta(${idRuta})" class="retry-button">
                        🔄 Reintentar
                    </button>
                </div>
            `;
        });
};

// ===== CONFIGURACIÓN DE LIMITACIONES PARA VISITANTE =====

function setupVisitorLimitations() {
    // Interceptar clicks en elementos que requieren registro
    document.addEventListener('click', function(e) {
        // Favoritos
        if (e.target.classList.contains('star-icon') || 
            e.target.closest('.star-icon')) {
            e.preventDefault();
            e.stopPropagation();
            showRegisterModal();
            return;
        }
        
        // Reportes bloqueados (excepto ver noticias)
        if ((e.target.classList.contains('report-icon') || 
             e.target.closest('.report-icon')) &&
            !e.target.classList.contains('allow-news')) {
            // Permitir ver noticias pero bloquear crear reportes
            // Esta lógica se maneja en setupReportActions
        }
    });

    // Sobreescribir funciones de reportes
    window.manejarReporte = function(rutaId) {
        showRegisterModal();
    };
}

// ===== MODIFICAR FUNCIONES DE ESTRELLAS Y REPORTES =====

// Modificar setupStarActions para visitante
window.setupStarActions = function() {
    document.querySelectorAll('.star-icon').forEach(starIcon => {
        starIcon.style.color = '#9ca3af';
        starIcon.style.cursor = 'not-allowed';
        starIcon.title = 'Registrate para usar favoritos';
        
        starIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            showRegisterModal();
        });
    });
};

// Modificar setupReportActions para visitante (permite ver noticias)
window.setupReportActions = function() {
    document.querySelectorAll('.report-icon').forEach(reportIcon => {
        // Apariencia igual
        reportIcon.style.color = '#3b82f6';
        reportIcon.style.cursor = 'pointer';
        reportIcon.title = 'Ver noticias o reportar (solo lectura)';

        // Limpiar eventos anteriores
        const newIcon = reportIcon.cloneNode(true);
        reportIcon.parentNode.replaceChild(newIcon, reportIcon);

        // Nuevo comportamiento de visitante (como usuario registrado)
        newIcon.addEventListener('click', function(e) {
            e.stopPropagation();

            const rutaItem = this.closest('.ruta-item');
            if (!rutaItem) return;

            const rutaId = rutaItem.dataset.ruta;
            window.rutaSeleccionada = parseInt(rutaId);

            // Abrir panel intermedio
            abrirPanel(
                document.getElementById('reporte-overlay'),
                document.getElementById('reporte-panel')
            );
        });
    });
};

document.getElementById('btn-ver-noticias')?.addEventListener('click', () => {
    cerrarPanel(
        document.getElementById('reporte-overlay'),
        document.getElementById('reporte-panel')
    );

    const noticiasOverlay = document.getElementById('noticias-overlay');
    const noticiasPanel = document.getElementById('noticias-panel');

    if (noticiasOverlay && noticiasPanel) {
        const panelTitle = noticiasPanel.querySelector('.panel-header h2');
        if (panelTitle && window.rutaSeleccionada) {
            panelTitle.innerHTML = `
  <div style="display: flex; align-items: center; gap: 10px;">
    <i class="material-symbols-rounded icono-opcion" ">campaign</i>
    <span> Noticias de la ruta ${rutaNombre}</span>
    <span style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">
      SOLO LECTURA
    </span>
  </div>
`;

        }

        noticiasOverlay.classList.add('active');
        noticiasPanel.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (window.rutaSeleccionada && typeof cargarNoticiasDeRuta === 'function') {
            cargarNoticiasDeRuta(window.rutaSeleccionada);
        }
    }
});

document.getElementById('btn-realizar-reporte')?.addEventListener('click', () => {
    cerrarPanel(
        document.getElementById('reporte-overlay'),
        document.getElementById('reporte-panel')
    );

    showRegisterModal(); // Bloqueado para visitante
});

document.getElementById('btn-realizar-reporte')?.addEventListener('click', () => {
  cerrarPanel(
    document.getElementById('reporte-overlay'),
    document.getElementById('reporte-panel')
  );

  mostrarToast('⚠️ Debes registrarte para enviar reportes', 'warning');
  showRegisterModal(); // opcional, para abrir también el modal
});

// ===== SOBREESCRIBIR CARGA DE RUTAS PARA APLICAR LIMITACIONES =====

const originalCargarRutas = window.cargarRutasDesdeBackend;

window.cargarRutasDesdeBackend = function() {
    if (originalCargarRutas) {
        originalCargarRutas.call(this);
    }

    setTimeout(() => {
        document.querySelectorAll('.star-icon').forEach(star => {
            star.classList.remove('bi-star-fill', 'favorito');
            star.classList.add('bi-star');
            star.style.color = '#9ca3af';
            star.style.cursor = 'not-allowed';
            star.title = 'Registrate para usar favoritos';
        });

        insertarInfoVisitante(); // ✅ SIEMPRE se ejecuta aquí
    }, 500);
    setTimeout(() => {
        document.querySelectorAll('.star-icon').forEach(star => {
            star.classList.remove('bi-star-fill', 'favorito');
            star.classList.add('bi-star');
            star.style.color = '#9ca3af';
            star.style.cursor = 'not-allowed';
            star.title = 'Registrate para usar favoritos';
        });
        insertarInfoVisitante();

        setupReportActions(); // ✔ necesario para habilitar el ícono de noticias
    }, 500);

};


function insertarInfoVisitante() {
    const contenedor = document.getElementById('rutas-content');

    // Evitar duplicados
    if (contenedor.querySelector('.visitor-info')) return;

    const info = document.createElement('div');
    info.className = 'visitor-info';
    info.innerHTML = `
        <div class="visitor-info-icon">
            <i class="bi bi-info-circle"></i>
        </div>
        <h4>Vista de Visitante</h4>
        <p>Puedes ver rutas y detalles, pero necesitas registrarte para favoritos y reportes</p>
        <a href="wheely_register.html" class="register-btn">Registrarse</a>
    `;
    contenedor.appendChild(info);
}



// ===== FUNCIONES DE PANELES ADAPTADAS PARA VISITANTE =====

function openFavoritos() {
    showRegisterModal();
}

function openRutas() {
    const rutasPanel = document.getElementById('rutas-panel');
    const rutasOverlay = document.getElementById('rutas-overlay');
    
    if (rutasPanel && rutasOverlay) {
        rutasPanel.classList.add('active');
        rutasOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Cargar rutas si la función existe
        if (typeof cargarRutasDesdeBackend === 'function') {
            cargarRutasDesdeBackend();
        }
    }
}

// Sobreescribir función de reportes para mostrar modal
window.abrirPanel = function(overlay, panel) {
    // ❌ Solo el formulario está completamente bloqueado para visitante
    if (panel.id === 'formulario-panel') {
        showRegisterModal();
        return;
    }

    // ✅ Permitir el panel de selección de reporte/noticias
    overlay.classList.add('active');
    panel.classList.add('active');
    document.body.style.overflow = 'hidden';
};


// ===== MEJORAR EXPERIENCIA DE NOTICIAS =====

// Interceptar función de noticias para mejorar experiencia de visitante
const originalBtnVerNoticias = document.getElementById('btn-ver-noticias');
if (originalBtnVerNoticias) {
    originalBtnVerNoticias.addEventListener('click', () => {
        // Permitir ver noticias para visitantes con experiencia mejorada
        const noticiasOverlay = document.getElementById('noticias-overlay');
        const noticiasPanel = document.getElementById('noticias-panel');
        
        if (noticiasOverlay && noticiasPanel) {
            // Personalizar título del panel para visitante
            const panelTitle = noticiasPanel.querySelector('.panel-header h2');
            if (panelTitle) {
                panelTitle.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="bi bi-newspaper" style="color: #3b82f6;"></i>
                        <span>Noticias Públicas</span>
                        <span style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">
                            SOLO LECTURA
                        </span>
                    </div>
                `;
            }
            
            noticiasOverlay.classList.add('active');
            noticiasPanel.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            if (window.rutaSeleccionada && typeof cargarNoticiasDeRuta === 'function') {
                cargarNoticiasDeRuta(window.rutaSeleccionada);
            } else {
                // Mostrar mensaje si no hay ruta seleccionada
                document.getElementById('lista-noticias').innerHTML = `
                    <div class="no-news-state">
                        <i class="bi bi-exclamation-circle no-news-icon" style="color: #f59e0b;"></i>
                        <h3 class="no-news-title">Selecciona una Ruta</h3>
                        <p class="no-news-text">
                            Para ver noticias, primero haz clic en el ícono de noticias de cualquier ruta.
                        </p>
                        <div class="no-news-visitor-info">
                            <div class="no-news-visitor-content">
                                <i class="bi bi-lightbulb"></i>
                                <span>
                                    <strong>Tip:</strong> Ve al panel de "Rutas" y haz clic en el ícono de cualquier ruta
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            mostrarToast('Panel de noticias abierto - Solo lectura para visitantes', 'info');
        }
    });
}

// ===== FUNCIONES DE MANEJO DE RUTAS =====

function setupRutaItemActions() {
    document.querySelectorAll('.ruta-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // No activar si se clickeó una acción bloqueada
            if (e.target.classList.contains('star-icon') || 
                e.target.classList.contains('report-icon')) {
                return;
            }
            
            // Permitir ver detalles de ruta
            const rutaId = this.dataset.ruta;
            const origen = this.dataset.origen;
            const destino = this.dataset.destino;
            const nombre = this.querySelector('h4').textContent;
            
            if (typeof cargarDetalleDeRuta === 'function') {
                cargarDetalleDeRuta(rutaId, origen, destino, nombre);
            }
        });
    });
}

// ===== FUNCIÓN PARA CERRAR PANELES =====

function cerrarPanel(overlay, panel) {
  if (overlay) overlay.classList.remove('active');
  if (panel) panel.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== EVENT LISTENERS PARA CERRAR PANELES =====

// Cierre de paneles por botón o clic fuera




// ===== FUNCIONES DE COMPATIBILIDAD =====

function mantenerCompatibilidad() {
    // Sobreescribir funciones de favoritos
    window.agregarRutaFavorita = function(rutaId, starIcon) {
        showRegisterModal();
        return Promise.resolve(false);
    };
    
    window.eliminarRutaFavorita = function(rutaId, starIcon) {
        showRegisterModal();
        return Promise.resolve(false);
    };
    
    // Permitir funciones de búsqueda y mapa
    // (estas se mantienen sin cambios del script principal)
}

// ===== INICIALIZACIÓN =====

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚌 Wheely - Vista de Visitante Cargada');

  setupVisitorLimitations();
  mantenerCompatibilidad();

  setTimeout(setupRutaItemActions, 1000);

  setTimeout(() => {
    if (!localStorage.getItem('visitor_welcomed')) {
      mostrarToast('👋 ¡Bienvenido! Eres visitante - registrate para más funciones', 'info');
      localStorage.setItem('visitor_welcomed', 'true');
    }
  }, 2000);

  // ✅ Asignar listeners a las ❌ de los paneles
  const paneles = ['favoritos', 'rutas', 'detalle-ruta', 'reporte', 'formulario', 'noticias'];
  paneles.forEach(nombre => {
    const overlay = document.getElementById(`${nombre}-overlay`);
    const panel = document.getElementById(`${nombre}-panel`);
    const closeBtn = document.getElementById(`close-${nombre}`);

    if (overlay && panel) {
      overlay.addEventListener('click', () => cerrarPanel(overlay, panel));
    }

    if (closeBtn && panel) {
      closeBtn.addEventListener('click', () => cerrarPanel(overlay, panel));
    }
  });

  // ✅ Listener para botón de Inicio
  const inicioTrigger = document.getElementById('inicio-trigger');
  if (inicioTrigger) {
    inicioTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      cerrarTodoAlVolverInicio();
    });
  }

});




// ===== MENSAJE FINAL DE CONFIRMACIÓN =====

setTimeout(() => {
    console.log('🎯 Sistema de visitante completamente configurado');
    console.log('📋 Funciones disponibles: Rutas, Búsqueda, Puntos, Noticias');
    console.log('🔐 Funciones bloqueadas: Favoritos, Reportes');
}, 3000);

function cerrarTodoAlVolverInicio() {
    console.log('📦 Cerrando todo al volver a inicio');
 
  // Cierra modal
  closeRegisterModal();

  // Limpia rutas pintadas
 // Quitar rutas o paradas visibles en el mapa
if (window.wheelyLayers) {
  for (const key in window.wheelyLayers) {
    const layer = window.wheelyLayers[key];
    if (layer && map && map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  }
}

if (window.layerRutas && map.hasLayer(window.layerRutas)) {
  map.removeLayer(window.layerRutas);
}
if (window.layerParadas && map.hasLayer(window.layerParadas)) {
  map.removeLayer(window.layerParadas);
}


  window.rutaSeleccionada = null;
  
}


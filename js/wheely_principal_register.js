const sidebar = document.querySelector('.sidebar');
        const sidebarToggleBtn = document.querySelector('.sidebar-toggle');
        const favoritosPanel = document.getElementById('favoritos-panel');
        const favoritosOverlay = document.getElementById('favoritos-overlay');
        const favoritosTrigger = document.getElementById('favoritos-trigger');
        const closeFavoritos = document.getElementById('close-favoritos');

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
                // En móvil, mostrar/ocultar sidebar con overlay
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
                
                // Prevenir scroll del body cuando el sidebar esté abierto
                if (sidebar.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            } else {
                // En desktop, colapsar/expandir sidebar
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
            favoritosPanel.classList.add('active');
            favoritosOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeFavoritosPanel() {
            favoritosPanel.classList.remove('active');
            favoritosOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Event listeners principales
        sidebarToggleBtn.addEventListener('click', toggleSidebar);

        // Cerrar sidebar al hacer click en el overlay
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

        // Cerrar sidebar al hacer click en un enlace del menú (solo en móvil)
        const menuLinks = document.querySelectorAll('.menu-link:not(#favoritos-trigger)');
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
                // Si cambiamos a desktop, cerrar el sidebar móvil si está abierto
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                // Si cambiamos a móvil, quitar el estado collapsed
                sidebar.classList.remove('collapsed');
            }
        });

        // Manejar navegación con teclado (accesibilidad)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (favoritosPanel.classList.contains('active')) {
                    closeFavoritosPanel();
                } else if (isMobile() && sidebar.classList.contains('active')) {
                    closeSidebar();
                }
            }
        });

        // Prevenir scroll horizontal en móvil
        document.addEventListener('touchmove', (e) => {
            if (isMobile() && sidebar.classList.contains('active')) {
                e.preventDefault();
            }
        }, { passive: false });

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

        // Funcionalidad específica del panel de favoritos
        
        // Funcionalidad de las estrellas
        document.querySelectorAll('.star-icon').forEach(star => {
            star.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Toggle entre estrella llena y vacía
                this.classList.toggle('bi-star-fill');
                this.classList.toggle('bi-star');
                
                // Efecto visual
                this.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
                
                // Si se quita de favoritos, podrías agregar lógica para eliminarlo
                if (this.classList.contains('bi-star')) {
                    console.log('Removido de favoritos');
                    // Opcional: animar la eliminación del item
                    const rutaItem = this.closest('.ruta-item');
                    rutaItem.style.opacity = '0.5';
                    setTimeout(() => {
                        rutaItem.style.opacity = '1';
                    }, 1000);
                } else {
                    console.log('Agregado a favoritos');
                }
            });
        });

        // Funcionalidad del botón agregar
        document.getElementById('agregar-favorito').addEventListener('click', function() {
            alert('Función para agregar nueva ruta favorita\n(Aquí se abriría un modal o formulario)');
        });

        

        // Funcionalidad de los items de ruta
        document.querySelectorAll('.ruta-item').forEach(item => {
            item.addEventListener('click', function(e) {
                // No activar si se clickeó la estrella
                if (e.target.classList.contains('star-icon')) return;
                
                const rutaNombre = this.querySelector('h4').textContent;
                const rutaDireccion = this.querySelector('p').textContent;
                const rutaTiempo = this.querySelector('.ruta-tiempo span').textContent;
                
                alert(`🚌 Detalles de la ruta:\n\n${rutaNombre}\n${rutaDireccion}\n${rutaTiempo}\n\n(Aquí se mostraría información detallada de la ruta)`);
            });
        });


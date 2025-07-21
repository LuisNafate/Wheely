/**
 * Wheely Search - Buscador de Direcciones Estilo Google Maps
 * Integración completa con Leaflet.Control.Geocoder y sistema de rutas
 */

(function() {
    'use strict';

    // Verificar dependencias
    if (typeof L === 'undefined') {
        console.error('Leaflet no está disponible. Asegúrate de incluir Leaflet antes de este script.');
        return;
    }

    if (typeof L.Control.Geocoder === 'undefined') {
        console.error('Leaflet.Control.Geocoder no está disponible. Incluye el plugin antes de este script.');
        return;
    }

    class WheelyGoogleMapsSearch {
        constructor() {
            this.geocoder = null;
            this.searchMarker = null;
            this.isInitialized = false;
            this.cache = new Map();
            this.currentRequest = null;
            
            this.init();
        }

        async init() {
            try {
                // Esperar que el mapa esté disponible
                await this.waitForMap();
                
                // Crear el control de geocodificación
                this.createGeocoderControl();
                
                // Agregar estilos personalizados
                this.addCustomStyles();
                
                // Integrar con la barra de búsqueda existente
                this.integrateWithExistingSearch();
                
                this.isInitialized = true;
                console.log('✅ Wheely Google Maps Search inicializado correctamente');
                
            } catch (error) {
                console.error('❌ Error inicializando Wheely Search:', error);
            }
        }

        waitForMap() {
            return new Promise((resolve) => {
                if (typeof map !== 'undefined' && map) {
                    resolve(map);
                } else {
                    const interval = setInterval(() => {
                        if (typeof map !== 'undefined' && map) {
                            clearInterval(interval);
                            resolve(map);
                        }
                    }, 100);
                }
            });
        }

        createGeocoderControl() {
            // Configurar el geocodificador con múltiples servicios
            const geocoders = [
                // Nominatim (OpenStreetMap) - Gratuito
                L.Control.Geocoder.nominatim({
                    geocodingQueryParams: {
                        countrycodes: 'mx', // Priorizar México
                        addressdetails: 1,
                        limit: 5
                    }
                }),
                // Photon (OpenStreetMap) - Alternativa gratuita
                L.Control.Geocoder.photon({
                    serviceUrl: 'https://photon.komoot.io/api/',
                    geocodingQueryParams: {
                        limit: 5,
                        lang: 'es'
                    }
                })
            ];

            // Crear el control de geocodificación
            this.geocoder = L.Control.geocoder({
                geocoder: L.Control.Geocoder.nominatim({
                    geocodingQueryParams: {
                        countrycodes: 'mx',
                        addressdetails: 1,
                        limit: 8,
                        'accept-language': 'es,en'
                    }
                }),
                defaultMarkGeocode: false, // Manejamos nosotros los marcadores
                position: 'topright',
                placeholder: 'Buscar dirección...',
                errorMessage: 'No se encontraron resultados',
                showResultIcons: true,
                suggestMinLength: 3,
                suggestTimeout: 250,
                queryMinLength: 2,
                collapsed: false, // Siempre expandido
                expand: 'click'
            });

            // Agregar al mapa
            

            // Configurar eventos
            this.setupGeocoderEvents();
        }

        setupGeocoderEvents() {
            // Evento cuando se selecciona un resultado
            this.geocoder.on('markgeocode', (e) => {
                this.handleSearchResult(e.geocode);
            });

            // Evento cuando se inicia una búsqueda
            this.geocoder.on('startgeocode', () => {
                this.showSearchingState();
            });

            // Evento cuando se completa una búsqueda
            this.geocoder.on('finishgeocode', () => {
                this.hideSearchingState();
            });

            // Evento de error
            this.geocoder.on('error', (e) => {
                this.handleSearchError(e);
            });
        }

        handleSearchResult(geocode) {
            console.log('🔍 Resultado de búsqueda:', geocode);

            // Limpiar estado anterior
            this.clearPreviousState();

            // Extraer información del resultado
            const result = {
                name: geocode.name || 'Ubicación encontrada',
                address: geocode.html || geocode.name,
                lat: geocode.center.lat,
                lng: geocode.center.lng,
                bbox: geocode.bbox
            };

            // Crear marcador de búsqueda
            this.createSearchMarker(result);

            // Ajustar vista del mapa
            this.adjustMapView(result);

            // Integrar con sistema de rutas
            this.integrateWithRouteSystem(result);

            // Mostrar información
            this.showResultInfo(result);

            // Notificar éxito
            this.showSuccessToast(result.name);
        }

        clearPreviousState() {
            // Limpiar marcador de búsqueda anterior
            if (this.searchMarker) {
                map.removeLayer(this.searchMarker);
                this.searchMarker = null;
            }

            // Limpiar estado del sistema de rutas si existe
            if (typeof window.wheelySelector !== 'undefined' && window.wheelySelector.limpiarMapaCompleto) {
                window.wheelySelector.limpiarMapaCompleto();
            }

            // Limpiar otras capas si existen funciones globales
            if (typeof window.limpiarTodasLasCapasGeoJSON === 'function') {
                window.limpiarTodasLasCapasGeoJSON();
            }
        }

        createSearchMarker(result) {
            // Crear marcador personalizado estilo Google Maps
            this.searchMarker = L.marker([result.lat, result.lng], {
                icon: L.divIcon({
                    className: 'wheely-search-marker',
                    html: `
                        <div class="search-marker-container">
                            <div class="search-marker-pin">
                                <div class="search-marker-icon">
                                    <i class="bi bi-geo-alt-fill"></i>
                                </div>
                            </div>
                            <div class="search-marker-shadow"></div>
                        </div>
                    `,
                    iconSize: [30, 40],
                    iconAnchor: [15, 40],
                    popupAnchor: [0, -40]
                }),
                draggable: true // Hacer arrastrable como solicitas
            });

            // Agregar al mapa
            this.searchMarker.addTo(map);

            // Configurar popup
            const popupContent = `
                <div class="search-result-popup">
                    <div class="popup-header">
                        <i class="bi bi-geo-alt-fill"></i>
                        <strong>${result.name}</strong>
                    </div>
                    <div class="popup-address">
                        ${result.address}
                    </div>
                    <div class="popup-actions">
                        <button onclick="window.wheelySearch.useAsStartPoint()" class="popup-btn primary">
                            <i class="bi bi-play-circle"></i> Usar como inicio
                        </button>
                        <button onclick="window.wheelySearch.findNearbyRoutes()" class="popup-btn secondary">
                            <i class="bi bi-search"></i> Buscar rutas
                        </button>
                    </div>
                </div>
            `;

            this.searchMarker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'wheely-search-popup'
            });

            // Mostrar popup automáticamente
            setTimeout(() => {
                this.searchMarker.openPopup();
            }, 500);

            // Configurar eventos del marcador
            this.setupMarkerEvents();

            // Almacenar resultado para uso posterior
            this.currentResult = result;
        }

        setupMarkerEvents() {
            if (!this.searchMarker) return;

            // Evento de arrastre
            this.searchMarker.on('dragend', () => {
                const newPos = this.searchMarker.getLatLng();
                console.log('📍 Marcador movido a:', newPos);
                
                // Actualizar resultado
                this.currentResult.lat = newPos.lat;
                this.currentResult.lng = newPos.lng;
                
                // Integrar con sistema de rutas
                this.integrateWithRouteSystem(this.currentResult);
            });

            // Evento de click
            this.searchMarker.on('click', () => {
                this.searchMarker.openPopup();
            });
        }

        adjustMapView(result) {
            if (result.bbox) {
                // Si hay bbox, usarlo para mejor encuadre
                const bounds = L.latLngBounds(
                    [result.bbox[1], result.bbox[0]], // SW
                    [result.bbox[3], result.bbox[2]]  // NE
                );
                map.fitBounds(bounds, { padding: [20, 20] });
            } else {
                // Centrar en el punto con zoom apropiado
                map.setView([result.lat, result.lng], 16);
            }
        }

        integrateWithRouteSystem(result) {
            // Integrar con el sistema de selector de puntos
            if (typeof window.wheelySelector !== 'undefined' && window.wheelySelector.agregarMarcadorDesdeBusqueda) {
                window.wheelySelector.agregarMarcadorDesdeBusqueda(
                    { lat: result.lat, lng: result.lng },
                    result.name
                );
                console.log('✅ Integrado con sistema de rutas Wheely');
            }
        }

        showResultInfo(result) {
            // Mostrar información en el panel si existe
            const infoPanel = document.getElementById('route-info-display');
            if (infoPanel) {
                const infoHTML = `
                    <div class="search-result-info">
                        <div class="result-header">
                            <i class="bi bi-geo-alt-fill"></i>
                            <h3>Ubicación encontrada</h3>
                        </div>
                        <div class="result-details">
                            <strong>${result.name}</strong><br>
                            <small>${result.address}</small>
                        </div>
                        <div class="result-coordinates">
                            <small>📍 ${result.lat.toFixed(6)}, ${result.lng.toFixed(6)}</small>
                        </div>
                    </div>
                `;
                
                if (typeof window.displayRouteInfo === 'function') {
                    window.displayRouteInfo(infoHTML);
                } else {
                    infoPanel.innerHTML = infoHTML;
                    infoPanel.style.display = 'block';
                }
            }
        }

        integrateWithExistingSearch() {
            // Integrar con la barra de búsqueda existente en el header
            const existingInput = document.getElementById('input-busqueda');
            if (existingInput) {
                // Sincronizar con el geocoder
                existingInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const query = existingInput.value.trim();
                        if (query) {
                            this.performSearch(query);
                        }
                    }
                });

                // Placeholder mejorado
                existingInput.placeholder = '🔍 Buscar direcciones, lugares, coordenadas...';
                
                console.log('✅ Integrado con barra de búsqueda existente');
            }
        }

        async performSearch(query) {
            if (!query.trim()) return;

            console.log('🔍 Buscando:', query);

            try {
                this.showSearchingState();

                // Cancelar búsqueda anterior si existe
                if (this.currentRequest) {
                    this.currentRequest.abort();
                }

                // Verificar cache
                const cacheKey = query.toLowerCase().trim();
                if (this.cache.has(cacheKey)) {
                    const cachedResult = this.cache.get(cacheKey);
                    this.handleSearchResult(cachedResult);
                    this.hideSearchingState();
                    return;
                }

                // Realizar búsqueda
                const results = await this.searchWithNominatim(query);
                
                if (results && results.length > 0) {
                    const bestResult = results[0];
                    
                    // Convertir a formato geocode
                    const geocode = {
                        name: bestResult.display_name.split(',')[0],
                        html: bestResult.display_name,
                        center: {
                            lat: parseFloat(bestResult.lat),
                            lng: parseFloat(bestResult.lon)
                        },
                        bbox: bestResult.boundingbox ? [
                            parseFloat(bestResult.boundingbox[2]), // west
                            parseFloat(bestResult.boundingbox[0]), // south
                            parseFloat(bestResult.boundingbox[3]), // east
                            parseFloat(bestResult.boundingbox[1])  // north
                        ] : null
                    };

                    // Guardar en cache
                    this.cache.set(cacheKey, geocode);

                    // Manejar resultado
                    this.handleSearchResult(geocode);
                } else {
                    this.showNoResultsMessage();
                }

            } catch (error) {
                console.error('Error en búsqueda:', error);
                this.handleSearchError(error);
            } finally {
                this.hideSearchingState();
            }
        }

        async searchWithNominatim(query) {
            // Crear múltiples consultas para mejor cobertura
            const searchQueries = [
                query,
                `${query}, Tuxtla Gutiérrez, Chiapas, México`,
                `${query}, Chiapas, México`,
                `${query}, México`
            ];

            for (const searchQuery of searchQueries) {
                try {
                    const url = `https://nominatim.openstreetmap.org/search?` +
                        `format=json&q=${encodeURIComponent(searchQuery)}&` +
                        `limit=5&addressdetails=1&countrycodes=mx&` +
                        `accept-language=es,en&bounded=0`;

                    const controller = new AbortController();
                    this.currentRequest = controller;

                    const response = await fetch(url, {
                        signal: controller.signal,
                        headers: {
                            'User-Agent': 'Wheely Maps Application'
                        }
                    });

                    if (!response.ok) continue;

                    const data = await response.json();
                    if (data && data.length > 0) {
                        return data;
                    }
                } catch (error) {
                    if (error.name === 'AbortError') {
                        console.log('Búsqueda cancelada');
                        return null;
                    }
                    continue;
                }
            }

            return null;
        }

        // Funciones de utilidad para botones del popup
        useAsStartPoint() {
            if (!this.currentResult) return;

            console.log('🎯 Usando como punto de inicio:', this.currentResult.name);
            
            // Cerrar popup
            if (this.searchMarker) {
                this.searchMarker.closePopup();
            }

            // Integrar con sistema de rutas como punto de inicio
            this.integrateWithRouteSystem(this.currentResult);

            // Mostrar toast
            this.showSuccessToast(`Punto de inicio: ${this.currentResult.name}`);
        }

        findNearbyRoutes() {
            if (!this.currentResult) return;

            console.log('🚌 Buscando rutas cercanas a:', this.currentResult.name);
            
            // Cerrar popup
            if (this.searchMarker) {
                this.searchMarker.closePopup();
            }

            // Activar búsqueda de rutas
            this.integrateWithRouteSystem(this.currentResult);

            // Mostrar toast
            this.showInfoToast('Buscando rutas de transporte cercanas...');
        }

        // Estados visuales
        showSearchingState() {
            const existingInput = document.getElementById('input-busqueda');
            if (existingInput) {
                existingInput.style.backgroundColor = '#fff3cd';
                existingInput.style.borderColor = '#ffc107';
            }
        }

        hideSearchingState() {
            const existingInput = document.getElementById('input-busqueda');
            if (existingInput) {
                existingInput.style.backgroundColor = '';
                existingInput.style.borderColor = '';
            }
        }

        showNoResultsMessage() {
            this.showErrorToast('No se encontraron resultados para tu búsqueda');
        }

        handleSearchError(error) {
            console.error('Error en búsqueda:', error);
            this.showErrorToast('Error al realizar la búsqueda. Inténtalo de nuevo.');
        }

        // Sistema de notificaciones toast
        showSuccessToast(message) {
            this.showToast(message, 'success');
        }

        showErrorToast(message) {
            this.showToast(message, 'error');
        }

        showInfoToast(message) {
            this.showToast(message, 'info');
        }

        showToast(message, type = 'info') {
            // Remover toast anterior si existe
            const existingToast = document.querySelector('.wheely-search-toast');
            if (existingToast) {
                existingToast.remove();
            }

            // Crear nuevo toast
            const toast = document.createElement('div');
            toast.className = `wheely-search-toast toast-${type}`;
            toast.innerHTML = `
                <div class="toast-content">
                    <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;

            document.body.appendChild(toast);

            // Mostrar con animación
            setTimeout(() => toast.classList.add('show'), 100);

            // Ocultar después de 3 segundos
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        addCustomStyles() {
            if (document.getElementById('wheely-search-styles')) return;

            const styles = document.createElement('style');
            styles.id = 'wheely-search-styles';
            styles.textContent = `
                /* Estilos para el control de geocodificación */
                .leaflet-control-geocoder {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    border: 1px solid #e1e5e9;
                    overflow: hidden;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .leaflet-control-geocoder-form {
                    background: white;
                    border: none;
                    border-radius: 12px;
                }

                .leaflet-control-geocoder input {
                    background: white;
                    border: none;
                    border-radius: 12px;
                    padding: 12px 16px;
                    font-size: 14px;
                    color: #333;
                    width: 280px;
                    outline: none;
                    transition: all 0.3s ease;
                }

                .leaflet-control-geocoder input:focus {
                    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.2);
                    border-color: #4285f4;
                }

                .leaflet-control-geocoder input::placeholder {
                    color: #9aa0a6;
                    font-style: italic;
                }

                .leaflet-control-geocoder-alternatives {
                    background: white;
                    border-top: 1px solid #e8eaed;
                    border-radius: 0 0 12px 12px;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .leaflet-control-geocoder-alternatives a {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f1f3f4;
                    color: #333;
                    text-decoration: none;
                    display: block;
                    transition: background-color 0.2s ease;
                    font-size: 14px;
                    line-height: 1.4;
                }

                .leaflet-control-geocoder-alternatives a:hover {
                    background-color: #f8f9fa;
                }

                .leaflet-control-geocoder-alternatives a:last-child {
                    border-bottom: none;
                }

                /* Marcador de búsqueda personalizado */
                .wheely-search-marker {
                    background: transparent;
                    border: none;
                }

                .search-marker-container {
                    position: relative;
                    width: 30px;
                    height: 40px;
                }

                .search-marker-pin {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 24px;
                    height: 32px;
                    background: linear-gradient(135deg, #4285f4, #1a73e8);
                    border-radius: 50% 50% 50% 0;
                    transform-origin: 0 70%;
                    animation: markerDrop 0.6s ease-out;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }

                .search-marker-icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                }

                .search-marker-shadow {
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 20px;
                    height: 6px;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 50%;
                    animation: shadowGrow 0.6s ease-out;
                }

                @keyframes markerDrop {
                    0% {
                        transform: translateX(-50%) translateY(-100px) rotate(30deg);
                        opacity: 0;
                    }
                    50% {
                        transform: translateX(-50%) translateY(0) rotate(-10deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(-50%) translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                }

                @keyframes shadowGrow {
                    0% {
                        transform: translateX(-50%) scale(0);
                        opacity: 0;
                    }
                    100% {
                        transform: translateX(-50%) scale(1);
                        opacity: 1;
                    }
                }

                /* Popup personalizado */
                .wheely-search-popup .leaflet-popup-content-wrapper {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                    border: 1px solid #e1e5e9;
                    padding: 0;
                }

                .wheely-search-popup .leaflet-popup-content {
                    margin: 0;
                    padding: 0;
                }

                .search-result-popup {
                    padding: 16px;
                    min-width: 250px;
                }

                .popup-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    color: #1f2937;
                    font-size: 16px;
                }

                .popup-header i {
                    color: #4285f4;
                    font-size: 18px;
                }

                .popup-address {
                    color: #6b7280;
                    font-size: 13px;
                    line-height: 1.4;
                    margin-bottom: 12px;
                }

                .popup-actions {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .popup-btn {
                    padding: 8px 12px;
                    border: none;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    flex: 1;
                    justify-content: center;
                }

                .popup-btn.primary {
                    background: #4285f4;
                    color: white;
                }

                .popup-btn.primary:hover {
                    background: #1a73e8;
                    transform: translateY(-1px);
                }

                .popup-btn.secondary {
                    background: #f8f9fa;
                    color: #5f6368;
                    border: 1px solid #dadce0;
                }

                .popup-btn.secondary:hover {
                    background: #e8f0fe;
                    color: #1a73e8;
                    border-color: #4285f4;
                }

                /* Panel de información de resultado */
                .search-result-info {
                    background: linear-gradient(135deg, #f8f9fa, #e8f0fe);
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid #e1e5e9;
                }

                .result-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                    color: #1f2937;
                }

                .result-header i {
                    color: #4285f4;
                    font-size: 20px;
                }

                .result-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .result-details {
                    margin-bottom: 8px;
                    line-height: 1.4;
                }

                .result-coordinates {
                    color: #6b7280;
                    font-family: monospace;
                }

                /* Sistema de notificaciones toast */
                .wheely-search-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                    border: 1px solid #e1e5e9;
                    padding: 16px;
                    z-index: 10000;
                    transform: translateX(100%);
                    opacity: 0;
                    transition: all 0.3s ease;
                    max-width: 350px;
                }

                .wheely-search-toast.show {
                    transform: translateX(0);
                    opacity: 1;
                }

                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #1f2937;
                    font-size: 14px;
                    font-weight: 500;
                }

                .toast-success .toast-content i {
                    color: #10b981;
                }

                .toast-error .toast-content i {
                    color: #ef4444;
                }

                .toast-info .toast-content i {
                    color: #3b82f6;
                }

                .toast-success {
                    border-left: 4px solid #10b981;
                }

                .toast-error {
                    border-left: 4px solid #ef4444;
                }

                .toast-info {
                    border-left: 4px solid #3b82f6;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .leaflet-control-geocoder input {
                        width: 220px;
                    }

                    .wheely-search-toast {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }

                    .popup-actions {
                        flex-direction: column;
                    }

                    .popup-btn {
                        flex: none;
                    }
                }
            `;

            document.head.appendChild(styles);
        }

        // Funciones de limpieza
        clearSearchMarker() {
            if (this.searchMarker) {
                map.removeLayer(this.searchMarker);
                this.searchMarker = null;
                this.currentResult = null;
            }
        }

        destroy() {
            // Limpiar marcador
            this.clearSearchMarker();

            // Remover control del mapa
            if (this.geocoder && map) {
                map.removeControl(this.geocoder);
            }

            // Limpiar cache
            this.cache.clear();

            // Cancelar request pendiente
            if (this.currentRequest) {
                this.currentRequest.abort();
            }

            console.log('🗑️ Wheely Search destruido');
        }
    }

    // Funciones globales para integración
    window.useAsStartPoint = function() {
        if (window.wheelySearch && window.wheelySearch.useAsStartPoint) {
            window.wheelySearch.useAsStartPoint();
        }
    };

    window.findNearbyRoutes = function() {
        if (window.wheelySearch && window.wheelySearch.findNearbyRoutes) {
            window.wheelySearch.findNearbyRoutes();
        }
    };

    // Función de búsqueda programática
    window.searchLocation = function(query) {
        if (window.wheelySearch && window.wheelySearch.performSearch) {
            window.wheelySearch.performSearch(query);
        }
    };

    // Función de limpieza
    window.clearSearchResults = function() {
        if (window.wheelySearch && window.wheelySearch.clearSearchMarker) {
            window.wheelySearch.clearSearchMarker();
        }
    };

    // Inicialización
    function initializeWheelSearch() {
        if (window.wheelySearch) {
            window.wheelySearch.destroy();
        }
        window.wheelySearch = new WheelyGoogleMapsSearch();
    }

    // Auto-inicialización
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWheelSearch);
    } else {
        initializeWheelSearch();
    }

    // Reinicialización global
    window.reinitializeWheelSearch = initializeWheelSearch;

})();
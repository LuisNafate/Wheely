/**
 * Wheely Selector de Puntos - Versión Final
 * Sistema para seleccionar puntos en el mapa y encontrar rutas cercanas
 * 
 * ✅ Usa estilo original del sistema
 * ✅ Evita múltiples puntos
 * ✅ Limpieza automática
 * ✅ Panel se cierra automáticamente
 */

(function() {
    'use strict';

    // Verificar que Leaflet esté disponible
    if (typeof L === 'undefined') {
        console.error('Leaflet no está disponible. Asegúrate de incluir Leaflet antes de este script.');
        return;
    }

    // Configuración del sistema
    const CONFIG = {
        MAX_DISTANCE_KM: 10,
        MAX_MARKERS: 2,
        BACKEND_URL: 'http://localhost:7000',
        ENDPOINTS: {
            rutas: '/rutas',
            rutaDetalle: '/rutas',
            rutaCoordinates: '/rutas/{id}/coordinates',
            tiemposRuta: '/api/tiempos-ruta-periodo'
        }
    };

    // ===== VERIFICAR QUE EL MAPA EXISTE =====
    function esperarMapa() {
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

    // Clase principal del selector de puntos
    class WheelySelectorPuntos {
        constructor() {
            this.marcadores = [];
            this.maxMarcadores = CONFIG.MAX_MARKERS;
            this.estaSeleccionando = false;
            this.clickTimer = null;
            this.clickDelay = 300;
            this.mapa = null;
            this.procesoActivo = false; // ✅ NUEVO: Evitar múltiples procesadores
            
            // Almacenamiento de rutas
            this.rutasCompletas = new Map();
            this.capasRutas = new Map();
            this.rutaResaltada = null;
            
            // Panel de información
            this.panelInfo = null;
            
            // Referencias a elementos para limpieza
            this.observadores = [];
            this.eventListeners = [];
        }

        async init() {
            try {
                this.mapa = await esperarMapa();
                console.log('🗺️ Mapa detectado correctamente');
                
                this.agregarEstilos();
                this.crearPanelInfo();
                this.configurarEventos();
                await this.cargarRutasDesdeBackend();
                this.observarSidebar();
                this.observarCambiosDeSeccion(); // ✅ NUEVO: Observar cambios de sección
                
                console.log('✅ Wheely Selector inicializado correctamente');
            } catch (error) {
                console.error('❌ Error inicializando Wheely Selector:', error);
            }
        }

        // ✅ NUEVO: Observar cambios de sección para limpiar automáticamente
        observarCambiosDeSeccion() {
            // Observar clicks en el sidebar
            const sidebarLinks = document.querySelectorAll('.sidebar .menu-link');
            sidebarLinks.forEach(link => {
                const listener = (e) => {
                    // Si se hace clic en cualquier otra sección, limpiar
                    const href = link.getAttribute('href');
                    if (href && href !== '#' && !href.includes('punto')) {
                        this.limpiarMapaCompleto();
                    }
                };
                link.addEventListener('click', listener);
                this.eventListeners.push({ element: link, event: 'click', listener });
            });

            // Observar cuando se abren otros paneles
            const panelTriggers = document.querySelectorAll('[id$="-trigger"]');
            panelTriggers.forEach(trigger => {
                const listener = () => {
                    // Si se abre cualquier otro panel, limpiar
                    if (trigger.id !== 'puntos-trigger') {
                        this.limpiarMapaCompleto();
                    }
                };
                trigger.addEventListener('click', listener);
                this.eventListeners.push({ element: trigger, event: 'click', listener });
            });
        }

        crearPanelInfo() {
            this.panelInfo = document.getElementById('route-info-display');
            if (!this.panelInfo) {
                const panel = document.createElement('div');
                panel.id = 'route-info-display';
                panel.style.cssText = `
                    position: fixed;
                    top: 50%px;
                    left: 270px;
                    z-index: 1000;
                    max-width: 400px;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    pointer-events: none;
                `;
                document.body.appendChild(panel);
                this.panelInfo = panel;
            }
        }

        async cargarRutasDesdeBackend() {
            try {
                console.log('🚌 Cargando rutas desde backend...');
                
                const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.rutas}`);
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                const rutas = data.data || [];
                
                console.log(`✅ ${rutas.length} rutas cargadas desde backend`);
                
                for (const ruta of rutas) {
                    await this.procesarRutaCompleta(ruta);
                }
                
                console.log(`🎯 Sistema listo: ${this.rutasCompletas.size} rutas disponibles`);
                
            } catch (error) {
                console.error('❌ Error cargando rutas desde backend:', error);
                console.log('🔄 Intentando carga de archivos GeoJSON locales...');
                await this.cargarRutasLocales();
            }
        }

        async procesarRutaCompleta(ruta) {
            try {
                const rutaId = ruta.idRuta.toString();
                
                const rutaCompleta = {
                    id: rutaId,
                    idRuta: ruta.idRuta,
                    nombre: ruta.nombreRuta || `Ruta ${rutaId}`,
                    origen: ruta.origen || 'Origen no especificado',
                    destino: ruta.destino || 'Destino no especificado',
                    descripcion: ruta.descripcion || '',
                    activa: ruta.activa !== false,
                    coordenadas: [],
                    geoJsonIda: null,
                    geoJsonRegreso: null,
                    tiempos: null,
                    mejorSentido: 'ida'
                };
                
                await Promise.all([
                    this.cargarCoordenadasRuta(rutaCompleta),
                    this.cargarGeoJsonIdaYRegreso(rutaCompleta),
                    this.cargarTiemposRuta(rutaCompleta)
                ]);
                
                if (rutaCompleta.coordenadas.length > 0 || rutaCompleta.geoJsonIda || rutaCompleta.geoJsonRegreso) {
                    this.rutasCompletas.set(rutaId, rutaCompleta);
                    this.crearCapasVisualesIdaYRegreso(rutaCompleta);
                    console.log(`✓ Ruta ${rutaCompleta.nombre} procesada`);
                }
                
            } catch (error) {
                console.error(`❌ Error procesando ruta ${ruta.idRuta}:`, error);
            }
        }

        async cargarGeoJsonIdaYRegreso(rutaCompleta) {
            const posiblesArchivos = {
                ida: [
                    `rutas/ruta${rutaCompleta.id}_ida.geojson`,
                    `rutas/ruta${rutaCompleta.id}.geojson`
                ],
                regreso: [
                    `rutas/ruta${rutaCompleta.id}_vuelta.geojson`,
                    `rutas/ruta${rutaCompleta.id}_regreso.geojson`
                ]
            };

            // Cargar ida
            for (const archivo of posiblesArchivos.ida) {
                try {
                    const response = await fetch(archivo);
                    if (response.ok) {
                        rutaCompleta.geoJsonIda = await response.json();
                        console.log(`📍 GeoJSON IDA cargado: ${archivo}`);
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }

            // Cargar regreso
            for (const archivo of posiblesArchivos.regreso) {
                try {
                    const response = await fetch(archivo);
                    if (response.ok) {
                        rutaCompleta.geoJsonRegreso = await response.json();
                        console.log(`📍 GeoJSON REGRESO cargado: ${archivo}`);
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }

            if (!rutaCompleta.geoJsonIda && !rutaCompleta.geoJsonRegreso && rutaCompleta.coordenadas.length > 0) {
                rutaCompleta.geoJsonIda = this.crearGeoJsonDesdeCoordenas(rutaCompleta.coordenadas);
            }
        }

        crearCapasVisualesIdaYRegreso(rutaCompleta) {
            if (!this.mapa) return;

            try {
                const rutaData = {
                    capaIda: null,
                    capaRegreso: null,
                    rutaCompleta: rutaCompleta,
                    estiloOriginal: {
                        color: '#FB6D10',
                        weight: 3,
                        opacity: 0.6
                    }
                };

                if (rutaCompleta.geoJsonIda) {
                    rutaData.capaIda = L.geoJSON(rutaCompleta.geoJsonIda, {
                        style: {
                            color: '#FB6D10',
                            weight: 4,
                            opacity: 0.8
                        }
                    });
                }

                if (rutaCompleta.geoJsonRegreso) {
                    rutaData.capaRegreso = L.geoJSON(rutaCompleta.geoJsonRegreso, {
                        style: {
                            color: '#1E90FF',
                            weight: 4,
                            opacity: 0.8
                        }
                    });
                }

                this.capasRutas.set(rutaCompleta.id, rutaData);

            } catch (error) {
                console.error(`Error creando capas para ruta ${rutaCompleta.id}:`, error);
            }
        }

        async cargarCoordenadasRuta(rutaCompleta) {
            try {
                const url = `${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.rutaCoordinates.replace('{id}', rutaCompleta.id)}`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    rutaCompleta.coordenadas = data.data || [];
                }
            } catch (error) {
                console.warn(`No se pudieron cargar coordenadas para ruta ${rutaCompleta.id}`);
            }
        }

        async cargarTiemposRuta(rutaCompleta) {
            try {
                const url = `${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.tiemposRuta}?idRuta=${rutaCompleta.id}`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    rutaCompleta.tiempos = this.procesarTiemposRuta(data.data || []);
                }
            } catch (error) {
                console.warn(`No se pudieron cargar tiempos para ruta ${rutaCompleta.id}`);
            }
        }

        procesarTiemposRuta(tiemposData) {
            const tiempos = {
                manana: 'N/A',
                tarde: 'N/A', 
                noche: 'N/A',
                promedio: 'N/A'
            };

            if (Array.isArray(tiemposData)) {
                const valores = [];
                
                tiemposData.forEach(item => {
                    const tiempo = `${item.tiempoPromedio} min`;
                    
                    if (item.idPeriodo === 1) tiempos.manana = tiempo;
                    if (item.idPeriodo === 2) tiempos.tarde = tiempo;
                    if (item.idPeriodo === 3) tiempos.noche = tiempo;
                    
                    valores.push(item.tiempoPromedio);
                });

                if (valores.length > 0) {
                    const promedio = Math.round(valores.reduce((a, b) => a + b, 0) / valores.length);
                    tiempos.promedio = `${promedio} min`;
                }
            }

            return tiempos;
        }

        crearGeoJsonDesdeCoordenas(coordenadas) {
            if (!coordenadas || coordenadas.length === 0) return null;

            const coordinates = coordenadas.map(coord => [
                parseFloat(coord.longitud), 
                parseFloat(coord.latitud)
            ]);

            return {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: coordinates
                },
                properties: {
                    generado: true
                }
            };
        }

        async cargarRutasLocales() {
            const archivosComunes = [
                'rutaA.geojson', 'rutaB.geojson', 'rutaC.geojson',
                'ruta1.geojson', 'ruta2.geojson', 'ruta3.geojson'
            ];

            for (const archivo of archivosComunes) {
                try {
                    const response = await fetch(`rutas/${archivo}`);
                    if (response.ok) {
                        const geoJsonData = await response.json();
                        const rutaId = archivo.replace('.geojson', '').replace('ruta', '');
                        
                        const rutaCompleta = {
                            id: rutaId,
                            nombre: `Ruta ${rutaId.toUpperCase()}`,
                            origen: 'Origen local',
                            destino: 'Destino local',
                            geoJsonIda: geoJsonData,
                            tiempos: { promedio: '8 min', manana: '6 min', tarde: '10 min', noche: '12 min' }
                        };
                        
                        this.rutasCompletas.set(rutaId, rutaCompleta);
                        this.crearCapasVisualesIdaYRegreso(rutaCompleta);
                        console.log(`✓ Ruta local ${rutaId} cargada`);
                    }
                } catch (error) {
                    continue;
                }
            }
        }

        // ===== EVENTOS =====
        
        configurarEventos() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.configurarEventosDOM());
            } else {
                this.configurarEventosDOM();
            }
        }

        configurarEventosDOM() {
            this.integrarBotonSelector();
            
            if (this.mapa) {
                const mapClickListener = (e) => this.manejarClickMapa(e);
                this.mapa.on('click', mapClickListener);
                this.eventListeners.push({ element: this.mapa, event: 'click', listener: mapClickListener });
            }
        }

        integrarBotonSelector() {
            const botonesSelector = [
                document.querySelector('[title="Marcar inicio y fin"]'),
                document.querySelector('.btn[title*="Marcar"]'),
                document.querySelector('.right-buttons .btn:first-child')
            ];
            
            const btnSelector = botonesSelector.find(btn => btn !== null);

            if (btnSelector) {
                // ✅ CAMBIO: Limpiar al activar el selector
                const listener = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Limpiar mapa antes de alternar selección
                    if (!this.estaSeleccionando) {
                        this.limpiarMapaCompleto();
                    }
                    
                    this.alternarSeleccion();
                };
                
                // Remover listener anterior si existe
                if (this.selectorClickListener) {
                    btnSelector.removeEventListener('click', this.selectorClickListener);
                }
                
                btnSelector.addEventListener('click', listener);
                this.selectorClickListener = listener;
                this.eventListeners.push({ element: btnSelector, event: 'click', listener });
                
                console.log('✓ Botón selector integrado correctamente');
            } else {
                console.warn('⚠️ No se encontró botón selector');
            }
        }

        alternarSeleccion() {
            this.estaSeleccionando = !this.estaSeleccionando;
            
            if (!this.mapa) {
                console.error('Mapa no disponible');
                return;
            }
            
            const contenedorMapa = this.mapa.getContainer();
            if (this.estaSeleccionando) {
                contenedorMapa.style.cursor = 'crosshair';
                this.mostrarInstrucciones();
            } else {
                contenedorMapa.style.cursor = '';
                this.ocultarInstrucciones();
                // ✅ CAMBIO: Limpiar al desactivar selección
                this.limpiarMapaCompleto();
            }

            this.actualizarEstadoBoton();
        }

        actualizarEstadoBoton() {
            const btnSelector = document.querySelector('[title*="Marcar"]') || 
                              document.querySelector('.right-buttons .btn:first-child');
                              
            if (btnSelector) {
                if (this.estaSeleccionando) {
                    btnSelector.classList.add('selector-activo');
                    btnSelector.style.backgroundColor = '#FB6D10';
                    btnSelector.title = 'Cancelar selección';
                } else {
                    btnSelector.classList.remove('selector-activo');
                    btnSelector.style.backgroundColor = '#1d1e22';
                    btnSelector.title = 'Marcar inicio y fin';
                }
            }
        }

        manejarClickMapa(e) {
            if (!this.estaSeleccionando || this.procesoActivo) return; // ✅ CAMBIO: Evitar múltiples procesamientos

            if (this.clickTimer) {
                clearTimeout(this.clickTimer);
                this.clickTimer = null;
                this.agregarMarcador(e.latlng, true);
            } else {
                this.clickTimer = setTimeout(() => {
                    this.clickTimer = null;
                    this.agregarMarcador(e.latlng, false);
                }, this.clickDelay);
            }
        }

        agregarMarcador(latlng, esDobleClick) {
            if (this.procesoActivo) return; // ✅ CAMBIO: Evitar múltiples marcadores
            
            if (this.marcadores.length >= this.maxMarcadores && !esDobleClick) {
                return;
            }

            this.procesoActivo = true; // ✅ CAMBIO: Activar bandera de procesamiento

            const marcador = L.marker(latlng, {
                draggable: true,
                icon: L.divIcon({
                    className: 'marcador-wheely',
                    html: `<div class="marcador-punto"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            });

            const dragListener = () => this.actualizarCalculoRutas();
            const clickListener = (e) => L.DomEvent.stopPropagation(e);
            
            marcador.on('dragend', dragListener);
            marcador.on('click', clickListener);
            
            // Almacenar listeners para limpieza posterior
            marcador._wheelyListeners = [
                { event: 'dragend', listener: dragListener },
                { event: 'click', listener: clickListener }
            ];

            if (this.mapa) {
                marcador.addTo(this.mapa);
            }
            
            this.marcadores.push(marcador);
            this.actualizarCalculoRutas();

            if (this.marcadores.length >= this.maxMarcadores) {
                this.estaSeleccionando = false;
                if (this.mapa) {
                    this.mapa.getContainer().style.cursor = '';
                }
                this.ocultarInstrucciones();
                this.actualizarEstadoBoton();
            }

            this.procesoActivo = false; // ✅ CAMBIO: Desactivar bandera de procesamiento
        }

        // ===== CÁLCULO DE RUTAS =====

        actualizarCalculoRutas() {
            if (this.marcadores.length === 0) {
                this.ocultarPanel();
                this.limpiarRutasDelMapa();
                return;
            }

            console.log(`🔍 Calculando rutas cercanas...`);

            const posicionesMarcadores = this.marcadores.map(marcador => marcador.getLatLng());
            const rutasCercanas = [];

            this.rutasCompletas.forEach((rutaCompleta, rutaId) => {
                const distancia = this.calcularDistanciaMinima(posicionesMarcadores, rutaCompleta);
                
                if (distancia <= CONFIG.MAX_DISTANCE_KM) {
                    rutasCercanas.push({
                        id: rutaId,
                        rutaCompleta: rutaCompleta,
                        distancia: distancia
                    });
                }
            });

            rutasCercanas.sort((a, b) => a.distancia - b.distancia);

            if (rutasCercanas.length > 0) {
                this.resaltarRutaCercana(rutasCercanas[0]);
                this.mostrarRutasCercanas(rutasCercanas);
            } else {
                this.limpiarRutasDelMapa();
                this.mostrarMensajeSinRutas();
            }
        }

        calcularDistanciaMinima(posicionesMarcadores, rutaCompleta) {
            if (posicionesMarcadores.length === 1) {
                return this.calcularDistanciaAUnaRuta(posicionesMarcadores[0], rutaCompleta);
            } else if (posicionesMarcadores.length === 2) {
                return this.calcularDistanciaOptimaDosMaracadores(posicionesMarcadores, rutaCompleta);
            }
            return Infinity;
        }

        calcularDistanciaAUnaRuta(posicionMarcador, rutaCompleta) {
            let distanciaMinima = Infinity;
            let mejorSentido = 'ida';

            if (rutaCompleta.coordenadas && rutaCompleta.coordenadas.length > 0) {
                rutaCompleta.coordenadas.forEach(coord => {
                    const distancia = this.calcularDistanciaHaversine(
                        posicionMarcador.lat, posicionMarcador.lng,
                        parseFloat(coord.latitud), parseFloat(coord.longitud)
                    );
                    distanciaMinima = Math.min(distanciaMinima, distancia);
                });
            } else if (rutaCompleta.geoJsonIda || rutaCompleta.geoJsonRegreso) {
                let distanciaIda = Infinity;
                let distanciaRegreso = Infinity;

                if (rutaCompleta.geoJsonIda) {
                    distanciaIda = this.calcularDistanciaConGeoJson(posicionMarcador, rutaCompleta.geoJsonIda);
                }

                if (rutaCompleta.geoJsonRegreso) {
                    distanciaRegreso = this.calcularDistanciaConGeoJson(posicionMarcador, rutaCompleta.geoJsonRegreso);
                }

                if (distanciaIda <= distanciaRegreso) {
                    distanciaMinima = distanciaIda;
                    mejorSentido = 'ida';
                } else {
                    distanciaMinima = distanciaRegreso;
                    mejorSentido = 'regreso';
                }

                rutaCompleta.mejorSentido = mejorSentido;
            }

            return distanciaMinima;
        }

        calcularDistanciaOptimaDosMaracadores(posicionesMarcadores, rutaCompleta) {
            const [marcador1, marcador2] = posicionesMarcadores;
            
            let mejorDistancia = Infinity;
            let mejorSentido = 'ida';

            if (rutaCompleta.geoJsonIda) {
                const distanciaIda = this.evaluarSentidoParaDosMaracadores(marcador1, marcador2, rutaCompleta.geoJsonIda);
                if (distanciaIda < mejorDistancia) {
                    mejorDistancia = distanciaIda;
                    mejorSentido = 'ida';
                }
            }

            if (rutaCompleta.geoJsonRegreso) {
                const distanciaRegreso = this.evaluarSentidoParaDosMaracadores(marcador1, marcador2, rutaCompleta.geoJsonRegreso);
                if (distanciaRegreso < mejorDistancia) {
                    mejorDistancia = distanciaRegreso;
                    mejorSentido = 'regreso';
                }
            }

            rutaCompleta.mejorSentido = mejorSentido;
            return mejorDistancia;
        }

        evaluarSentidoParaDosMaracadores(marcador1, marcador2, geoJsonData) {
            const coordenadas = this.extraerCoordenadasDeGeoJson(geoJsonData);
            if (coordenadas.length === 0) return Infinity;

            let mejorPunto1 = { indice: 0, distancia: Infinity };
            let mejorPunto2 = { indice: 0, distancia: Infinity };

            coordenadas.forEach((coord, indice) => {
                const dist1 = this.calcularDistanciaHaversine(marcador1.lat, marcador1.lng, coord[1], coord[0]);
                const dist2 = this.calcularDistanciaHaversine(marcador2.lat, marcador2.lng, coord[1], coord[0]);

                if (dist1 < mejorPunto1.distancia) {
                    mejorPunto1 = { indice, distancia: dist1 };
                }

                if (dist2 < mejorPunto2.distancia) {
                    mejorPunto2 = { indice, distancia: dist2 };
                }
            });

            const distanciaPromedio = (mejorPunto1.distancia + mejorPunto2.distancia) / 2;
            const factorOrden = Math.abs(mejorPunto1.indice - mejorPunto2.indice) / coordenadas.length;

            return distanciaPromedio * (0.7 + factorOrden * 0.3);
        }

        extraerCoordenadasDeGeoJson(geoJsonData) {
            let coordenadas = [];

            if (geoJsonData.type === 'Feature') {
                coordenadas = this.extraerCoordenadasDeFeature(geoJsonData);
            } else if (geoJsonData.type === 'FeatureCollection') {
                geoJsonData.features.forEach(feature => {
                    coordenadas = coordenadas.concat(this.extraerCoordenadasDeFeature(feature));
                });
            }

            return coordenadas;
        }

        extraerCoordenadasDeFeature(feature) {
            const geometry = feature.geometry;
            if (!geometry || !geometry.coordinates) return [];

            switch (geometry.type) {
                case 'LineString':
                    return geometry.coordinates;
                case 'MultiLineString':
                    return geometry.coordinates.flat();
                case 'Point':
                    return [geometry.coordinates];
                case 'Polygon':
                    return geometry.coordinates[0];
                default:
                    return [];
            }
        }

        calcularDistanciaConGeoJson(posicionMarcador, geoJsonData) {
            let distanciaMinima = Infinity;

            if (geoJsonData.type === 'Feature') {
                distanciaMinima = this.calcularDistanciaFeature(posicionMarcador, geoJsonData);
            } else if (geoJsonData.type === 'FeatureCollection') {
                geoJsonData.features.forEach(feature => {
                    const dist = this.calcularDistanciaFeature(posicionMarcador, feature);
                    distanciaMinima = Math.min(distanciaMinima, dist);
                });
            }

            return distanciaMinima;
        }

        calcularDistanciaFeature(posicionMarcador, feature) {
            let distanciaMinima = Infinity;
            const geometry = feature.geometry;

            if (!geometry || !geometry.coordinates) return Infinity;

            let coordenadas = [];

            switch (geometry.type) {
                case 'LineString':
                    coordenadas = geometry.coordinates;
                    break;
                case 'MultiLineString':
                    coordenadas = geometry.coordinates.flat();
                    break;
                case 'Point':
                    coordenadas = [geometry.coordinates];
                    break;
                case 'Polygon':
                    coordenadas = geometry.coordinates[0];
                    break;
            }

            coordenadas.forEach(coord => {
                if (Array.isArray(coord) && coord.length >= 2) {
                    const distancia = this.calcularDistanciaHaversine(
                        posicionMarcador.lat, posicionMarcador.lng,
                        coord[1], coord[0]
                    );
                    distanciaMinima = Math.min(distanciaMinima, distancia);
                }
            });

            return distanciaMinima;
        }

        calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }

        // ===== INTERFAZ DE USUARIO CON ESTILO ORIGINAL =====

        resaltarRutaCercana(rutaMasCercana) {
            this.limpiarRutasDelMapa();

            if (rutaMasCercana) {
                const rutaData = this.capasRutas.get(rutaMasCercana.id);
                if (rutaData) {
                    const rutaCompleta = rutaData.rutaCompleta;
                    const mejorSentido = rutaCompleta.mejorSentido || 'ida';

                    if (mejorSentido === 'ida' && rutaData.capaIda) {
                        rutaData.capaIda.setStyle({
                            color: '#FB6D10',
                            weight: 6,
                            opacity: 0.9
                        });
                        rutaData.capaIda.addTo(this.mapa);
                    } else if (mejorSentido === 'regreso' && rutaData.capaRegreso) {
                        rutaData.capaRegreso.setStyle({
                            color: '#FB6D10',
                            weight: 6,
                            opacity: 0.9
                        });
                        rutaData.capaRegreso.addTo(this.mapa);
                    }
                    
                    this.rutaResaltada = rutaData;
                }
            }
        }

        limpiarRutasDelMapa() {
            this.capasRutas.forEach((rutaData) => {
                if (rutaData.capaIda && this.mapa.hasLayer(rutaData.capaIda)) {
                    this.mapa.removeLayer(rutaData.capaIda);
                }
                if (rutaData.capaRegreso && this.mapa.hasLayer(rutaData.capaRegreso)) {
                    this.mapa.removeLayer(rutaData.capaRegreso);
                }
            });
        }

        // ✅ PANEL CON ESTILO ORIGINAL DEL SISTEMA EN POSICIÓN ESTÁTICA
        mostrarRutasCercanas(rutasCercanas) {
            const numMarcadores = this.marcadores.length;
            const titulo = numMarcadores === 1 ? ' Ruta Más Cercana' : ' Mejor Conexión';

            const rutaMasCercana = rutasCercanas[0];
            const textoDistancia = rutaMasCercana.distancia < 1 ? 
                `${(rutaMasCercana.distancia * 1000).toFixed(0)} m` : 
                `${rutaMasCercana.distancia.toFixed(2)} km`;

            const descripcionDistancia = numMarcadores === 1 ? 'al punto' : 'combinada';
            const tiempoEspera = rutaMasCercana.rutaCompleta.tiempos?.promedio || '8 min';
            const sentidoMostrado = rutaMasCercana.rutaCompleta.mejorSentido || 'ida';

            // ✅ PANEL ESTÁTICO AL LADO DE LA SIDEBAR COMO LOS OTROS PANELES
            let html = `
                <div class="panel-flotante panel-rutas-cercanas active" style="
                    position: fixed;
                    top: 50%;
                    left: 270px;
                    background: var(--color-bg-primary);
                    border: 1px solid var(--color-border-hr);
                    border-radius: 15px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    width: 520px;
                    max-width: calc(100vw - 290px);
                    max-height: calc(100vh - 140px);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    z-index: 1001;
                    opacity: 1;
                    visibility: visible;
                ">
                    <div class="panel-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 25px 30px 20px;
                        border-bottom: 1px solid var(--color-border-hr);
                    ">
                        <h2 style="
                            font-size: 24px;
                            font-weight: 500;
                            margin: 0;
                            color: var(--color-text-primary);
                            pointer-events: none;
                        ">${titulo}</h2>
                        <div class="panel-actions" style="display: flex; gap: 10px; align-items: center;">
                            <button class="btn-panel btn-limpiar-puntos" onclick="window.wheelySelector.limpiarMapaCompleto()" style="
                                background: #dc3545;
                                border: none;
                                color: white;
                                font-size: 16px;
                                cursor: pointer;
                                padding: 8px 16px;
                                border-radius: 6px;
                                transition: all 0.3s ease;
                                font-weight: 500;
                                pointer-events: auto;
                            ">
                                 Limpiar Puntos
                            </button>
                            <button class="btn-close" onclick="window.wheelySelector.cerrarPanelYLimpiar()" style="
                                background: none;
                                border: none;
                                color: var(--color-text-primary);
                                font-size: 24px;
                                cursor: pointer;
                                padding: 4px;
                                border-radius: 6px;
                                transition: all 0.3s ease;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: 32px;
                                height: 32px;
                                pointer-events: auto;
                            ">
                                <span class="material-symbols-rounded">close</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="panel-content" style="
                        flex: 1;
                        padding: 15px 30px 25px;
                        overflow-y: auto;
                    ">
                        <div class="ruta-item" data-ruta="${rutaMasCercana.id}" style="
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: 18px 0;
                            border-bottom: 1px solid var(--color-border-hr);
                            transition: all 0.3s ease;
                            cursor: pointer;
                        " onclick="window.wheelySelector.mostrarDetalleRutaCompleta('${rutaMasCercana.id}')">
                            <div class="ruta-info" style="display: flex; align-items: center; gap: 16px;">
                                <div class="ruta-icon" style="
                                    width: 44px;
                                    height: 44px;
                                    background: var(--color-hover-primary);
                                    border-radius: 10px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 20px;
                                    color: white;
                                    flex-shrink: 0;
                                ">
                                    <i class="bi bi-bus-front-fill"></i>
                                </div>
                                <div class="ruta-details">
                                    <h4 style="
                                        font-size: 18px;
                                        font-weight: 600;
                                        margin-bottom: 4px;
                                        color: var(--color-text-primary);
                                        line-height: 1.2;
                                    ">${rutaMasCercana.rutaCompleta.nombre}</h4>
                                    <p style="
                                        font-size: 14px;
                                        color: #a0aec0;
                                        margin: 0 0 6px 0;
                                        line-height: 1.3;
                                    "><strong>Origen:</strong> ${rutaMasCercana.rutaCompleta.origen}</p>
                                    <p style="
                                        font-size: 14px;
                                        color: #a0aec0;
                                        margin: 0 0 6px 0;
                                        line-height: 1.3;
                                    "><strong>Destino:</strong> ${rutaMasCercana.rutaCompleta.destino}</p>
                                    <div class="ruta-tiempo" style="
                                        font-size: 13px;
                                        color: #9ca3af;
                                        display: flex;
                                        align-items: center;
                                        gap: 4px;
                                        margin-bottom: 4px;
                                    ">
                                        <i class="bi bi-clock" style="font-size: 12px;"></i>
                                        <span>Espera: ${tiempoEspera}</span>
                                    </div>
                                    <div class="distancia-info" style="
                                        font-size: 13px;
                                        color: #9ca3af;
                                        display: flex;
                                        align-items: center;
                                        gap: 4px;
                                        margin-bottom: 4px;
                                    ">
                                        <i class="bi bi-geo-alt" style="font-size: 12px; color: #FB6D10;"></i>
                                        <span>Distancia ${descripcionDistancia}: ${textoDistancia}</span>
                                    </div>
                                    <div class="sentido-info" style="
                                        font-size: 13px;
                                        color: #9ca3af;
                                        display: flex;
                                        align-items: center;
                                        gap: 4px;
                                    ">
                                        <i class="bi bi-arrow-${sentidoMostrado === 'ida' ? 'right' : 'left'}-circle" style="font-size: 12px; color: #FB6D10;"></i>
                                        <span>Sentido: ${sentidoMostrado === 'ida' ? 'Ida' : 'Regreso'}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="ruta-actions" style="display: flex; gap: 12px; align-items: center;">
                                <span class="material-symbols-rounded action-icon report-icon" onclick="event.stopPropagation(); window.wheelySelector.manejarReporte('${rutaMasCercana.id}')" 
                                      style="font-size: 20px; cursor: pointer; transition: all 0.3s ease; flex-shrink: 0; color: #dc2626;" title="Reportar problema">chat_info</span>
                                <i class="bi bi-star action-icon star-icon" onclick="event.stopPropagation(); window.wheelySelector.manejarFavorito('${rutaMasCercana.id}')" 
                                   style="font-size: 20px; cursor: pointer; transition: all 0.3s ease; flex-shrink: 0; color: var(--color-hover-primary);" title="Agregar a favoritos"></i>
                            </div>
                        </div>
                        
                        ${numMarcadores === 2 ? `
                            <div class="ruta-explanation" style="
                                background: rgba(251, 109, 16, 0.1);
                                padding: 12px;
                                border-radius: 8px;
                                border-left: 3px solid #FB6D10;
                                margin-top: 15px;
                            ">
                                <small style="color: #a0aec0; font-size: 11px; line-height: 1.4; display: block;">
                                     Esta ruta ofrece la mejor conectividad entre tus puntos seleccionados. 
                                    Se muestra el sentido más apropiado según la dirección de tu viaje.
                                </small>
                            </div>
                        ` : `
                            <div class="ruta-explanation" style="
                                background: rgba(251, 109, 16, 0.1);
                                padding: 12px;
                                border-radius: 8px;
                                border-left: 3px solid #FB6D10;
                                margin-top: 15px;
                            ">
                                <small style="color: #a0aec0; font-size: 11px; line-height: 1.4; display: block;">
                                     Se muestra el sentido de la ruta más cercano a tu punto seleccionado.
                                </small>
                            </div>
                        `}
                    </div>
                </div>
            `;

            this.panelInfo.innerHTML = html;
            this.panelInfo.style.opacity = '1';
            this.panelInfo.style.visibility = 'visible';
            this.panelInfo.style.pointerEvents = 'auto';
            this.ajustarPosicionPanel();

            // ✅ AGREGAR FUNCIONALIDAD DE ARRASTRE AL PANEL
            setTimeout(() => {
                this.habilitarArrastre();
            }, 100);
        }

        mostrarMensajeSinRutas() {
            const numMarcadores = this.marcadores.length;
            const distanciaTexto = `${CONFIG.MAX_DISTANCE_KM}km`;
            
            // ✅ PANEL ESTÁTICO AL LADO DE LA SIDEBAR COMO LOS OTROS PANELES
            let html = `
                <div class="panel-flotante panel-sin-rutas active" style="
                    position: fixed;
                    top: 50%;
                    left: 270px;
                    background: var(--color-bg-primary);
                    border: 1px solid var(--color-border-hr);
                    border-radius: 15px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    width: 520px;
                    max-width: calc(100vw - 290px);
                    max-height: calc(100vh - 140px);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    z-index: 1001;
                    opacity: 1;
                    visibility: visible;
                ">
                    <div class="panel-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 25px 30px 20px;
                        border-bottom: 1px solid var(--color-border-hr);
                    ">
                        <h2 style="
                            font-size: 24px;
                            font-weight: 500;
                            margin: 0;
                            color: var(--color-text-primary);
                            pointer-events: none;
                        "> Sin Rutas Cercanas</h2>
                        <div class="panel-actions" style="display: flex; gap: 10px; align-items: center;">
                            <button class="btn-panel btn-limpiar-puntos" onclick="window.wheelySelector.limpiarMapaCompleto()" style="
                                background: #dc3545;
                                border: none;
                                color: white;
                                font-size: 16px;
                                cursor: pointer;
                                padding: 8px 16px;
                                border-radius: 6px;
                                transition: all 0.3s ease;
                                font-weight: 500;
                                pointer-events: auto;
                            ">
                                 Limpiar Puntos
                            </button>
                            <button class="btn-close" onclick="window.wheelySelector.cerrarPanelYLimpiar()" style="
                                background: none;
                                border: none;
                                color: var(--color-text-primary);
                                font-size: 24px;
                                cursor: pointer;
                                padding: 4px;
                                border-radius: 6px;
                                transition: all 0.3s ease;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: 32px;
                                height: 32px;
                                pointer-events: auto;
                            ">
                                <span class="material-symbols-rounded">close</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="panel-content" style="
                        flex: 1;
                        padding: 15px 30px 25px;
                        overflow-y: auto;
                    ">
                        <div class="no-routes-content" style="text-align: center; padding: 20px 0;">
                            <div class="no-routes-icon" style="font-size: 48px; margin-bottom: 15px;">🚌</div>
                            <h3 style="color: var(--color-text-primary); margin-bottom: 10px;">No hay rutas disponibles</h3>
                            <p style="color: #a0aec0; margin-bottom: 20px; line-height: 1.4;">
                                No se encontraron rutas de transporte público dentro de ${distanciaTexto} de 
                                ${numMarcadores === 1 ? 'tu punto seleccionado' : 'tus puntos seleccionados'}.
                            </p>
                            
                            <div class="suggestions-box" style="
                                background: rgba(251, 109, 16, 0.1);
                                padding: 15px;
                                border-radius: 8px;
                                text-align: left;
                                margin-bottom: 20px;
                                border-left: 3px solid #FB6D10;
                            ">
                                <h4 style="color: #FB6D10; margin-bottom: 10px; font-size: 14px;"> Sugerencias:</h4>
                                <ul style="color: #a0aec0; font-size: 13px; line-height: 1.4; margin: 0; padding-left: 20px;">
                                    <li>Intenta seleccionar puntos más cercanos al centro de la ciudad</li>
                                    <li>Verifica que estés en la zona de cobertura de Tuxtla Gutiérrez</li>
                                    <li>Considera caminar hasta una parada más cercana</li>
                                </ul>
                            </div>
                            
                            <div class="action-buttons">
                                <button onclick="window.wheelySelector.centrarEnTuxtla()" style="
                                    background: var(--color-hover-primary);
                                    border: none;
                                    color: white;
                                    padding: 10px 20px;
                                    border-radius: 6px;
                                    cursor: pointer;
                                    font-size: 14px;
                                    transition: all 0.3s ease;
                                ">
                                    Ir al centro de Tuxtla
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            this.panelInfo.innerHTML = html;
            this.panelInfo.style.opacity = '1';
            this.panelInfo.style.visibility = 'visible';
            this.panelInfo.style.pointerEvents = 'auto';

            // ✅ AGREGAR FUNCIONALIDAD DE ARRASTRE AL PANEL
            setTimeout(() => {
                this.habilitarArrastre();
            }, 100);
        }

        mostrarDetalleRutaCompleta(rutaId) {
            const rutaCompleta = this.rutasCompletas.get(rutaId);
            if (!rutaCompleta) {
                console.error(`Ruta ${rutaId} no encontrada`);
                return;
            }

            // Usar función existente si está disponible
            if (typeof cargarDetalleDeRuta === 'function') {
                cargarDetalleDeRuta(rutaCompleta.idRuta, rutaCompleta.origen, rutaCompleta.destino);
            }

            // Cerrar paneles existentes
            if (typeof closeAllPanels === 'function') {
                closeAllPanels();
            }

            this.cerrarPanelYLimpiar();
        }

        // ===== FUNCIONES DE LIMPIEZA MEJORADAS =====

        // ✅ NUEVO: Cerrar panel Y limpiar
        cerrarPanelYLimpiar() {
            this.ocultarPanel();
            this.limpiarMapaCompleto();
            
            // Cancelar timer de auto-cierre
            if (this.autoCerrarTimer) {
                clearTimeout(this.autoCerrarTimer);
                this.autoCerrarTimer = null;
            }
        }

        // ✅ NUEVO: Limpieza completa del mapa
        limpiarMapaCompleto() {
            console.log('🧹 Iniciando limpieza completa del mapa...');
            
            // Eliminar marcadores del selector
            this.marcadores.forEach(marcador => {
                // Limpiar listeners específicos del marcador
                if (marcador._wheelyListeners) {
                    marcador._wheelyListeners.forEach(({ event, listener }) => {
                        marcador.off(event, listener);
                    });
                }
                
                if (this.mapa && this.mapa.hasLayer(marcador)) {
                    this.mapa.removeLayer(marcador);
                }
            });
            this.marcadores = [];

            // Limpiar rutas del selector
            this.limpiarRutasDelMapa();

            // Limpiar capas de detalle usando función global
            if (typeof window.limpiarTodasLasCapasGeoJSON === 'function') {
                window.limpiarTodasLasCapasGeoJSON();
            }

            // Ocultar panel
            this.ocultarPanel();

            // Desactivar modo de selección
            this.estaSeleccionando = false;
            if (this.mapa) {
                this.mapa.getContainer().style.cursor = '';
            }
            this.ocultarInstrucciones();
            this.actualizarEstadoBoton();
            
            // Resetear bandera de proceso
            this.procesoActivo = false;
            
            console.log('✅ Mapa completamente limpiado');
        }

        // ===== FUNCIONES DE UTILIDAD =====

        observarSidebar() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                const observer = new MutationObserver(() => {
                    this.ajustarPosicionPanel();
                });
                
                observer.observe(sidebar, {
                    attributes: true,
                    attributeFilter: ['class']
                });
                
                this.observadores.push(observer);
            }
        }

        ajustarPosicionPanel() {
            if (this.panelInfo && this.panelInfo.style.visibility === 'visible') {
                const sidebar = document.querySelector('.sidebar');
                const isCollapsed = sidebar?.classList.contains('collapsed');
                
                if (isCollapsed) {
                    this.panelInfo.style.left = '110px';
                } else {
                    this.panelInfo.style.left = '270px';
                }
            }
            
            // También ajustar paneles generados dinámicamente
            const panelesDinamicos = document.querySelectorAll('.panel-rutas-cercanas, .panel-sin-rutas');
            panelesDinamicos.forEach(panel => {
                const sidebar = document.querySelector('.sidebar');
                const isCollapsed = sidebar?.classList.contains('collapsed');
                
                if (isCollapsed) {
                    panel.style.left = '110px';
                } else {
                    panel.style.left = '270px';
                }
            });
        }

        manejarReporte(rutaId) {
            if (typeof setupReportActions === 'function') {
                window.rutaSeleccionadaParaReporte = rutaId;
                if (typeof abrirPanel === 'function') {
                    const overlayReporte = document.getElementById('reporte-overlay');
                    const panelReporte = document.getElementById('reporte-panel');
                    if (overlayReporte && panelReporte) {
                        abrirPanel(overlayReporte, panelReporte);
                    }
                }
            } else {
                this.mostrarToast('Función de reportes no disponible', 'error');
            }
        }

        manejarFavorito(rutaId) {
            if (typeof obtenerUsuarioActual === 'function') {
                const userId = obtenerUsuarioActual();
                if (userId) {
                    this.mostrarToast('Ruta agregada a favoritos', 'success');
                } else {
                    this.mostrarToast('Debes iniciar sesión para agregar favoritos', 'error');
                }
            } else {
                this.mostrarToast('Función de favoritos no disponible', 'error');
            }
        }

        mostrarToast(mensaje, tipo = 'success') {
            const toastExistente = document.querySelector('.toast-selector');
            if (toastExistente) {
                toastExistente.remove();
            }

            const toast = document.createElement('div');
            toast.className = `toast-selector toast-${tipo}`;
            toast.textContent = mensaje;
            
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: ${tipo === 'success' ? '#4caf50' : tipo === 'error' ? '#f44336' : '#2196f3'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.3s ease;
                font-weight: 500;
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

        centrarEnTuxtla() {
            if (this.mapa) {
                this.mapa.setView([16.7569, -93.1189], 13);
            }
        }

        ocultarPanel() {
            if (this.panelInfo) {
                this.panelInfo.style.opacity = '0';
                this.panelInfo.style.visibility = 'hidden';
                this.panelInfo.style.pointerEvents = 'none';
                setTimeout(() => {
                    this.panelInfo.innerHTML = '';
                }, 300);
            }
        }

        mostrarInstrucciones() {
            let mensaje = document.getElementById('wheely-instructions');
            if (!mensaje) {
                mensaje = document.createElement('div');
                mensaje.id = 'wheely-instructions';
                mensaje.className = 'wheely-instructions';
                mensaje.innerHTML = `
               <div class="instruction-content">
                        <span class="material-symbols-rounded">touch_app</span>
                        <span>Haz clic para agregar primer punto, doble clic para el segundo</span>
                    </div>
                `;
                mensaje.style.cssText = `
                    position: fixed;
                    top: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #212227;
                    color: #ffffff;
                    padding: 12px 20px;
                    border-radius: 25px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    z-index: 1000;
                    border: 1px solid #3a3a3a;
                    animation: instructionsFadeIn 0.3s ease;
                `;
                document.body.appendChild(mensaje);
            }
            mensaje.style.display = 'block';
        }

        ocultarInstrucciones() {
            const mensaje = document.getElementById('wheely-instructions');
            if (mensaje) {
                mensaje.style.display = 'none';
            }
        }

        agregarMarcadorDesdeBusqueda(coordenadas, nombre) {
            const latlng = L.latLng(coordenadas.lat, coordenadas.lng);
            
            if (this.marcadores.length >= this.maxMarcadores) {
                this.limpiarMapaCompleto();
            }
            
            this.agregarMarcador(latlng, false);
            console.log(`📍 Marcador agregado desde búsqueda: ${nombre}`);
        }

        // ✅ FUNCIONALIDAD DE ARRASTRE PARA PANELES
        habilitarArrastre() {
            const panel = this.panelInfo.querySelector('.draggable-panel');
            const handle = panel?.querySelector('.draggable-handle');
            
            if (!panel || !handle) {
                console.warn('No se encontró panel o handle para arrastre');
                return;
            }

            let isDragging = false;
            let startX, startY, initialX, initialY;

            const onMouseDown = (e) => {
                // Solo permitir arrastre si se hace clic en el handle
                if (!e.target.closest('.draggable-handle')) return;
                
                // Evitar arrastre si se hace clic en botones
                if (e.target.closest('button') || e.target.closest('.btn-panel') || e.target.closest('.btn-close')) {
                    return;
                }

                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;

                const rect = panel.getBoundingClientRect();
                initialX = rect.left;
                initialY = rect.top;

                // Cambiar cursor y agregar clase de arrastre
                document.body.style.cursor = 'grabbing';
                panel.style.transition = 'none';
                panel.classList.add('dragging');

                // Prevenir selección de texto
                e.preventDefault();
                e.stopPropagation();

                // Agregar listeners globales
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            };

            const onMouseMove = (e) => {
                if (!isDragging) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                let newX = initialX + deltaX;
                let newY = initialY + deltaY;

                // Limitar el movimiento dentro de la ventana
                const panelRect = panel.getBoundingClientRect();
                const maxX = window.innerWidth - panelRect.width;
                const maxY = window.innerHeight - panelRect.height;

                newX = Math.max(0, Math.min(newX, maxX));
                newY = Math.max(0, Math.min(newY, maxY));

                // Aplicar nueva posición
                panel.style.left = `${newX}px`;
                panel.style.top = `${newY}px`;
                panel.style.transform = 'none';

                e.preventDefault();
            };

            const onMouseUp = (e) => {
                if (!isDragging) return;

                isDragging = false;
                document.body.style.cursor = '';
                panel.style.transition = '';
                panel.classList.remove('dragging');

                // Remover listeners globales
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                e.preventDefault();
            };

            // Agregar listener inicial
            handle.addEventListener('mousedown', onMouseDown);

            // Almacenar para limpieza posterior
            this.eventListeners.push({ 
                element: handle, 
                event: 'mousedown', 
                listener: onMouseDown 
            });

            console.log('✅ Funcionalidad de arrastre habilitada');
        }

        // ✅ FUNCIÓN DE LIMPIEZA AL DESTRUIR LA INSTANCIA
        destruir() {
            // Limpiar todos los event listeners
            this.eventListeners.forEach(({ element, event, listener }) => {
                try {
                    element.removeEventListener(event, listener);
                } catch (error) {
                    console.warn('Error removiendo listener:', error);
                }
            });
            this.eventListeners = [];

            // Limpiar observadores
            this.observadores.forEach(observer => {
                try {
                    observer.disconnect();
                } catch (error) {
                    console.warn('Error desconectando observer:', error);
                }
            });
            this.observadores = [];

            // Limpiar timers
            if (this.autoCerrarTimer) {
                clearTimeout(this.autoCerrarTimer);
                this.autoCerrarTimer = null;
            }

            if (this.clickTimer) {
                clearTimeout(this.clickTimer);
                this.clickTimer = null;
            }

            // Limpiar mapa completamente
            this.limpiarMapaCompleto();

            console.log('🗑️ Wheely Selector destruido completamente');
        }

        agregarEstilos() {
            if (!document.getElementById('wheely-selector-styles')) {
                const estilos = document.createElement('style');
                estilos.id = 'wheely-selector-styles';
                estilos.textContent = `
                    /* Marcadores del selector */
                    .marcador-wheely {
                        background: transparent !important;
                        border: none !important;
                    }

                    .marcador-punto {
                        background: #FB6D10;
                        border: 3px solid white;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                        position: relative;
                        animation: markerPulse 2s infinite;
                    }

                    .marcador-punto::after {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 8px;
                        height: 8px;
                        background: white;
                        border-radius: 50%;
                    }

                    @keyframes markerPulse {
                        0% {
                            box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 0 rgba(251, 109, 16, 0.7);
                        }
                        70% {
                            box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 10px rgba(251, 109, 16, 0);
                        }
                        100% {
                            box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 0 rgba(251, 109, 16, 0);
                        }
                    }

                    /* Instrucciones flotantes */
                    @keyframes instructionsFadeIn {
                        from {
                            opacity: 0;
                            transform: translateX(-50%) translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(-50%) translateY(0);
                        }
                    }

                    /* Botón selector activo */
                    .right-buttons .btn.selector-activo {
                        background-color: #FB6D10 !important;
                        transform: scale(1.1);
                        box-shadow: 0 4px 12px rgba(251, 109, 16, 0.4);
                    }

                    /* Botón limpiar puntos */
                    .btn-limpiar-puntos:hover {
                        background: #c82333 !important;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 8px rgba(220, 53, 69, 0.4) !important;
                    }

                    /* Hover effects para elementos del panel */
                    .ruta-item:hover {
                        background: rgba(251, 109, 16, 0.1) !important;
                        padding-left: 12px !important;
                        padding-right: 12px !important;
                        margin: 0 -12px !important;
                        border-radius: 8px !important;
                    }

                    .action-icon:hover {
                        transform: scale(1.15) !important;
                    }

                    .star-icon:hover {
                        color: var(--color-hover-secondary) !important;
                    }

                    .report-icon:hover {
                        color: #ef4444 !important;
                    }

                    .btn-close:hover {
                        color: var(--color-hover-primary) !important;
                        background: rgba(251, 109, 16, 0.1) !important;
                    }

                    /* Estilos para arrastre de paneles */
                    .draggable-panel {
                        user-select: none;
                    }

                    .draggable-panel.dragging {
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6) !important;
                        transform: scale(1.02) !important;
                        z-index: 1002 !important;
                    }

                    .draggable-handle {
                        user-select: none;
                    }

                    .draggable-handle:hover {
                        background: rgba(251, 109, 16, 0.05) !important;
                    }

                    .draggable-handle:active {
                        cursor: grabbing !important;
                    }

                    /* Responsivo para móviles */
                    @media (max-width: 768px) {
                        .panel-flotante {
                            width: calc(100vw - 20px) !important;
                            max-width: calc(100vw - 20px) !important;
                            margin: 10px !important;
                            top: 50% !important;
                            left: 50% !important;
                            transform: translate(-50%, -50%) !important;
                        }
                        
                        #wheely-instructions {
                            top: 70px !important;
                            left: 10px !important;
                            right: 10px !important;
                            transform: none !important;
                            max-width: calc(100vw - 20px) !important;
                        }

                        .instruction-content {
                            font-size: 12px !important;
                        }

                        /* Deshabilitar arrastre en móviles */
                        .draggable-panel {
                            cursor: default !important;
                        }
                        
                        .draggable-handle {
                            cursor: default !important;
                        }
                    }
                `;
                document.head.appendChild(estilos);
            }
        }
    }

    // ===== INICIALIZACIÓN =====

    async function inicializarWheelySelectorPuntos() {
        const selector = new WheelySelectorPuntos();
        await selector.init();
        return selector;
    }

    function autoInicializar() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', intentarInicializar);
        } else {
            intentarInicializar();
        }
    }

    async function intentarInicializar() {
        try {
            console.log('🎯 Inicializando Wheely Selector de Puntos...');
            
            // ✅ CAMBIO: Destruir instancia anterior si existe
            if (window.wheelySelector && typeof window.wheelySelector.destruir === 'function') {
                window.wheelySelector.destruir();
            }
            
            window.wheelySelector = await inicializarWheelySelectorPuntos();
            console.log('✅ Wheely Selector inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Wheely Selector:', error);
            // Reintentar en 2 segundos
            setTimeout(intentarInicializar, 2000);
        }
    }

    // ✅ FUNCIÓN DE REINICIO GLOBAL
    window.reiniciarWheelySelectorPuntos = function() {
        console.log('🔄 Reiniciando Wheely Selector...');
        intentarInicializar();
    };

    // ✅ LIMPIEZA AL CAMBIAR DE PÁGINA O RECARGAR
    window.addEventListener('beforeunload', () => {
        if (window.wheelySelector && typeof window.wheelySelector.destruir === 'function') {
            window.wheelySelector.destruir();
        }
    });

    // Exportar para uso global
    window.WheelySelectorPuntos = WheelySelectorPuntos;
    window.inicializarWheelySelectorPuntos = inicializarWheelySelectorPuntos;

    // Inicializar automáticamente
    autoInicializar();

})();
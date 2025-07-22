// === FUNCIONALIDAD DEL BOTÓN DE LOCALIZACIÓN ===
// Agrega este código al final de tu archivo wheely_principal_register.html antes del </script>

// Coordenadas de Tuxtla Gutiérrez, Chiapas
const TUXTLA_COORDINATES = {
    lat: 16.7569,
    lng: -93.1189,
    zoom: 13
};

// Función para centrar el mapa en Tuxtla Gutiérrez
function centrarEnTuxtla() {
    if (map) {
        // Verificar si ya está centrado en Tuxtla Gutiérrez (con tolerancia de 0.01 grados)
        const currentCenter = map.getCenter();
        const tolerance = 0.01;
        
        const yaEstaEnTuxtla = (
            Math.abs(currentCenter.lat - TUXTLA_COORDINATES.lat) < tolerance &&
            Math.abs(currentCenter.lng - TUXTLA_COORDINATES.lng) < tolerance &&
            map.getZoom() >= TUXTLA_COORDINATES.zoom - 1
        );
        
        if (yaEstaEnTuxtla) {
            // Si ya está centrado, mostrar mensaje informativo
            mostrarToast('🎯 Ya estás viendo Tuxtla Gutiérrez', 'info');
        } else {
            // Si no está centrado, mover a Tuxtla Gutiérrez
            map.setView([TUXTLA_COORDINATES.lat, TUXTLA_COORDINATES.lng], TUXTLA_COORDINATES.zoom, {
                animate: true,
                duration: 1.5 // Animación suave de 1.5 segundos
            });
            mostrarToast('📍 Centrando en Tuxtla Gutiérrez, Chiapas', 'success');
        }
    } else {
        console.error('Mapa no disponible');
        mostrarToast('❌ Error: Mapa no disponible', 'error');
    }
}

// Función para mostrar notificaciones toast
function mostrarToast(mensaje, tipo = 'info') {
    // Remover toast anterior si existe
    const toastAnterior = document.querySelector('.toast-localizacion');
    if (toastAnterior) {
        toastAnterior.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-localizacion';
    toast.textContent = mensaje;
    
    // Colores según el tipo
    const colores = {
        success: '#fb6d10',
        info: '#fb6d10',
        error: '#ef4444'
    };
    
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colores[tipo] || colores.info};
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    `;
    
    document.body.appendChild(toast);
    
    // Mostrar con animación
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// === CONFIGURACIÓN DEL EVENT LISTENER ===
// Buscar el botón de localización y agregar el event listener
document.addEventListener('DOMContentLoaded', function() {
    // Buscar el botón específico por su título
    const btnCentrarMapa = document.querySelector('button[title="Centrar mapa"]');
    
    if (btnCentrarMapa) {
        // Agregar el event listener
        btnCentrarMapa.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            //centrarEnTuxtla();
            centrarConGeolocation(); // Usar la función de geolocalización
        });
        
        // Cambiar el ID para mayor especificidad (opcional)
        btnCentrarMapa.id = 'btn-centrar-mapa';
        
        console.log('✅ Botón de localización configurado correctamente');
    } else {
        console.warn('⚠️ No se encontró el botón de centrar mapa');
    }
});

// === INTEGRACIÓN CON EL SISTEMA EXISTENTE ===
// Si tienes el sistema de selector de puntos, también puedes integrarlo
if (typeof window.wheelySelector !== 'undefined') {
    // Hacer la función disponible globalmente para el selector
    window.centrarEnTuxtla = centrarEnTuxtla;
}

// === FUNCIÓN ALTERNATIVA CON GEOLOCALIZACIÓN ===
// Si quieres también detectar la ubicación del usuario y compararla
function centrarConGeolocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                // Calcular distancia a Tuxtla Gutiérrez
                const distancia = calcularDistancia(
                    userLat, userLng, 
                    TUXTLA_COORDINATES.lat, TUXTLA_COORDINATES.lng
                );

                // Si está cerca de Tuxtla (menos de 10km), centrar en ubicación actual
                if (distancia < 10) {
                    map.setView([userLat, userLng], 15);
                    mostrarToast('📍 Centrando en tu ubicación actual', 'success');
                } else {
                    // Si está lejos, centrar en Tuxtla
                    centrarEnTuxtla();
                }
            },
            function(error) {
                // Si hay error en geolocalización, centrar en Tuxtla
                console.log('Error de geolocalización:', error.message);
                centrarEnTuxtla();
            },
            {
                timeout: 5000,
                maximumAge: 300000 // 5 minutos
            }
        );
    } else {
        // Si no hay geolocalización, centrar en Tuxtla
        centrarEnTuxtla();
    }
}

// Función auxiliar para calcular distancia
function calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
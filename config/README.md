# Configuración de la API

Este directorio contiene la configuración centralizada de la API de Wheely.

## Archivos

### APIConfig.js
Archivo principal de configuración que maneja:
- URL base de la API
- Duración de sesiones
- Configuración de cache
- Intervalos de actualización automática
- Métodos helper para peticiones HTTP

## Uso

### 1. Incluir el archivo en tu HTML

Asegúrate de incluir el archivo de configuración **antes** de cualquier otro script que lo use:

```html
<!-- Cargar configuración primero -->
<script src="config/APIConfig.js"></script>

<!-- Luego cargar otros scripts -->
<script src="js/wheely-auth-integration.js"></script>
<script src="js/wheely-api-integration.js"></script>
```

### 2. Acceder a la configuración

En JavaScript, puedes acceder a la configuración usando la instancia global `window.APIConfig`:

```javascript
// Obtener la URL base
const baseURL = window.APIConfig.getBaseURL();

// Obtener endpoints específicos
const endpoints = window.APIConfig.endpoints();
console.log(endpoints.rutas); // http://localhost:7000/rutas

// Hacer peticiones usando los métodos helper
async function obtenerRutas() {
    try {
        const data = await window.APIConfig.get(endpoints.rutas);
        console.log(data);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

### 3. Métodos disponibles

#### Configuración
- `getBaseURL()` - Obtiene la URL base de la API
- `getSessionDuration()` - Obtiene la duración de la sesión
- `getCacheTimeout()` - Obtiene el timeout del cache
- `getAutoRefreshInterval()` - Obtiene el intervalo de auto-refresh

#### Endpoints
- `endpoints()` - Retorna objeto con todos los endpoints disponibles

#### Peticiones HTTP
- `get(endpoint, token)` - Petición GET
- `post(endpoint, body, token)` - Petición POST
- `put(endpoint, body, token)` - Petición PUT
- `delete(endpoint, token)` - Petición DELETE
- `request(endpoint, options)` - Petición personalizada

#### Utilidades
- `checkConnection()` - Verifica la conectividad con la API
- `updateConfig(newConfig)` - Actualiza la configuración en tiempo de ejecución

## Ejemplos de uso

### Ejemplo 1: Petición GET simple
```javascript
const endpoints = window.APIConfig.endpoints();
const data = await window.APIConfig.get(endpoints.rutas);
```

### Ejemplo 2: Petición POST con autenticación
```javascript
const token = 'mi_token_jwt';
const endpoints = window.APIConfig.endpoints();
const body = { rutaId: 123 };

const data = await window.APIConfig.post(
    endpoints.agregarFavorita(userId),
    body,
    token
);
```

### Ejemplo 3: Verificar conectividad
```javascript
const isConnected = await window.APIConfig.checkConnection();
if (!isConnected) {
    console.error('No se puede conectar con la API');
}
```

### Ejemplo 4: Actualizar configuración
```javascript
window.APIConfig.updateConfig({
    baseURL: 'https://api.wheely.com',
    sessionDuration: 3600000 // 1 hora
});
```

## Variables de entorno

Las variables de entorno se configuran en el archivo `.env` en la raíz del proyecto:

```
API_BASE_URL=http://localhost:7000
SESSION_DURATION=86400000
```

### Para desarrollo local
Copia el archivo `.env.example` a `.env` y ajusta los valores según tu entorno:

```bash
cp .env.example .env
```

### Para producción
Configura las variables de entorno en tu servidor o servicio de hosting.

## Notas importantes

1. **Orden de carga**: Siempre carga `APIConfig.js` antes que otros scripts que dependan de él.

2. **Fallbacks**: El código incluye valores por defecto en caso de que no se pueda cargar la configuración.

3. **Seguridad**: Nunca commits el archivo `.env` en el repositorio. Usa `.env.example` como plantilla.

4. **CORS**: Asegúrate de que tu API permita peticiones desde el dominio de tu frontend.

## Migración desde código legacy

Si tienes código que usa `API_BASE_URL` directamente:

**Antes:**
```javascript
const API_BASE_URL = 'http://localhost:7000';
fetch(`${API_BASE_URL}/rutas`);
```

**Después:**
```javascript
const API_BASE_URL = window.APIConfig.getBaseURL();
const endpoints = window.APIConfig.endpoints();
window.APIConfig.get(endpoints.rutas);
```

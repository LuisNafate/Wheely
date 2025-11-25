# Guía de Instalación - Configuración Centralizada

Esta guía explica cómo integrar el sistema de configuración centralizada en tu aplicación Wheely.

## Archivos Creados

```
WHEELYFRONTED/
├── .env                    # Variables de entorno (NO SUBIR A GIT)
├── .env.example           # Plantilla de variables de entorno
├── .gitignore             # Ignora archivos sensibles
└── config/
    ├── APIConfig.js       # Configuración centralizada de la API
    ├── env-loader.js      # Cargador de variables de entorno
    ├── README.md          # Documentación de uso
    └── INSTALLATION.md    # Esta guía
```

## Paso 1: Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` con tus valores:
   ```env
   API_BASE_URL=http://localhost:7000
   SESSION_DURATION=86400000
   ```

## Paso 2: Incluir Scripts en HTML

Agrega estos scripts en **TODOS** los archivos HTML que usen la API, en el siguiente orden:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- ... otros meta tags y estilos ... -->
</head>
<body>
    <!-- ... contenido de tu página ... -->

    <!-- ===== IMPORTANTE: Cargar en este orden ===== -->

    <!-- 1. Primero: Cargador de variables de entorno -->
    <script src="config/env-loader.js"></script>

    <!-- 2. Segundo: Configuración de la API -->
    <script src="config/APIConfig.js"></script>

    <!-- 3. Después: Tus scripts que usan la API -->
    <script src="js/wheely-auth-integration.js"></script>
    <script src="js/wheely-api-integration.js"></script>
    <script src="js/Wheely_principal_registered_user.js"></script>
    <script src="js/wheely-search-simple.j.js"></script>
    <script src="js/wheely-location.js"></script>
</body>
</html>
```

### Archivos HTML que necesitan actualización:

Agrega los scripts de configuración a estos archivos:

- ✅ `wheely_principal_register.html` (usuarios registrados)
- ✅ `wheely_principal_visiter.html` (visitantes)
- ✅ `wheely_admin_panel.html` (panel de administración)
- ✅ `wheely_login.html` (login)
- ✅ `wheely_register.html` (registro)
- ✅ Cualquier otro HTML que use la API

## Paso 3: Verificar la Instalación

1. Abre la consola del navegador (F12)
2. Deberías ver estos mensajes:
   ```
   Variables de entorno cargadas: (2) ['API_BASE_URL', 'SESSION_DURATION']
   Entorno detectado: development
   ```

3. Verifica que APIConfig esté disponible:
   ```javascript
   console.log(window.APIConfig.getBaseURL());
   // Debe mostrar: http://localhost:7000 (o tu URL configurada)
   ```

## Paso 4: Actualizar Código Legacy (Opcional)

Si tienes código antiguo que usa `API_BASE_URL` directamente, ya está actualizado en:

- ✅ `js/wheely-auth-integration.js`
- ✅ `js/wheely-api-integration.js`
- ✅ `js/Wheely_principal_registered_user.js`

Los archivos ahora usan:
```javascript
const API_BASE_URL = window.APIConfig ? window.APIConfig.getBaseURL() : 'http://localhost:7000';
```

Esto proporciona un fallback en caso de que APIConfig no esté cargado.

## Paso 5: Cambiar entre Entornos

### Opción 1: Editar .env
```env
# Para desarrollo local
API_BASE_URL=http://localhost:7000

# Para producción
API_BASE_URL=http://98.90.108.255:7000
```

### Opción 2: Editar env-loader.js
Abre `config/env-loader.js` y modifica:
```javascript
const envVars = {
    API_BASE_URL: 'http://98.90.108.255:7000', // Cambia esta línea
    SESSION_DURATION: '86400000'
};
```

### Opción 3: Cambiar en tiempo de ejecución (solo desarrollo)
Abre la consola del navegador:
```javascript
window.setEnv('API_BASE_URL', 'http://localhost:7000');
```

## Solución de Problemas

### Problema: "APIConfig is not defined"

**Solución:** Asegúrate de cargar los scripts en el orden correcto:
1. `env-loader.js`
2. `APIConfig.js`
3. Tus scripts

### Problema: "Cannot read property 'getBaseURL' of undefined"

**Solución:** Verifica que `config/APIConfig.js` esté cargado antes de tus scripts.

### Problema: La API usa la URL incorrecta

**Solución:**
1. Verifica el archivo `.env`
2. Abre la consola y ejecuta: `console.log(window.ENV)`
3. Verifica que la URL sea correcta

## Ejemplo Completo

Aquí un ejemplo completo de cómo debería verse tu HTML:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wheely - Principal</title>

    <!-- CSS -->
    <link rel="stylesheet" href="css/wheely_principal_register.css">
</head>
<body>
    <!-- Tu contenido aquí -->
    <aside class="sidebar">
        <!-- ... -->
    </aside>

    <main class="main-content">
        <!-- ... -->
    </main>

    <!-- Scripts de configuración (PRIMERO) -->
    <script src="config/env-loader.js"></script>
    <script src="config/APIConfig.js"></script>

    <!-- Scripts de la aplicación (DESPUÉS) -->
    <script src="js/wheely-auth-integration.js"></script>
    <script src="js/wheely-api-integration.js"></script>
    <script src="js/Wheely_principal_registered_user.js"></script>
</body>
</html>
```

## Seguridad

⚠️ **IMPORTANTE:**

1. ✅ El archivo `.env` está en `.gitignore` - NO se subirá a Git
2. ✅ Usa `.env.example` para compartir la estructura
3. ⚠️ En producción, configura las variables en tu servidor
4. ⚠️ NUNCA subas credenciales o tokens al repositorio

## Beneficios

✨ **Ventajas de este sistema:**

1. 🔒 **Seguridad:** Credenciales centralizadas y no en el código
2. 🔄 **Flexibilidad:** Cambiar entre entornos fácilmente
3. 📦 **Mantenibilidad:** Un solo lugar para actualizar URLs
4. 🚀 **Escalabilidad:** Fácil agregar nuevas configuraciones
5. 👥 **Colaboración:** Cada desarrollador usa su propio .env

## Próximos Pasos

Después de instalar:

1. Lee `config/README.md` para aprender a usar la API
2. Prueba los ejemplos en la consola del navegador
3. Actualiza tus HTMLs con los scripts de configuración
4. Verifica que todo funcione correctamente

## Ayuda

Si tienes problemas, revisa:
- `config/README.md` - Documentación de uso
- Consola del navegador (F12) - Mensajes de error
- `config/APIConfig.js` - Configuración de la API

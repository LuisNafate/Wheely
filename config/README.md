# Configuración de API - Wheely

Esta carpeta contiene toda la configuración centralizada de la API del sistema Wheely.

## Estructura

```
config/
├── APIConfig.js              # Configuración principal de la API
├── README.md                 # Este archivo
└── endpoints/                # Endpoints organizados por módulos
    ├── index.js             # Índice de todos los endpoints
    ├── rutasEndpoints.js    # Endpoints de rutas
    ├── usuariosEndpoints.js # Endpoints de usuarios
    ├── reportesEndpoints.js # Endpoints de reportes
    └── sistemaEndpoints.js  # Endpoints del sistema
```

## URL de Producción

- **Base URL:** http://98.90.108.255:7000
- **Puerto:** 7000

## Uso Rápido

### Cargar en HTML:
```html
<script src="config/endpoints/rutasEndpoints.js"></script>
<script src="config/endpoints/usuariosEndpoints.js"></script>
<script src="config/endpoints/reportesEndpoints.js"></script>
<script src="config/endpoints/sistemaEndpoints.js"></script>
<script src="config/APIConfig.js"></script>
```

### Usar endpoints:
```javascript
// Rutas
fetch(APIConfig.rutas.getAll())
fetch(APIConfig.rutas.getById(5))

// Usuarios  
fetch(APIConfig.usuarios.login())
fetch(APIConfig.usuarios.getFavorites(userId))

// Reportes
fetch(APIConfig.reportes.getByRoute(rutaId))
```

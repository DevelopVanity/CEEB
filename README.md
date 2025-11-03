# Backend CEEB - Proyecto Provisional

Este es un backend provisional creado con Node.js y Express para el proyecto CEE.

## Estructura del Proyecto

```
CEEB/
├── index.js              # Archivo principal del servidor
├── package.json          # Dependencias y scripts
├── .env                  # Variables de entorno
├── .gitignore           # Archivos a ignorar en git
└── src/
    ├── controllers/     # Controladores de la aplicación
    ├── routes/         # Definición de rutas
    ├── models/         # Modelos de datos
    └── middleware/     # Middlewares personalizados
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
   - Copiar `.env` y ajustar valores según necesidad

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

4. Ejecutar en modo producción:
```bash
npm start
```

## Endpoints Disponibles

### Base
- `GET /` - Información básica del API
- `GET /api/test` - Endpoint de prueba

### Items (Ejemplo)
- `GET /api/items` - Obtener todos los elementos
- `GET /api/items/:id` - Obtener elemento por ID
- `POST /api/items` - Crear nuevo elemento
- `PUT /api/items/:id` - Actualizar elemento
- `DELETE /api/items/:id` - Eliminar elemento

## Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **CORS** - Manejo de CORS
- **dotenv** - Variables de entorno
- **nodemon** - Desarrollo (auto-reload)

## Próximos Pasos

1. Integrar base de datos (MongoDB, PostgreSQL, etc.)
2. Implementar autenticación JWT
3. Agregar validaciones con Joi o similar
4. Implementar logging con Winston
5. Agregar pruebas unitarias
6. Documentación con Swagger

## Uso

El servidor correrá por defecto en `http://localhost:3000`

Puedes probar los endpoints con herramientas como Postman, Insomnia o curl.

Ejemplo:
```bash
curl http://localhost:3000/api/test
```
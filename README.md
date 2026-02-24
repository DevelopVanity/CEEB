CEEB — Backend (Node.js + Express)

Descripción
- API para el Sistema de Entrega de Equipos. Administra entregas, usuarios, generación/ envío de documentos (placeholder) y registro/verificación de firmas digitales.

Requisitos
- Node.js >= 16
- MySQL (opcional según configuración)
- Variables de entorno (ver abajo)

Instalación y ejecución
- Instalar dependencias:

    npm install

- Modo desarrollo (con nodemon):

    npm run dev

- Producción:

    npm start

Variables de entorno recomendadas
- PORT — puerto del servidor (por defecto 3001)
- HOST — host (por defecto localhost)
- DB:
  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_CONNECTION_LIMIT
- SMTP (opcional, para envío de enlaces/adjuntos):
  - SMTP_USER, SMTP_PASS
- FRONTEND_URL — URL del frontend para generar links de firmado (opcional)

Archivos y carpetas clave
- index.js — arranque del servidor, carga de rutas y prueba de conexión DB.
- src/config/database.js — pool y helpers para MySQL.
- src/controllers/ — controladores: AuthController, EntregaEquipoController, SigningController, KeyController.
- src/routes/ — rutas agrupadas: auth.js, entregaEquipo.js, items.js.
- src/models/ — modelos para Entrega, Firma, Usuario, Challenge (acceso a BD).
- database/schema.sql — esquema SQL (si está presente).

Endpoints principales (resumen)
- GET / — info básica del API
- GET /api/test — endpoint de prueba
- Auth:
  - POST /api/auth/login — validar credenciales
  - GET /api/auth/perfil/:userId — perfil de usuario
  - GET/POST /api/auth/usuarios — listar/crear usuarios
- Entregas:
  - POST /api/entrega-equipo — crear entrega
  - GET /api/entrega-equipo — listar/paginar filtrando por campos
  - GET /api/entrega-equipo/:id — obtener por id
  - PUT /api/entrega-equipo/:id — actualizar
  - DELETE /api/entrega-equipo/:id — eliminar (simulado)
  - POST /api/entrega-equipo/:id/pdf — generar PDF (placeholder + tentativa de envío SMTP)
- Firma / signing:
  - POST /api/entrega-equipo/:id/challenge — crear nonce para firmado
  - POST /api/entrega-equipo/:id/send-sign-link — crear challenge y enviar link por email
  - POST /api/entrega-equipo/:id/sign — recibir firma del cliente; verifica usando la clave pública del usuario y registra la firma
  - POST /api/entrega-equipo/user/:userId/public-key — subir clave pública del usuario

Flujo de firma digital (resumen)
1. Cliente genera par ECDSA (P-256) en navegador y sube la clave pública al backend.
2. Cliente pide nonce al backend para una entrega específica (/challenge).
3. Cliente calcula documentHash (SHA-256 del PDF), construye el payload canonical (entregaId, userId, documentHash, nonce), lo firma con la privada y envía la firma (base64) a /entrega-equipo/:id/sign.
4. Backend recupera clave pública del usuario, reconstruye el canonical string, verifica la firma y guarda registro en tabla de firmas; marca el nonce como usado si la verificación fue exitosa.

Consideraciones y recomendaciones
- Añadir autenticación basada en tokens (JWT) para proteger rutas sensibles.
- En producción, manejar claves privadas con mayor seguridad (no almacenarlas en cliente sin medidas).
- Validar y sanitizar todas las entradas antes de persistir.
- Configurar SMTP seguro (app password o servicio de envío) si se requiere envío de correos.
- Implementar pruebas unitarias y documentación (Swagger/OpenAPI).

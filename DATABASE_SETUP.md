# Configuración de Base de Datos - Sistema de Entrega de Equipos

Este documento explica cómo configurar la base de datos MySQL para el sistema de entrega de equipos de cómputo.

## Requisitos Previos

1. **MySQL Server** instalado (versión 8.0 o superior recomendada)
2. **Cliente MySQL** (MySQL Workbench, phpMyAdmin, o línea de comandos)
3. **Node.js** con las dependencias instaladas

## Instalación de Dependencias

```bash
cd CEEB
npm install
```

Esto instalará:
- `mysql2`: Driver de MySQL para Node.js
- `bcrypt`: Para hashear contraseñas
- Otras dependencias existentes

## Configuración de la Base de Datos

### 1. Crear la Base de Datos

Ejecuta los siguientes scripts SQL en orden:

```bash
# Opción 1: Usando MySQL Workbench o phpMyAdmin
# Importa y ejecuta el archivo: database/schema.sql

# Opción 2: Usando línea de comandos
mysql -u root -p < database/schema.sql
mysql -u root -p < database/init.sql
```

### 2. Configurar Variables de Entorno

Edita el archivo `.env` con tus credenciales de MySQL:

```env
# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ceeb_entregas
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_CONNECTION_LIMIT=10
```

### 3. Verificar la Conexión

Ejecuta el servidor para verificar que la conexión funciona:

```bash
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3000
✅ Conexión a la base de datos establecida exitosamente
💾 Base de datos conectada exitosamente
```

## Estructura de la Base de Datos

### Tablas Principales

1. **usuarios**: Almacena información de los usuarios del sistema
   - `id`: ID único del usuario
   - `username`: Nombre de usuario único
   - `password_hash`: Contraseña hasheada con bcrypt
   - `nombre_completo`: Nombre completo del usuario
   - `email`: Correo electrónico
   - `puesto`: Puesto de trabajo
   - `departamento`: Departamento al que pertenece

2. **entregas**: Información principal de cada entrega de equipo
   - `id`: ID único de la entrega
   - `sobre`: Número de sobre/folio
   - `usuario_sistema`: Usuario que recibe el equipo
   - `nombre_equipo`: Nombre asignado al equipo
   - `correo`: Correo del usuario que recibe
   - `ubicacion`: Tienda o Fábrica
   - `creado_por`: ID del usuario que creó la entrega

3. **equipos**: Detalle de los equipos en cada entrega
   - `id`: ID único del equipo
   - `entrega_id`: Referencia a la entrega
   - `descripcion`: Tipo de equipo (CPU, Monitor, etc.)
   - `marca`: Marca del equipo
   - `modelo`: Modelo del equipo
   - `numero_serie`: Número de serie

4. **auditoria_entregas**: Histórico de cambios para auditoría

### Usuarios por Defecto

El sistema incluye usuarios de ejemplo:

| Username | Password | Nombre | Rol |
|----------|----------|---------|-----|
| admin | password123 | Administrador Sistema | Admin |
| ing.soporte | password123 | Ingeniero de Soporte | Ingeniero |
| tecnico1 | password123 | Técnico Juan Pérez | Técnico |

**⚠️ IMPORTANTE**: Cambia estas contraseñas en producción.

## API Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Validar credenciales
- `GET /api/auth/usuarios` - Listar usuarios
- `POST /api/auth/usuarios` - Crear usuario

### Entregas
- `POST /api/entrega-equipo` - Crear entrega
- `GET /api/entrega-equipo` - Listar entregas
- `GET /api/entrega-equipo/:id` - Obtener entrega específica
- `PUT /api/entrega-equipo/:id` - Actualizar entrega
- `DELETE /api/entrega-equipo/:id` - Eliminar entrega

## Ejemplos de Uso

### Validar Usuario
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

### Crear Entrega
```bash
curl -X POST http://localhost:3000/api/entrega-equipo \
  -H "Content-Type: application/json" \
  -d '{
    "sobre": "EQ-003",
    "usuario": "mario.lopez",
    "nombreEquipo": "PC-VENTAS-03",
    "correo": "mario.lopez@empresa.com",
    "ubicacion": "Tienda",
    "referencia": "REF-003",
    "departamento": "Ventas",
    "servicioRealizado": "Equipo Nuevo",
    "equipos": [
      {
        "descripcion": "CPU",
        "marca": "HP",
        "modelo": "ProDesk 400",
        "serie": "HP123456"
      }
    ]
  }'
```

## Solución de Problemas

### Error de Conexión
- Verifica que MySQL esté corriendo
- Confirma las credenciales en `.env`
- Asegúrate de que la base de datos `ceeb_entregas` exista

### Error de Permisos
```sql
-- Otorgar permisos al usuario
GRANT ALL PRIVILEGES ON ceeb_entregas.* TO 'tu_usuario'@'localhost';
FLUSH PRIVILEGES;
```

### Resetear Base de Datos
```sql
DROP DATABASE IF EXISTS ceeb_entregas;
-- Luego ejecutar schema.sql e init.sql nuevamente
```

## Próximos Pasos

1. **Implementar autenticación JWT** para sesiones seguras
2. **Agregar middleware de autorización** para proteger rutas
3. **Configurar backups automáticos** de la base de datos
4. **Implementar logging avanzado** para auditoría
5. **Añadir validaciones adicionales** en el modelo de datos
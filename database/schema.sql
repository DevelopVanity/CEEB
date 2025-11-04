-- ============================================================================
-- ESQUEMA DE BASE DE DATOS PARA SISTEMA DE ENTREGA DE EQUIPOS DE CÓMPUTO
-- ============================================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS cee_entregas 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE cee_entregas;

-- ============================================================================
-- TABLA DE USUARIOS
-- ============================================================================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    puesto VARCHAR(100),
    departamento VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_activo (activo)
);

-- ============================================================================
-- TABLA PRINCIPAL DE ENTREGAS
-- ============================================================================
CREATE TABLE entregas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sobre VARCHAR(50) NOT NULL,
    usuario_sistema VARCHAR(100) NOT NULL,
    nombre_equipo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    ubicacion ENUM('Tienda', 'Fabrica') NOT NULL,
    referencia VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    grupo_trabajo VARCHAR(100) DEFAULT 'Vanity',
    
    -- Campos condicionales según ubicación
    direccion_ip VARCHAR(15),
    extension VARCHAR(10),
    telefono1 VARCHAR(20),
    telefono2 VARCHAR(20),
    
    -- Especificaciones de CPU (si aplica)
    procesador VARCHAR(200),
    memoria VARCHAR(100),
    disco_duro VARCHAR(100),
    version_so VARCHAR(100),
    
    -- Software
    tipo_office VARCHAR(100),
    key_office VARCHAR(500),
    
    -- Credenciales
    credencial_usuario VARCHAR(100),
    credencial_password VARCHAR(100),
    
    -- Servicio realizado
    servicio_realizado ENUM('Mantenimiento', 'Equipo Nuevo', 'Asignacion de equipo') NOT NULL,
    
    -- Información adicional
    adicional TEXT,
    
    -- Metadatos
    estado ENUM('borrador', 'activa', 'completada', 'cancelada') DEFAULT 'activa',
    creado_por INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Relaciones
    FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Índices
    INDEX idx_sobre (sobre),
    INDEX idx_usuario_sistema (usuario_sistema),
    INDEX idx_ubicacion (ubicacion),
    INDEX idx_departamento (departamento),
    INDEX idx_estado (estado),
    INDEX idx_creado_por (creado_por),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- ============================================================================
-- TABLA DE EQUIPOS (DETALLE DE CADA ENTREGA)
-- ============================================================================
CREATE TABLE equipos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entrega_id INT NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    numero_serie VARCHAR(100),
    
    -- Metadatos
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Relaciones
    FOREIGN KEY (entrega_id) REFERENCES entregas(id) ON DELETE CASCADE,
    
    -- Índices
    INDEX idx_entrega_id (entrega_id),
    INDEX idx_descripcion (descripcion),
    INDEX idx_numero_serie (numero_serie)
);

-- ============================================================================
-- TABLA DE HISTÓRICO DE CAMBIOS (AUDITORÍA)
-- ============================================================================
CREATE TABLE auditoria_entregas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entrega_id INT NOT NULL,
    campo_modificado VARCHAR(100) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    modificado_por INT NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    
    -- Relaciones
    FOREIGN KEY (entrega_id) REFERENCES entregas(id) ON DELETE CASCADE,
    FOREIGN KEY (modificado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Índices
    INDEX idx_entrega_id (entrega_id),
    INDEX idx_modificado_por (modificado_por),
    INDEX idx_fecha_modificacion (fecha_modificacion)
);

-- ============================================================================
-- TABLA DE SESIONES (OPCIONAL - PARA CONTROL DE ACCESO)
-- ============================================================================
CREATE TABLE sesiones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    
    -- Relaciones
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Índices
    INDEX idx_token (token),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_expiracion (fecha_expiracion),
    INDEX idx_activa (activa)
);

-- ============================================================================
-- TABLA DE MOVIMIENTOS (registro genérico de acciones sobre equipos/entregas)
-- ============================================================================
CREATE TABLE movimientos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM('CREACION','ASIGNACION','MANTENIMIENTO','BAJA','TRANSFERENCIA','OTRO') NOT NULL,
    referencia_id INT, -- puede apuntar a entregas.id, equipos.id u otra entidad según tipo
    entidad VARCHAR(50), -- 'entrega'|'equipo'|'usuario' etc.
    descripcion TEXT,
    realizado_por INT NOT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (realizado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_tipo (tipo),
    INDEX idx_entidad (entidad),
    INDEX idx_referencia_id (referencia_id),
    INDEX idx_fecha_movimiento (fecha_movimiento)
);

-- ============================================================================
-- TABLA DE ASIGNACIONES (cuando un equipo se asigna a un usuario)
-- ============================================================================
CREATE TABLE asignaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipo_id INT NOT NULL,
    usuario_id INT NOT NULL, -- usuario receptor
    asignado_por INT NOT NULL, -- quien asigna
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion TIMESTAMP NULL,
    estado ENUM('activo','devuelto','perdido','dado_baja') DEFAULT 'activo',
    observaciones TEXT,

    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,

    INDEX idx_equipo_id (equipo_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_estado (estado)
);

-- ============================================================================
-- TABLA DE MANTENIMIENTOS
-- ============================================================================
CREATE TABLE mantenimientos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipo_id INT NOT NULL,
    tipo_mantenimiento ENUM('preventivo','correctivo','otros') DEFAULT 'correctivo',
    descripcion TEXT NOT NULL,
    realizado_por INT, -- técnico
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP NULL,
    costo DECIMAL(10,2) DEFAULT 0.00,
    estado ENUM('pendiente','en_proceso','completado','cancelado') DEFAULT 'pendiente',

    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    FOREIGN KEY (realizado_por) REFERENCES usuarios(id) ON DELETE SET NULL,

    INDEX idx_equipo_id (equipo_id),
    INDEX idx_realizado_por (realizado_por),
    INDEX idx_estado_mantenimiento (estado)
);

-- ============================================================================
-- TABLA DE BAJAS (registro cuando se da de baja un equipo)
-- ============================================================================
CREATE TABLE bajas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipo_id INT NOT NULL,
    motivo TEXT NOT NULL,
    solicitado_por INT NOT NULL,
    fecha_baja TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aprobado_por INT NULL,
    fecha_aprobacion TIMESTAMP NULL,

    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL,

    INDEX idx_equipo_id_baja (equipo_id),
    INDEX idx_solicitado_por (solicitado_por)
);

-- ============================================================================
-- TABLA DE FIRMAS (almacena firma digital o representación no autógrafa)
-- ============================================================================
CREATE TABLE firmas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('AUTOGRAFA','NO_AUTOGRAFA') DEFAULT 'NO_AUTOGRAFA',
    contenido LONGBLOB NOT NULL, -- puede ser imagen PNG/JPEG o datos vectoriales (SVG/JSON)
    formato VARCHAR(50) NOT NULL, -- 'image/png','image/svg+xml','application/json'...
    entrega_id INT NULL,
    documento_id INT NULL,
    session_id VARCHAR(128) NULL,
    ip_address VARCHAR(45) NULL,
    device_info JSON NULL,
    location VARCHAR(255) NULL,
    signature_vector JSON NULL,
    mime_type VARCHAR(100) NULL,
    size_bytes INT NULL,
    sha256 CHAR(64) NULL,
    hmac_signature VARCHAR(255) NULL,
    otp_verified BOOLEAN DEFAULT FALSE,
    consent_text_version VARCHAR(100) NULL,
    retenido BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion VARCHAR(255),

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (entrega_id) REFERENCES entregas(id) ON DELETE SET NULL,
    FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE SET NULL,

    INDEX idx_usuario_firma (usuario_id),
    INDEX idx_entrega_firma (entrega_id),
    INDEX idx_sha256 (sha256)
);

-- ============================================================================
-- TABLA DE DOCUMENTOS (PDF/archivos relacionados a entregas/mantenimientos)
-- ============================================================================
CREATE TABLE documentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entrega_id INT NULL,
    mantenimiento_id INT NULL,
    tipo VARCHAR(100), -- 'entrega_pdf','informe_mantenimiento' etc.
    nombre_original VARCHAR(255),
    ruta_archivo VARCHAR(500) NOT NULL,
    hash_archivo VARCHAR(128), -- sha256 opcional para integridad
    subido_por INT,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (entrega_id) REFERENCES entregas(id) ON DELETE SET NULL,
    FOREIGN KEY (mantenimiento_id) REFERENCES mantenimientos(id) ON DELETE SET NULL,
    FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE SET NULL,

    INDEX idx_entrega_doc (entrega_id),
    INDEX idx_mantenimiento_doc (mantenimiento_id)
);

-- ============================================================================
-- VISTAS / UTILIDADES (opcional)
-- ============================================================================
-- Vista: entregas con recuento de equipos
CREATE OR REPLACE VIEW vista_entregas_resumen AS
SELECT e.id, e.sobre, e.usuario_sistema, e.nombre_equipo, e.ubicacion, e.estado, e.fecha_creacion,
       (SELECT COUNT(*) FROM equipos eq WHERE eq.entrega_id = e.id) AS cantidad_equipos
FROM entregas e;

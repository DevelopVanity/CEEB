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
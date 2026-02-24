-- Active: 1758296281211@@192.168.0.230@3306@cee_entregas
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
    -- Clave pública asociada al usuario (PEM)
    public_key TEXT,
    key_fingerprint VARCHAR(128),
    
    INDEX idx_username (username),
    INDEX idx_activo (activo)
);

-- ============================================================================
-- TABLA DE FIRMAS / AUDITORÍA DE FIRMAS DIGITALES
-- ============================================================================
CREATE TABLE IF NOT EXISTS firmas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entrega_id INT,
    usuario_id INT NOT NULL,
    signature TEXT NOT NULL,
    nonce VARCHAR(128),
    algoritmo VARCHAR(50) DEFAULT 'ecdsa-sha256',
    message_hash VARCHAR(256) NOT NULL,
    fecha_firma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    device_fingerprint VARCHAR(255),
    public_key TEXT,
    verificado BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (entrega_id) REFERENCES entregas(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,

    INDEX idx_entrega_id (entrega_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_firma (fecha_firma)
);

-- ============================================================================
-- TABLA DE RETOS / NONCES PARA FIRMADO
-- ============================================================================
CREATE TABLE IF NOT EXISTS sign_challenges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nonce VARCHAR(128) NOT NULL UNIQUE,
    entrega_id INT NOT NULL,
    usuario_id INT NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP,

    FOREIGN KEY (entrega_id) REFERENCES entregas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_nonce (nonce),
    INDEX idx_entrega_id (entrega_id),
    INDEX idx_usuario_id (usuario_id)
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
    
    direccion_ip VARCHAR(15),
    extension VARCHAR(10),
    telefono1 VARCHAR(20),
    telefono2 VARCHAR(20),
    
    procesador VARCHAR(200),
    memoria VARCHAR(100),
    disco_duro VARCHAR(100),
    version_so VARCHAR(100),
    
    tipo_office VARCHAR(100),
    key_office VARCHAR(500),
    
    credencial_usuario VARCHAR(100),
    credencial_password VARCHAR(100),
    
    servicio_realizado ENUM('Mantenimiento', 'Equipo Nuevo', 'Asignacion de equipo') NOT NULL,
    
    adicional TEXT,
    
    estado ENUM('borrador', 'activa', 'completada', 'cancelada') DEFAULT 'activa',
    creado_por INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    
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
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (entrega_id) REFERENCES entregas(id) ON DELETE CASCADE,
    
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
    
    FOREIGN KEY (entrega_id) REFERENCES entregas(id) ON DELETE CASCADE,
    FOREIGN KEY (modificado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    
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
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    INDEX idx_token (token),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_expiracion (fecha_expiracion),
    INDEX idx_activa (activa)
);
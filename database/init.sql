-- ============================================================================
-- Datos semilla para la base de datos de entregas
-- ============================================================================
USE cee_entregas;

-- Usuarios por defecto (usar contraseñas hasheadas en la app; aquí se dejan como texto para ejemplo)
INSERT INTO usuarios (username, password_hash, nombre_completo, email, puesto, departamento)
VALUES
('admin', '$2b$10$EXAMPLEHASHFORPASSWORD1234567890abcdef', 'Administrador Sistema', 'admin@empresa.local', 'Administrador', 'TI'),
('ing.soporte', '$2b$10$EXAMPLEHASHFORPASSWORD1234567890abcdef', 'Ingeniero de Soporte', 'soporte@empresa.local', 'Ingeniero', 'Soporte'),
('tecnico1', '$2b$10$EXAMPLEHASHFORPASSWORD1234567890abcdef', 'Técnico Juan Pérez', 'tecnico1@empresa.local', 'Técnico', 'Soporte');

-- Entrega de ejemplo
INSERT INTO entregas (sobre, usuario_sistema, nombre_equipo, correo, ubicacion, referencia, departamento, creado_por, servicio_realizado, adicional)
VALUES ('EQ-001','mario.lopez','PC-VENTAS-01','mario.lopez@empresa.local','Tienda','REF-001','Ventas', 1, 'Equipo Nuevo', 'Entrega inicial para ventas');

-- Equipo ejemplo para la entrega
INSERT INTO equipos (entrega_id, descripcion, marca, modelo, numero_serie)
VALUES (LAST_INSERT_ID(), 'CPU', 'HP', 'ProDesk 400', 'HP123456');

-- Asignación de ejemplo
INSERT INTO asignaciones (equipo_id, usuario_id, asignado_por, observaciones)
VALUES (1, 2, 1, 'Asignación inicial para pruebas');

-- Movimiento ejemplo
INSERT INTO movimientos (tipo, referencia_id, entidad, descripcion, realizado_por)
VALUES ('CREACION', 1, 'entrega', 'Entrega creada desde init.sql', 1);

-- Mantenimiento ejemplo
INSERT INTO mantenimientos (equipo_id, tipo_mantenimiento, descripcion, realizado_por, estado)
VALUES (1, 'preventivo', 'Chequeo inicial', 3, 'completado');

-- Baja ejemplo (no aprobada aún)
INSERT INTO bajas (equipo_id, motivo, solicitado_por)
VALUES (1, 'Fin de vida útil - Prueba', 2);

-- Nota: las contraseñas insertadas arriba son placeholders. Reemplazar por hashes reales generados por la aplicación.

-- Firma ejemplo (1x1 PNG base64 como placeholder) - reemplazar con captura real desde cliente
INSERT INTO firmas (usuario_id, tipo, contenido, formato, entrega_id, signature_vector, mime_type, size_bytes, sha256, hmac_signature, otp_verified, consent_text_version)
VALUES (
	2,
	'AUTOGRAFA',
	FROM_BASE64('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='),
	'image/png',
	1,
	JSON_ARRAY(JSON_OBJECT('x',0,'y',0,'t',0)),
	'image/png',
	67,
	'PLACEHOLDER_SHA256',
	'PLACEHOLDER_HMAC',
	FALSE,
	'v1'
);


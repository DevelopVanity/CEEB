import crypto from 'crypto';
import { executeQuery, executeTransaction } from '../config/database.js';

const HMAC_KEY = process.env.SIGNATURE_HMAC_KEY || 'dev-placeholder-key-please-change';

class SignatureController {
  // Genera un token corto para la captura (simulado)
  static async createCaptureToken(req, res) {
    try {
      const token = crypto.randomBytes(24).toString('hex');
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutos

      // Guardar token en memoria simplificado: tabla sesiones o cache seria mejor
      // Aquí devolvemos token y expiry; servidor debe validar token en upload
      res.json({ token, expiresAt: expiresAt.toISOString() });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error generando token de captura' });
    }
  }

  // Simula petición de OTP; guarda un registro en tabla temporal (simplificado)
  static async requestOtp(req, res) {
    try {
      const { usuarioId, metodo = 'email' } = req.body;
      if (!usuarioId) return res.status(400).json({ error: 'usuarioId requerido' });

      const otpCode = ('' + Math.floor(100000 + Math.random() * 900000));
      const otpId = crypto.randomBytes(12).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      // Para simplicidad, guardamos OTP en tabla temporal 'sesiones' como token
      const query = `INSERT INTO sesiones (usuario_id, token, ip_address, user_agent, fecha_creacion, fecha_expiracion, activa)
                     VALUES (?, ?, ?, ?, NOW(), ?, 1)`;
      await executeQuery(query, [usuarioId, otpCode, req.ip || null, req.get('User-Agent') || null, expiresAt]);

      // En producción: enviar OTP por email/SMS. Aquí devolvemos el código por respuesta (simulación)
      res.json({ otpId, otpCode, expiresAt: expiresAt.toISOString(), metodo });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error generando OTP' });
    }
  }

  // Verifica OTP (muy simplificado)
  static async verifyOtp(req, res) {
    try {
      const { usuarioId, otpCode } = req.body;
      if (!usuarioId || !otpCode) return res.status(400).json({ error: 'usuarioId y otpCode requeridos' });

      // Buscar en sesiones
      const rows = await executeQuery('SELECT * FROM sesiones WHERE usuario_id = ? AND token = ? AND activa = 1', [usuarioId, otpCode]);
      if (!rows || rows.length === 0) return res.status(400).json({ verified: false });

      // Marcar como inactiva
      await executeQuery('UPDATE sesiones SET activa = 0 WHERE id = ?', [rows[0].id]);
      res.json({ verified: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error verificando OTP' });
    }
  }

  // Subir firma: espera base64 image, vector JSON (opcional) y metadata
  static async uploadSignature(req, res) {
    try {
      const { usuarioId, entregaId, imageBase64, vectorJson, consentTextVersion, captureMethod, otpCode } = req.body;
      if (!usuarioId || !imageBase64) return res.status(400).json({ error: 'usuarioId e imageBase64 requeridos' });

      // Validar OTP si se requiere
      if (otpCode) {
        const rows = await executeQuery('SELECT * FROM sesiones WHERE usuario_id = ? AND token = ? AND activa = 1', [usuarioId, otpCode]);
        if (!rows || rows.length === 0) return res.status(400).json({ error: 'OTP inválido' });
        // opcional: inactivar
        await executeQuery('UPDATE sesiones SET activa = 0 WHERE id = ?', [rows[0].id]);
      }

      // Decodificar imagen base64
      const buffer = Buffer.from(imageBase64, 'base64');
      if (buffer.length > 5 * 1024 * 1024) { // 5 MB max
        return res.status(400).json({ error: 'Imagen demasiado grande (máx 5MB)' });
      }

      const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
      const hmac = crypto.createHmac('sha256', HMAC_KEY).update(sha256).digest('hex');

      // Insertar en transacción: firmas y documentos
      const queries = [
        {
          query: `INSERT INTO firmas (usuario_id, tipo, contenido, formato, creado_en, descripcion) VALUES (?, ?, ?, ?, NOW(), ?)`,
          params: [usuarioId, 'AUTOGRAFA', buffer, 'image/png', `Firma subida para entrega ${entregaId || 'N/A'}`]
        }
      ];

      // Ejecutar transacción
      const results = await executeTransaction(queries);
      const firmaInsertId = results[0].insertId;

      // Insertar documento como referencia (hash + metadata)
      await executeQuery(`INSERT INTO documentos (entrega_id, tipo, nombre_original, ruta_archivo, hash_archivo, subido_por, fecha_subida)
                          VALUES (?, ?, ?, ?, ?, ?, NOW())`, [entregaId || null, 'firma_autografa', `firma_${firmaInsertId}.png`, null, sha256, usuarioId]);

      // Actualizar fila de firmas con metadatos adicionales (si tu tabla tiene columnas extendidas)
      // Intentamos actualizar columnas comunes que podrían existir
      try {
        await executeQuery(`UPDATE firmas SET descripcion = ?, formato = ?, creado_en = NOW() WHERE id = ?`, [`HMAC:${hmac}`, 'image/png', firmaInsertId]);
      } catch (err) {
        // Si las columnas extendidas no existen, ignorar
      }

      // Crear movimiento y auditoría
      await executeQuery(`INSERT INTO movimientos (tipo, referencia_id, entidad, descripcion, realizado_por, fecha_movimiento)
                          VALUES (?, ?, ?, ?, ?, NOW())`, ['ASIGNACION', entregaId || null, 'entrega', 'Firma subida', usuarioId]);

      res.json({ ok: true, firmaId: firmaInsertId, sha256, hmac });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error subiendo la firma' });
    }
  }
}

export default SignatureController;

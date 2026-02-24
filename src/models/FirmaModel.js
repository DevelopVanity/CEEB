import { executeQuery } from '../config/database.js';

class FirmaModel {
  static async crearFirma(datosFirma) {
    try {
      const query = `
        INSERT INTO firmas (
          entrega_id, usuario_id, signature, nonce, algoritmo, message_hash,
          ip_address, user_agent, device_fingerprint, public_key, verificado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        datosFirma.entregaId || null,
        datosFirma.usuarioId,
        datosFirma.signature,
        datosFirma.nonce || null,
        datosFirma.algoritmo || 'ecdsa-sha256',
        datosFirma.messageHash,
        datosFirma.ipAddress || null,
        datosFirma.userAgent || null,
        datosFirma.deviceFingerprint || null,
        datosFirma.publicKey || null,
        datosFirma.verificado ? 1 : 0
      ];

      const result = await executeQuery(query, params);
      return result.insertId;
    } catch (error) {
      console.error('Error al crear firma:', error);
      throw error;
    }
  }
}

export default FirmaModel;

import { executeQuery } from '../config/database.js';
import crypto from 'crypto';

class ChallengeModel {
  // Crear un nuevo challenge/nonce y devolverlo
  static async crearChallenge(entregaId, usuarioId, ttlSeconds = 300) {
    try {
      const nonce = crypto.randomBytes(16).toString('hex');
      const fechaExpiracion = new Date(Date.now() + ttlSeconds * 1000);

      const query = `
        INSERT INTO sign_challenges (nonce, entrega_id, usuario_id, fecha_expiracion)
        VALUES (?, ?, ?, ?)
      `;

      await executeQuery(query, [nonce, entregaId, usuarioId, fechaExpiracion]);
      return { nonce, fechaExpiracion };
    } catch (error) {
      console.error('Error al crear challenge:', error);
      throw error;
    }
  }

  static async obtenerPorNonce(nonce) {
    try {
      const query = `SELECT * FROM sign_challenges WHERE nonce = ?`;
      const results = await executeQuery(query, [nonce]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error al obtener challenge por nonce:', error);
      throw error;
    }
  }

  static async marcarUsado(nonce) {
    try {
      const query = `UPDATE sign_challenges SET usado = TRUE WHERE nonce = ?`;
      const result = await executeQuery(query, [nonce]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al marcar challenge como usado:', error);
      throw error;
    }
  }
}

export default ChallengeModel;

import crypto from 'crypto';
import UsuarioModel from '../models/UsuarioModel.js';

// Controlador para generación de claves y verificación de firmas
class KeyController {
  // Generar par de claves EC (P-256), guardar public key en DB y devolver private key al usuario
  static async generarClave(req, res) {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(userId)) {
        return res.status(400).json({ success: false, message: 'userId inválido' });
      }

      const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'P-256',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      // Generar fingerprint (SHA-256) de la clave pública
      const pubKeyDer = crypto.createPublicKey(publicKey).export({ type: 'spki', format: 'der' });
      const fingerprint = crypto.createHash('sha256').update(pubKeyDer).digest('hex');

      await UsuarioModel.guardarClavePublica(parseInt(userId), publicKey, fingerprint);

      // Devolver la clave privada al cliente para que la guarde de forma segura
      res.json({
        success: true,
        message: 'Clave generada. GUARDE la clave privada de forma segura.',
        data: {
          privateKeyPem: privateKey,
          publicKeyPem: publicKey,
          fingerprint
        }
      });
    } catch (error) {
      console.error('Error al generar clave:', error);
      res.status(500).json({ success: false, message: 'Error interno', error: error.message });
    }
  }

  // Verificar firma dado messageHash y signature (base64)
  static async verificarFirma(req, res) {
    try {
      const { userId } = req.params;
      const { signature, messageHash } = req.body; // signature base64, messageHash hex

      if (!userId || isNaN(userId) || !signature || !messageHash) {
        return res.status(400).json({ success: false, message: 'Parámetros faltantes' });
      }

      const clave = await UsuarioModel.obtenerClavePublica(parseInt(userId));
      if (!clave || !clave.public_key) {
        return res.status(404).json({ success: false, message: 'Clave pública no encontrada para el usuario' });
      }

      const publicKeyPem = clave.public_key;

      // Verificamos la firma: asumimos que el cliente firmó el mensaje original con SHA256
      const verify = crypto.createVerify('SHA256');
      // messageHash puede ser hex del hash del PDF; verificamos contra bytes del hash
      const hashBuffer = Buffer.from(messageHash, 'hex');
      verify.update(hashBuffer);
      verify.end();

      const signatureBuffer = Buffer.from(signature, 'base64');
      const verified = verify.verify(publicKeyPem, signatureBuffer);

      res.json({ success: true, verified });
    } catch (error) {
      console.error('Error al verificar firma:', error);
      res.status(500).json({ success: false, message: 'Error interno', error: error.message });
    }
  }

  // Subir clave pública generada en el cliente
  static async uploadPublicKey(req, res) {
    try {
      const { userId } = req.params;
      const { publicKeyPem, fingerprint } = req.body;

      if (!userId || isNaN(userId) || !publicKeyPem) {
        return res.status(400).json({ success: false, message: 'userId y publicKeyPem son requeridos' });
      }

      // Calcular fingerprint si no se envía
      let fp = fingerprint;
      if (!fp) {
        const crypto = await import('crypto');
        const pubKeyDer = crypto.createPublicKey(publicKeyPem).export({ type: 'spki', format: 'der' });
        fp = crypto.createHash('sha256').update(pubKeyDer).digest('hex');
      }

      const saved = await (await import('../models/UsuarioModel.js')).default.guardarClavePublica(parseInt(userId), publicKeyPem, fp);
      if (saved) {
        return res.json({ success: true, message: 'Clave pública guardada', fingerprint: fp });
      }
      return res.status(500).json({ success: false, message: 'No se pudo guardar la clave pública' });
    } catch (error) {
      console.error('Error al subir clave pública:', error);
      res.status(500).json({ success: false, message: 'Error interno', error: error.message });
    }
  }
}

export default KeyController;

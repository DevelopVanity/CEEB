import ChallengeModel from '../models/ChallengeModel.js';
import UsuarioModel from '../models/UsuarioModel.js';
import EntregaModel from '../models/EntregaModel.js';

// nodemailer will be imported dynamically when needed

class SigningController {
  // Crear challenge (nonce) para una entrega y usuario
  static async createChallenge(req, res) {
    try {
      const entregaId = parseInt(req.params.id);
      const usuarioId = req.body.usuarioId || req.query.usuarioId;

      if (!entregaId || isNaN(entregaId) || !usuarioId || isNaN(parseInt(usuarioId))) {
        return res.status(400).json({ success: false, message: 'EntregaId y usuarioId son requeridos' });
      }

      // Validar que el usuario exista
      const usuario = await UsuarioModel.obtenerPorId(parseInt(usuarioId));
      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const challenge = await ChallengeModel.crearChallenge(entregaId, parseInt(usuarioId));
      res.json({ success: true, nonce: challenge.nonce, expiresAt: challenge.fechaExpiracion });
    } catch (error) {
      console.error('Error al crear challenge:', error);
      res.status(500).json({ success: false, message: 'Error interno', error: error.message });
    }
  }

  // Generar challenge y enviar enlace de firmado por correo al destinatario de la entrega
  static async sendSignLink(req, res) {
    try {
      const entregaId = parseInt(req.params.id);
      const { usuarioId, smtpFrom, frontendUrl } = req.body;

      if (!entregaId || isNaN(entregaId) || !usuarioId) {
        return res.status(400).json({ success: false, message: 'entregaId y usuarioId son requeridos' });
      }

      const entrega = await EntregaModel.obtenerPorId(entregaId);
      if (!entrega) return res.status(404).json({ success: false, message: 'Entrega no encontrada' });

      // Crear nonce/challenge
      const challenge = await ChallengeModel.crearChallenge(entregaId, parseInt(usuarioId));

      const frontendBase = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
      const signLink = `${frontendBase.replace(/\/+$/,'')}/sign?entregaId=${entregaId}&userId=${usuarioId}&nonce=${challenge.nonce}`;

      // Enviar correo con link
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      if (!smtpUser || !smtpPass) {
        return res.status(500).json({ success: false, message: 'SMTP no configurado en el servidor' });
      }

      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: smtpUser, pass: smtpPass } });

      const fromAddr = smtpFrom && typeof smtpFrom === 'string' ? smtpFrom : smtpUser;

      const mailOptions = {
        from: fromAddr,
        to: entrega.correo,
        subject: `Enlace para firmar entrega #${entregaId}`,
        text: `Por favor firme su documento usando el siguiente enlace: ${signLink}\n\nSi no esperaba este correo, ignore este mensaje.`,
        html: `<p>Por favor firme su documento usando el siguiente enlace:</p><p><a href="${signLink}">${signLink}</a></p>`
      };

      await transporter.sendMail(mailOptions);

      res.json({ success: true, message: 'Enlace enviado', signLink });
    } catch (error) {
      console.error('Error al enviar sign link:', error);
      res.status(500).json({ success: false, message: 'Error interno', error: error.message });
    }
  }
}

export default SigningController;

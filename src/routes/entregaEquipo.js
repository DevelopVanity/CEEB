import express from 'express';
import EntregaEquipoController from '../controllers/EntregaEquipoController.js';
import FirmaModel from '../models/FirmaModel.js';
import KeyController from '../controllers/KeyController.js';
import SigningController from '../controllers/SigningController.js';
import ChallengeModel from '../models/ChallengeModel.js';

const router = express.Router();

// POST /api/entrega-equipo - Crear nueva entrega de equipo
router.post('/', EntregaEquipoController.crearEntrega);

// GET /api/entrega-equipo - Obtener todas las entregas
router.get('/', EntregaEquipoController.obtenerEntregas);

// GET /api/entrega-equipo/:id - Obtener una entrega por ID
router.get('/:id', EntregaEquipoController.obtenerEntregaPorId);

// PUT /api/entrega-equipo/:id - Actualizar una entrega
router.put('/:id', EntregaEquipoController.actualizarEntrega);

// DELETE /api/entrega-equipo/:id - Eliminar una entrega
router.delete('/:id', EntregaEquipoController.eliminarEntrega);

// POST /api/entrega-equipo/:id/pdf - Generar PDF de una entrega específica
router.post('/:id/pdf', EntregaEquipoController.generarPDF);

// POST /api/entrega-equipo/:id/sign - Registrar/Verificar firma sobre la entrega (firma enviada por cliente)
router.post('/:id/sign', async (req, res) => {
	try {
		const entregaId = parseInt(req.params.id);
		const { usuarioId, signature, messageHash, deviceFingerprint, nonce } = req.body;

		if (!usuarioId || !signature || !messageHash || !nonce) {
			return res.status(400).json({ success: false, message: 'Parámetros faltantes (usuarioId, signature, messageHash, nonce son requeridos)' });
		}

		// Validar nonce
		const challenge = await ChallengeModel.obtenerPorNonce(nonce);
		if (!challenge) {
			return res.status(400).json({ success: false, message: 'Nonce inválido o no encontrado' });
		}

		if (challenge.usado) {
			return res.status(400).json({ success: false, message: 'Nonce ya fue usado' });
		}

		if (parseInt(challenge.entrega_id) !== entregaId || parseInt(challenge.usuario_id) !== parseInt(usuarioId)) {
			return res.status(400).json({ success: false, message: 'Nonce no corresponde a esta entrega/usuario' });
		}

		if (challenge.fecha_expiracion && new Date(challenge.fecha_expiracion) < new Date()) {
			return res.status(400).json({ success: false, message: 'Nonce expirado' });
		}

		// Obtener la clave pública del usuario
		const clave = await (await import('../models/UsuarioModel.js')).default.obtenerClavePublica(parseInt(usuarioId));
		const publicKey = clave?.public_key || null;

		const crypto = (await import('crypto')).default;
		const verify = crypto.createVerify('SHA256');
		// Reconstruir canonical string: entregaId,userId,messageHash,nonce
		const canonical = JSON.stringify({ entregaId, userId: parseInt(usuarioId), documentHash: messageHash, nonce });
		verify.update(Buffer.from(canonical, 'utf8'));
		verify.end();
		const verified = publicKey ? verify.verify(publicKey, Buffer.from(signature, 'base64')) : false;

		// Guardar en tabla de firmas
		await FirmaModel.crearFirma({
			entregaId,
			usuarioId,
			signature,
			messageHash,
			nonce,
			ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
			userAgent: req.headers['user-agent'] || null,
			deviceFingerprint: deviceFingerprint || null,
			publicKey: publicKey,
			verificado: verified
		});

		// Marcar nonce como usado si verificado
		if (verified) {
			await ChallengeModel.marcarUsado(nonce);
		}

		res.json({ success: true, verified });
	} catch (error) {
		console.error('Error en route /:id/sign:', error);
		res.status(500).json({ success: false, message: 'Error interno', error: error.message });
	}
});

// POST /api/entrega-equipo/:id/challenge - Crear nonce para firma
router.post('/:id/challenge', SigningController.createChallenge);
// POST to generate challenge and send email with sign link
router.post('/:id/send-sign-link', SigningController.sendSignLink);

// Rutas para manejo de claves por usuario
router.post('/user/:userId/generate-key', KeyController.generarClave);
router.post('/user/:userId/verify', KeyController.verificarFirma);
// Subir clave pública generada en el cliente
router.post('/user/:userId/public-key', KeyController.uploadPublicKey);

export default router;
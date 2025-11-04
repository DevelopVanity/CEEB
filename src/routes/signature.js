import express from 'express';
import SignatureController from '../controllers/SignatureController.js';

const router = express.Router();

// Generar token corto para captura (expira pronto)
router.post('/token-capture', SignatureController.createCaptureToken);

// Solicitar OTP (simulado) - servidor devuelve otp_id
router.post('/otp-request', SignatureController.requestOtp);

// Verificar OTP (simulado)
router.post('/verify-otp', SignatureController.verifyOtp);

// Subir firma (image + vector + metadata)
router.post('/upload', SignatureController.uploadSignature);

export default router;

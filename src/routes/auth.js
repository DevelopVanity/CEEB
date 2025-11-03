import express from 'express';
import AuthController from '../controllers/AuthController.js';

const router = express.Router();

// POST /api/auth/login - Validar credenciales de usuario
router.post('/login', AuthController.validarUsuario);

// GET /api/auth/perfil/:userId - Obtener perfil de usuario
router.get('/perfil/:userId', AuthController.obtenerPerfil);

// GET /api/auth/usuarios - Listar todos los usuarios
router.get('/usuarios', AuthController.listarUsuarios);

// POST /api/auth/usuarios - Crear nuevo usuario
router.post('/usuarios', AuthController.crearUsuario);

export default router;
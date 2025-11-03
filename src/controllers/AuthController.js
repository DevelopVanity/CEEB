import UsuarioModel from '../models/UsuarioModel.js';

class AuthController {
  
  // Validar credenciales de usuario
  static async validarUsuario(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario y contraseña son requeridos'
        });
      }
      
      const usuario = await UsuarioModel.validarCredenciales(username, password);
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      
      res.json({
        success: true,
        message: 'Usuario validado exitosamente',
        data: {
          id: usuario.id,
          username: usuario.username,
          nombre_completo: usuario.nombre_completo,
          email: usuario.email,
          puesto: usuario.puesto,
          departamento: usuario.departamento
        }
      });
      
    } catch (error) {
      console.error('Error al validar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
  
  // Obtener información del usuario actual
  static async obtenerPerfil(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
      }
      
      const usuario = await UsuarioModel.obtenerPorId(parseInt(userId));
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: usuario
      });
      
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
  
  // Listar todos los usuarios (solo para administradores)
  static async listarUsuarios(req, res) {
    try {
      const usuarios = await UsuarioModel.obtenerUsuarios();
      
      res.json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: usuarios
      });
      
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
  
  // Crear nuevo usuario (solo para administradores)
  static async crearUsuario(req, res) {
    try {
      const { username, password, nombre_completo, email, puesto, departamento } = req.body;
      
      // Validaciones básicas
      if (!username || !password || !nombre_completo) {
        return res.status(400).json({
          success: false,
          message: 'Usuario, contraseña y nombre completo son requeridos'
        });
      }
      
      // Validar longitud de contraseña
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }
      
      const nuevoUsuario = await UsuarioModel.crearUsuario({
        username,
        password,
        nombre_completo,
        email,
        puesto,
        departamento
      });
      
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: nuevoUsuario
      });
      
    } catch (error) {
      console.error('Error al crear usuario:', error);
      
      if (error.message.includes('ya existe')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

export default AuthController;
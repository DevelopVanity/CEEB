import EntregaModel from '../models/EntregaModel.js';
import UsuarioModel from '../models/UsuarioModel.js';

// Controlador para manejar entregas de equipo de cómputo
class EntregaEquipoController {
  
  // Crear nueva entrega de equipo
  static async crearEntrega(req, res) {
    try {
      const datosEntrega = req.body;
      
      // Validaciones básicas
      const camposObligatorios = ['sobre', 'usuario', 'nombreEquipo', 'correo', 'ubicacion', 'referencia', 'departamento', 'servicioRealizado'];
      const camposFaltantes = camposObligatorios.filter(campo => !datosEntrega[campo]);
      
      if (camposFaltantes.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Campos obligatorios faltantes',
          camposFaltantes
        });
      }
      
      // Validación de usuario (por ahora usamos usuario ID = 1 como default)
      // En la implementación final, esto vendrá del token de autenticación
      datosEntrega.creado_por = datosEntrega.creado_por || 1;
      
      // Validación condicional: IP obligatoria para Fábrica
      if (datosEntrega.ubicacion === 'Fabrica' && !datosEntrega.direccionIP) {
        return res.status(400).json({
          success: false,
          message: 'La dirección IP es obligatoria para ubicación Fábrica'
        });
      }
      
      // Validación de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(datosEntrega.correo)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de correo electrónico inválido'
        });
      }
      
      // Validación de formato de IP (si se proporciona)
      if (datosEntrega.direccionIP) {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipRegex.test(datosEntrega.direccionIP)) {
          return res.status(400).json({
            success: false,
            message: 'Formato de dirección IP inválido'
          });
        }
      }
      
      // Crear entrega en la base de datos
      const entregaId = await EntregaModel.crear(datosEntrega, datosEntrega.equipos);
      
      // Obtener la entrega creada con todos los datos
      const entregaCreada = await EntregaModel.obtenerPorId(entregaId);
      
      res.status(201).json({
        success: true,
        message: 'Entrega de equipo creada exitosamente',
        data: entregaCreada
      });
      
    } catch (error) {
      console.error('Error al crear entrega:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
  
  // Obtener todas las entregas
  static async obtenerEntregas(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        ubicacion, 
        departamento, 
        usuario,
        fechaDesde,
        fechaHasta,
        estado
      } = req.query;
      
      const filtros = {
        ubicacion,
        departamento,
        usuario,
        fechaDesde,
        fechaHasta,
        estado
      };
      
      // Remover filtros vacíos
      Object.keys(filtros).forEach(key => 
        filtros[key] === undefined && delete filtros[key]
      );
      
      const paginacion = { page: parseInt(page), limit: parseInt(limit) };
      
      const resultado = await EntregaModel.obtenerTodas(filtros, paginacion);
      
      res.json({
        success: true,
        message: 'Entregas obtenidas exitosamente',
        data: resultado.entregas,
        pagination: resultado.pagination
      });
      
    } catch (error) {
      console.error('Error al obtener entregas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
  
  // Obtener una entrega por ID
  static async obtenerEntregaPorId(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de entrega requerido y debe ser un número válido'
        });
      }
      
      const entrega = await EntregaModel.obtenerPorId(parseInt(id));
      
      if (!entrega) {
        return res.status(404).json({
          success: false,
          message: 'Entrega no encontrada'
        });
      }
      
      res.json({
        success: true,
        message: 'Entrega encontrada',
        data: entrega
      });
      
    } catch (error) {
      console.error('Error al obtener entrega:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
  
  // Actualizar una entrega
  static async actualizarEntrega(req, res) {
    try {
      const { id } = req.params;
      const datosActualizacion = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de entrega requerido'
        });
      }
      
      // Agregar fecha de actualización
      datosActualizacion.fechaActualizacion = new Date().toISOString();
      
      // En producción, aquí se actualizaría en la base de datos
      const entregaActualizada = {
        id: id,
        ...datosActualizacion
      };
      
      res.json({
        success: true,
        message: 'Entrega actualizada exitosamente',
        data: entregaActualizada
      });
      
    } catch (error) {
      console.error('Error al actualizar entrega:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
  
  // Eliminar una entrega
  static async eliminarEntrega(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de entrega requerido'
        });
      }
      
      // En producción, aquí se eliminaría de la base de datos
      // Por ahora, solo simulamos la eliminación
      
      res.json({
        success: true,
        message: `Entrega ${id} eliminada exitosamente`
      });
      
    } catch (error) {
      console.error('Error al eliminar entrega:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
  
  // Generar PDF de una entrega
  static async generarPDF(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de entrega requerido'
        });
      }
      
      // En producción, aquí se obtendría la entrega de la base de datos
      // y se generaría el PDF en el servidor. Para demostración, generamos
      // un PDF/archivo texto simple y opcionalmente lo enviamos por SMTP.

      const entrega = await EntregaModel.obtenerPorId(parseInt(id));

      if (!entrega) {
        return res.status(404).json({ success: false, message: 'Entrega no encontrada' });
      }

      // Generar contenido simple como placeholder (en vez de PDF real).
      const contenido = `Entrega ID: ${entrega.id}\nUsuario: ${entrega.usuario_sistema}\nEquipo: ${entrega.nombre_equipo}\nFecha: ${new Date().toISOString()}`;
      const buffer = Buffer.from(contenido, 'utf-8');

      // Si se configuran credenciales SMTP en variables de entorno, intentar enviar por correo
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS; // app password de Gmail

      // El frontend puede enviar el campo `smtpFrom` (en body o query) para seleccionar el 'from'
      const requestedFrom = (req.body && req.body.smtpFrom) || req.query?.from;
      let smtpFrom = smtpUser;

      if (requestedFrom) {
        const fromRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (fromRegex.test(requestedFrom)) {
          smtpFrom = requestedFrom;
        } else {
          console.warn('Requested smtpFrom tiene formato inválido, se utilizará el valor por defecto');
        }
      }

      if (smtpFrom && smtpUser && smtpFrom.toLowerCase() !== smtpUser.toLowerCase()) {
        console.warn('smtpFrom difiere de SMTP_USER; Gmail puede sobrescribir o rechazar el header "From".');
      }

      if (smtpUser && smtpPass) {
        try {
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          });

          const mailOptions = {
            from: smtpFrom,
            to: entrega.correo,
            subject: `Entrega de equipo #${entrega.id}`,
            text: 'Adjunto encontrará el documento de entrega.',
            attachments: [
              {
                filename: `entrega_${entrega.id}.txt`,
                content: buffer
              }
            ]
          };

          await transporter.sendMail(mailOptions);
        } catch (mailErr) {
          console.error('Error al enviar correo SMTP:', mailErr);
        }
      }

      res.json({
        success: true,
        message: 'PDF (placeholder) generado exitosamente',
        pdfUrl: `/api/entrega-equipo/${id}/pdf-download`,
        note: smtpUser && smtpPass ? 'Se intentó enviar el archivo por SMTP.' : 'No se envió por SMTP (no configurado).'
      });
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

export default EntregaEquipoController;
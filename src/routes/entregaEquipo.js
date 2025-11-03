import express from 'express';
import EntregaEquipoController from '../controllers/EntregaEquipoController.js';

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

export default router;
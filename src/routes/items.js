// Ejemplo de rutas para el proyecto CEEB
import express from 'express';

const router = express.Router();

// GET /api/items - Obtener todos los elementos
router.get('/', (req, res) => {
  res.json({
    message: 'Lista de elementos',
    data: [
      { id: 1, name: 'Elemento 1', status: 'active' },
      { id: 2, name: 'Elemento 2', status: 'inactive' }
    ]
  });
});

// GET /api/items/:id - Obtener un elemento por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    message: `Elemento con ID: ${id}`,
    data: { id: parseInt(id), name: `Elemento ${id}`, status: 'active' }
  });
});

// POST /api/items - Crear un nuevo elemento
router.post('/', (req, res) => {
  const { name, status } = req.body;
  res.status(201).json({
    message: 'Elemento creado exitosamente',
    data: {
      id: Date.now(), // ID temporal
      name,
      status: status || 'active',
      createdAt: new Date().toISOString()
    }
  });
});

// PUT /api/items/:id - Actualizar un elemento
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;
  res.json({
    message: `Elemento ${id} actualizado`,
    data: {
      id: parseInt(id),
      name,
      status,
      updatedAt: new Date().toISOString()
    }
  });
});

// DELETE /api/items/:id - Eliminar un elemento
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    message: `Elemento ${id} eliminado exitosamente`
  });
});

export default router;
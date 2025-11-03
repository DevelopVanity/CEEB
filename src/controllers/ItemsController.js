// Controlador de ejemplo para manejar la lógica de negocio
class ItemsController {
  
  // Obtener todos los elementos
  static async getAllItems(req, res) {
    try {
      // Aquí iría la lógica para obtener datos de la base de datos
      const items = [
        { id: 1, name: 'Elemento 1', status: 'active', createdAt: new Date() },
        { id: 2, name: 'Elemento 2', status: 'inactive', createdAt: new Date() }
      ];
      
      res.json({
        success: true,
        message: 'Elementos obtenidos exitosamente',
        data: items,
        count: items.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener elementos',
        error: error.message
      });
    }
  }

  // Obtener un elemento por ID
  static async getItemById(req, res) {
    try {
      const { id } = req.params;
      
      // Validación básica
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      // Simulación de búsqueda en base de datos
      const item = { id: parseInt(id), name: `Elemento ${id}`, status: 'active' };
      
      res.json({
        success: true,
        message: 'Elemento encontrado',
        data: item
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener elemento',
        error: error.message
      });
    }
  }

  // Crear un nuevo elemento
  static async createItem(req, res) {
    try {
      const { name, status, description } = req.body;
      
      // Validaciones
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'El nombre es requerido'
        });
      }

      // Simulación de creación
      const newItem = {
        id: Date.now(),
        name,
        status: status || 'active',
        description: description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        message: 'Elemento creado exitosamente',
        data: newItem
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear elemento',
        error: error.message
      });
    }
  }

  // Actualizar un elemento
  static async updateItem(req, res) {
    try {
      const { id } = req.params;
      const { name, status, description } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const updatedItem = {
        id: parseInt(id),
        name,
        status,
        description,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Elemento actualizado exitosamente',
        data: updatedItem
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar elemento',
        error: error.message
      });
    }
  }

  // Eliminar un elemento
  static async deleteItem(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      res.json({
        success: true,
        message: `Elemento ${id} eliminado exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar elemento',
        error: error.message
      });
    }
  }
}

export default ItemsController;
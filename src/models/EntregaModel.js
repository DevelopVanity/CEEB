import { executeQuery, executeTransaction } from '../config/database.js';

class EntregaModel {
  
  // Crear nueva entrega con equipos
  static async crear(datosEntrega, equipos = []) {
    try {
      const queries = [];
      
      // Query para insertar la entrega principal
      const queryEntrega = `
        INSERT INTO entregas (
          sobre, usuario_sistema, nombre_equipo, correo, ubicacion, referencia,
          departamento, grupo_trabajo, direccion_ip, extension, telefono1, telefono2,
          procesador, memoria, disco_duro, version_so, tipo_office, key_office,
          credencial_usuario, credencial_password, servicio_realizado, adicional,
          estado, creado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const paramsEntrega = [
        datosEntrega.sobre,
        datosEntrega.usuario,
        datosEntrega.nombreEquipo,
        datosEntrega.correo,
        datosEntrega.ubicacion,
        datosEntrega.referencia,
        datosEntrega.departamento,
        datosEntrega.grupoTrabajo || 'Vanity',
        datosEntrega.direccionIP || null,
        datosEntrega.extension || null,
        datosEntrega.telefono1 || null,
        datosEntrega.telefono2 || null,
        datosEntrega.procesador || null,
        datosEntrega.memoria || null,
        datosEntrega.discoDuro || null,
        datosEntrega.versionSO || null,
        datosEntrega.tipoOffice || null,
        datosEntrega.keyOffice || null,
        datosEntrega.credenciales?.usuario || null,
        datosEntrega.credenciales?.password || null,
        datosEntrega.servicioRealizado,
        datosEntrega.adicional || null,
        datosEntrega.estado || 'activa',
        datosEntrega.creado_por
      ];
      
      queries.push({ query: queryEntrega, params: paramsEntrega });
      
      // Ejecutar la transacción
      const results = await executeTransaction(queries);
      const entregaId = results[0].insertId;
      
      // Insertar equipos si los hay
      if (equipos && equipos.length > 0) {
        const equiposQueries = equipos
          .filter(equipo => equipo.marca || equipo.modelo || equipo.serie)
          .map(equipo => ({
            query: `
              INSERT INTO equipos (entrega_id, descripcion, marca, modelo, numero_serie)
              VALUES (?, ?, ?, ?, ?)
            `,
            params: [
              entregaId,
              equipo.descripcion,
              equipo.marca || null,
              equipo.modelo || null,
              equipo.serie || null
            ]
          }));
        
        if (equiposQueries.length > 0) {
          await executeTransaction(equiposQueries);
        }
      }
      
      return entregaId;
      
    } catch (error) {
      console.error('Error al crear entrega:', error);
      throw error;
    }
  }
  
  // Obtener todas las entregas con paginación
  static async obtenerTodas(filtros = {}, paginacion = {}) {
    try {
      const { page = 1, limit = 10 } = paginacion;
      const offset = (page - 1) * limit;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      // Aplicar filtros
      if (filtros.ubicacion) {
        whereClause += ' AND e.ubicacion = ?';
        params.push(filtros.ubicacion);
      }
      
      if (filtros.departamento) {
        whereClause += ' AND e.departamento LIKE ?';
        params.push(`%${filtros.departamento}%`);
      }
      
      if (filtros.usuario) {
        whereClause += ' AND e.usuario_sistema LIKE ?';
        params.push(`%${filtros.usuario}%`);
      }
      
      if (filtros.estado) {
        whereClause += ' AND e.estado = ?';
        params.push(filtros.estado);
      }
      
      if (filtros.fechaDesde) {
        whereClause += ' AND DATE(e.fecha_creacion) >= ?';
        params.push(filtros.fechaDesde);
      }
      
      if (filtros.fechaHasta) {
        whereClause += ' AND DATE(e.fecha_creacion) <= ?';
        params.push(filtros.fechaHasta);
      }
      
      const query = `
        SELECT 
          e.*,
          u.nombre_completo as creador_nombre,
          u.username as creador_username,
          COUNT(eq.id) as total_equipos
        FROM entregas e
        LEFT JOIN usuarios u ON e.creado_por = u.id
        LEFT JOIN equipos eq ON e.id = eq.entrega_id
        ${whereClause}
        GROUP BY e.id
        ORDER BY e.fecha_creacion DESC
        LIMIT ? OFFSET ?
      `;
      
      params.push(parseInt(limit), offset);
      
      const entregas = await executeQuery(query, params);
      
      // Obtener total de registros para paginación
      const countQuery = `
        SELECT COUNT(DISTINCT e.id) as total
        FROM entregas e
        LEFT JOIN usuarios u ON e.creado_por = u.id
        ${whereClause}
      `;
      
      const countParams = params.slice(0, -2); // Remover limit y offset
      const totalResults = await executeQuery(countQuery, countParams);
      const total = totalResults[0].total;
      
      return {
        entregas,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      console.error('Error al obtener entregas:', error);
      throw error;
    }
  }
  
  // Obtener entrega por ID con equipos
  static async obtenerPorId(id) {
    try {
      const queryEntrega = `
        SELECT 
          e.*,
          u.nombre_completo as creador_nombre,
          u.username as creador_username,
          u.departamento as creador_departamento
        FROM entregas e
        LEFT JOIN usuarios u ON e.creado_por = u.id
        WHERE e.id = ?
      `;
      
      const entregas = await executeQuery(queryEntrega, [id]);
      
      if (entregas.length === 0) {
        return null;
      }
      
      const entrega = entregas[0];
      
      // Obtener equipos de la entrega
      const queryEquipos = `
        SELECT id, descripcion, marca, modelo, numero_serie
        FROM equipos
        WHERE entrega_id = ?
        ORDER BY descripcion
      `;
      
      const equipos = await executeQuery(queryEquipos, [id]);
      
      return {
        ...entrega,
        equipos
      };
      
    } catch (error) {
      console.error('Error al obtener entrega por ID:', error);
      throw error;
    }
  }
  
  // Actualizar entrega
  static async actualizar(id, datosActualizacion) {
    try {
      const query = `
        UPDATE entregas SET
          usuario_sistema = ?, nombre_equipo = ?, correo = ?, ubicacion = ?,
          referencia = ?, departamento = ?, grupo_trabajo = ?, direccion_ip = ?,
          extension = ?, telefono1 = ?, telefono2 = ?, procesador = ?,
          memoria = ?, disco_duro = ?, version_so = ?, tipo_office = ?,
          key_office = ?, credencial_usuario = ?, credencial_password = ?,
          servicio_realizado = ?, adicional = ?, estado = ?,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const params = [
        datosActualizacion.usuario,
        datosActualizacion.nombreEquipo,
        datosActualizacion.correo,
        datosActualizacion.ubicacion,
        datosActualizacion.referencia,
        datosActualizacion.departamento,
        datosActualizacion.grupoTrabajo || 'Vanity',
        datosActualizacion.direccionIP || null,
        datosActualizacion.extension || null,
        datosActualizacion.telefono1 || null,
        datosActualizacion.telefono2 || null,
        datosActualizacion.procesador || null,
        datosActualizacion.memoria || null,
        datosActualizacion.discoDuro || null,
        datosActualizacion.versionSO || null,
        datosActualizacion.tipoOffice || null,
        datosActualizacion.keyOffice || null,
        datosActualizacion.credenciales?.usuario || null,
        datosActualizacion.credenciales?.password || null,
        datosActualizacion.servicioRealizado,
        datosActualizacion.adicional || null,
        datosActualizacion.estado || 'activa',
        id
      ];
      
      const result = await executeQuery(query, params);
      return result.affectedRows > 0;
      
    } catch (error) {
      console.error('Error al actualizar entrega:', error);
      throw error;
    }
  }
  
  // Eliminar entrega
  static async eliminar(id) {
    try {
      const query = 'DELETE FROM entregas WHERE id = ?';
      const result = await executeQuery(query, [id]);
      return result.affectedRows > 0;
      
    } catch (error) {
      console.error('Error al eliminar entrega:', error);
      throw error;
    }
  }
  
  // Obtener estadísticas
  static async obtenerEstadisticas() {
    try {
      const queries = [
        'SELECT COUNT(*) as total FROM entregas',
        'SELECT COUNT(*) as activas FROM entregas WHERE estado = "activa"',
        'SELECT COUNT(*) as completadas FROM entregas WHERE estado = "completada"',
        'SELECT ubicacion, COUNT(*) as total FROM entregas GROUP BY ubicacion',
        'SELECT departamento, COUNT(*) as total FROM entregas GROUP BY departamento ORDER BY total DESC LIMIT 5'
      ];
      
      const results = await Promise.all(
        queries.map(query => executeQuery(query))
      );
      
      return {
        total: results[0][0].total,
        activas: results[1][0].activas,
        completadas: results[2][0].completadas,
        porUbicacion: results[3],
        porDepartamento: results[4]
      };
      
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

export default EntregaModel;
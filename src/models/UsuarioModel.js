import { executeQuery, executeTransaction } from "../config/database.js";
import bcrypt from "bcrypt";

class UsuarioModel {
  // Validar credenciales de usuario
  static async validarCredenciales(username, password) {
    try {
      const query = `
        SELECT id, username, password_hash, nombre_completo, email, puesto, departamento
        FROM usuarios 
        WHERE username = ? AND activo = TRUE
      `;

      const results = await executeQuery(query, [username]);

      if (results.length === 0) {
        return null;
      }

      const usuario = results[0];
      const passwordValido = await bcrypt.compare(
        password,
        usuario.password_hash
      );

      if (!passwordValido) {
        return null;
      }

      // No devolver el hash de la contraseña
      const { password_hash, ...usuarioSinPassword } = usuario;
      return usuarioSinPassword;
    } catch (error) {
      console.error("Error al validar credenciales:", error);
      throw error;
    }
  }

  // Crear nuevo usuario (solo para administradores)
  static async crearUsuario(datosUsuario) {
    try {
      const {
        username,
        password,
        nombre_completo,
        email,
        puesto,
        departamento,
      } = datosUsuario;

      // Verificar si el usuario ya existe
      const existeUsuario = await executeQuery(
        "SELECT id FROM usuarios WHERE username = ?",
        [username]
      );

      if (existeUsuario.length > 0) {
        throw new Error("El nombre de usuario ya existe");
      }

      // Hashear la contraseña
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const query = `
        INSERT INTO usuarios (
          username, password_hash, nombre_completo, email, puesto, departamento
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        username,
        passwordHash,
        nombre_completo,
        email,
        puesto,
        departamento,
      ]);

      return {
        id: result.insertId,
        username,
        nombre_completo,
        email,
        puesto,
        departamento,
      };
    } catch (error) {
      console.error("Error al crear usuario:", error);
      throw error;
    }
  }

  // Obtener todos los usuarios activos
  static async obtenerUsuarios() {
    try {
      const query = `
        SELECT id, username, nombre_completo, email, puesto, departamento, 
               fecha_creacion, fecha_actualizacion
        FROM usuarios 
        WHERE activo = TRUE
        ORDER BY nombre_completo
      `;

      return await executeQuery(query);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  }

  // Obtener usuario por ID
  static async obtenerPorId(id) {
    try {
      const query = `
        SELECT id, username, nombre_completo, email, puesto, departamento,
               fecha_creacion, fecha_actualizacion
        FROM usuarios 
        WHERE id = ? AND activo = TRUE
      `;

      const results = await executeQuery(query, [id]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error("Error al obtener usuario por ID:", error);
      throw error;
    }
  }

  // Guardar clave pública (PEM) y su fingerprint para un usuario
  static async guardarClavePublica(id, publicKeyPem, fingerprint) {
    try {
      const query = `
        UPDATE usuarios SET public_key = ?, key_fingerprint = ?, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const result = await executeQuery(query, [publicKeyPem, fingerprint, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al guardar clave pública:", error);
      throw error;
    }
  }

  // Obtener clave pública de un usuario
  static async obtenerClavePublica(id) {
    try {
      const query = `SELECT public_key, key_fingerprint FROM usuarios WHERE id = ?`;
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error("Error al obtener clave pública:", error);
      throw error;
    }
  }
}

export default UsuarioModel;

const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { authenticate, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - Obtener lista de usuarios (Solo Admin)
router.get('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const sql = 'SELECT id, nombre, email, tipo_usuario, telefono, direccion, activo, fecha_registro FROM users ORDER BY nombre';
    const users = await db.query(sql);
    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/users/vendedores - Obtener lista de vendedores (Admin)
router.get('/vendedores', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const sql = 'SELECT id, nombre, email, telefono FROM users WHERE tipo_usuario = "Vendedor" AND activo = 1 ORDER BY nombre';
    const vendedores = await db.query(sql);
    res.json(vendedores);
  } catch (error) {
    console.error('Error obteniendo vendedores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/users/:id - Obtener perfil de usuario
router.get('/:id', authenticate, authorizeOwnerOrAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/users/:id - Actualizar usuario (Solo Admin)
router.put('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const { nombre, email, tipo_usuario, telefono, direccion, activo, password } = req.body;

    // Verificar que el usuario existe
    const existingUser = await db.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar email único si cambió
    if (email && email !== existingUser.email) {
      const emailExists = await db.getUserByEmail(email);
      if (emailExists) {
        return res.status(409).json({ error: 'El email ya está en uso' });
      }
    }

    // Construir query de actualización
    let updateFields = [];
    let updateValues = [];

    if (nombre) {
      updateFields.push('nombre = ?');
      updateValues.push(nombre);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (tipo_usuario) {
      updateFields.push('tipo_usuario = ?');
      updateValues.push(tipo_usuario);
    }
    if (telefono !== undefined) {
      updateFields.push('telefono = ?');
      updateValues.push(telefono);
    }
    if (direccion !== undefined) {
      updateFields.push('direccion = ?');
      updateValues.push(direccion);
    }
    if (activo !== undefined) {
      updateFields.push('activo = ?');
      updateValues.push(activo ? 1 : 0);
    }

    // Si se proporciona nueva contraseña, hashearla
    if (password && password.length >= 6) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    // Agregar ID al final
    updateValues.push(userId);

    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.query(sql, updateValues);

    const updatedUser = await db.getUserById(userId);

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/users/:id/status - Cambiar estado de usuario (Solo Admin)
router.patch('/:id/status', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { activo } = req.body;

    if (isNaN(userId) || typeof activo !== 'boolean') {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const existingUser = await db.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const sql = 'UPDATE users SET activo = ? WHERE id = ?';
    await db.query(sql, [activo ? 1 : 0, userId]);

    const updatedUser = await db.getUserById(userId);

    res.json({
      message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error cambiando estado de usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/users/:id - Eliminar usuario (Solo Admin)
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar que el usuario existe
    const existingUser = await db.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Prevenir que se elimine a sí mismo
    if (userId === req.user.id) {
      return res.status(403).json({ error: 'No puedes eliminar tu propio usuario' });
    }

    // Eliminar usuario
    const sql = 'DELETE FROM users WHERE id = ?';
    await db.query(sql, [userId]);

    res.json({
      message: 'Usuario eliminado exitosamente',
      userId: userId
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
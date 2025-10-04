const express = require('express');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/admin/migrate-fcm - Agregar columna fcm_token (solo admin)
router.post('/migrate-fcm', authenticate, authorize('Admin'), async (req, res) => {
  try {
    // Verificar si la columna ya existe
    const checkColumn = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'fcm_token'
    `);

    if (checkColumn && checkColumn.length > 0) {
      return res.json({
        success: true,
        message: 'La columna fcm_token ya existe en la tabla users'
      });
    }

    // Agregar columna
    await db.query('ALTER TABLE users ADD COLUMN fcm_token VARCHAR(255) NULL AFTER activo');

    // Crear índice
    await db.query('CREATE INDEX idx_fcm_token ON users(fcm_token)');

    res.json({
      success: true,
      message: 'Migración completada: columna fcm_token agregada correctamente'
    });
  } catch (error) {
    console.error('Error en migración FCM:', error);
    res.status(500).json({
      success: false,
      error: 'Error ejecutando migración: ' + error.message
    });
  }
});

module.exports = router;

const express = require('express');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/stats/dashboard - Obtener estadísticas para el dashboard del admin
router.get('/dashboard', authenticate, authorize('Admin'), async (req, res) => {
  try {
    // 1. Total de usuarios
    const usersResult = await db.query('SELECT COUNT(*) as total FROM users');
    const totalUsuarios = usersResult[0].total;

    // 2. Total de productos
    const productsResult = await db.query('SELECT COUNT(*) as total FROM products');
    const totalProductos = productsResult[0].total;

    // 3. Pedidos de hoy
    const ordersResult = await db.query(
      'SELECT COUNT(*) as total FROM orders WHERE DATE(fecha_pedido) = CURDATE()'
    );
    const pedidosHoy = ordersResult[0].total;

    // 4. Ventas de hoy (suma del total de pedidos de hoy)
    const salesResult = await db.query(
      'SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE DATE(fecha_pedido) = CURDATE()'
    );
    const ventasHoy = salesResult[0].total;

    // 5. Pedidos de ayer para calcular crecimiento
    const ordersYesterdayResult = await db.query(
      'SELECT COUNT(*) as total FROM orders WHERE DATE(fecha_pedido) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)'
    );
    const pedidosAyer = ordersYesterdayResult[0].total;

    // 6. Ventas de ayer para calcular crecimiento
    const salesYesterdayResult = await db.query(
      'SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE DATE(fecha_pedido) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)'
    );
    const ventasAyer = salesYesterdayResult[0].total;

    // 7. Usuarios del mes pasado para calcular crecimiento
    const usersLastMonthResult = await db.query(
      'SELECT COUNT(*) as total FROM users WHERE fecha_registro < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)'
    );
    const usuariosMesAnterior = usersLastMonthResult[0].total;

    // Calcular porcentajes de crecimiento
    const crecimientoUsuarios = usuariosMesAnterior > 0
      ? ((totalUsuarios - usuariosMesAnterior) / usuariosMesAnterior * 100).toFixed(1)
      : 0;

    const crecimientoVentas = ventasAyer > 0
      ? ((ventasHoy - ventasAyer) / ventasAyer * 100).toFixed(1)
      : (ventasHoy > 0 ? 100 : 0);

    // Retornar estadísticas
    res.json({
      totalUsuarios,
      totalProductos,
      pedidosHoy,
      ventasHoy: parseFloat(ventasHoy).toFixed(2),
      crecimientoUsuarios: parseFloat(crecimientoUsuarios),
      crecimientoVentas: parseFloat(crecimientoVentas),
      // Datos adicionales para referencia
      pedidosAyer,
      ventasAyer: parseFloat(ventasAyer).toFixed(2)
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

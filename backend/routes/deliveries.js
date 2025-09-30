const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Esquema de validación para actualizar ubicación
const locationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  ubicacion: Joi.string().optional()
});

// GET /api/deliveries - Obtener entregas del vendedor
router.get('/', authenticate, authorize('Vendedor'), async (req, res) => {
  try {
    const deliveries = await db.getDeliveriesByVendedor(req.user.id);
    res.json(deliveries);
  } catch (error) {
    console.error('Error obteniendo entregas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/deliveries/all - Obtener todas las entregas (Solo Admin)
router.get('/all', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const sql = `
      SELECT d.*, o.total, o.direccion_entrega, o.estado as order_estado,
             c.nombre as cliente_nombre, c.telefono as cliente_telefono,
             v.nombre as vendedor_nombre
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      JOIN users c ON o.cliente_id = c.id
      JOIN users v ON d.vendedor_id = v.id
      ORDER BY d.fecha_asignacion DESC
    `;
    
    const allDeliveries = await db.query(sql);
    res.json(allDeliveries);
  } catch (error) {
    console.error('Error obteniendo todas las entregas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/deliveries/:id - Obtener detalles de una entrega específica
router.get('/:id', authenticate, async (req, res) => {
  try {
    const deliveryId = parseInt(req.params.id);
    if (isNaN(deliveryId)) {
      return res.status(400).json({ error: 'ID de entrega inválido' });
    }

    const sql = `
      SELECT d.*, o.total, o.direccion_entrega, o.telefono_contacto, o.notas,
             c.nombre as cliente_nombre, c.telefono as cliente_telefono,
             v.nombre as vendedor_nombre
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      JOIN users c ON o.cliente_id = c.id
      JOIN users v ON d.vendedor_id = v.id
      WHERE d.id = ?
    `;

    const [delivery] = await db.query(sql, [deliveryId]);
    if (!delivery) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    // Verificar permisos
    if (req.user.tipo_usuario === 'Vendedor' && delivery.vendedor_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos para ver esta entrega' });
    }

    res.json(delivery);
  } catch (error) {
    console.error('Error obteniendo detalles de entrega:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/deliveries/:id/location - Actualizar ubicación del vendedor
router.patch('/:id/location', authenticate, authorize('Vendedor'), async (req, res) => {
  try {
    const deliveryId = parseInt(req.params.id);
    
    if (isNaN(deliveryId)) {
      return res.status(400).json({ error: 'ID de entrega inválido' });
    }

    const { error } = locationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { latitude, longitude, ubicacion } = req.body;

    // Verificar que la entrega existe y pertenece al vendedor
    const deliverySql = 'SELECT * FROM deliveries WHERE id = ? AND vendedor_id = ?';
    const [delivery] = await db.query(deliverySql, [deliveryId, req.user.id]);
    
    if (!delivery) {
      return res.status(404).json({ 
        error: 'Entrega no encontrada o no tienes permisos' 
      });
    }

    // Actualizar ubicación
    await db.updateDeliveryLocation(deliveryId, latitude, longitude, ubicacion || 'En ruta');

    // Si es la primera actualización de ubicación, marcar como "En_Camino"
    if (delivery.estado === 'Asignado') {
      const updateStateSql = 'UPDATE deliveries SET estado = "En_Camino", fecha_inicio = NOW() WHERE id = ?';
      await db.query(updateStateSql, [deliveryId]);
    }

    res.json({ 
      message: 'Ubicación actualizada exitosamente',
      latitude,
      longitude,
      ubicacion: ubicacion || 'En ruta'
    });

  } catch (error) {
    console.error('Error actualizando ubicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/deliveries/:id/status - Actualizar estado de entrega
router.patch('/:id/status', authenticate, authorize('Vendedor'), async (req, res) => {
  try {
    const deliveryId = parseInt(req.params.id);
    const { estado, comentarios } = req.body;

    if (isNaN(deliveryId)) {
      return res.status(400).json({ error: 'ID de entrega inválido' });
    }

    const validStates = ['Asignado', 'En_Camino', 'Entregado', 'Fallido'];
    if (!validStates.includes(estado)) {
      return res.status(400).json({ error: 'Estado de entrega inválido' });
    }

    // Verificar que la entrega existe y pertenece al vendedor
    const deliverySql = 'SELECT * FROM deliveries WHERE id = ? AND vendedor_id = ?';
    const [delivery] = await db.query(deliverySql, [deliveryId, req.user.id]);
    
    if (!delivery) {
      return res.status(404).json({ 
        error: 'Entrega no encontrada o no tienes permisos' 
      });
    }

    // Actualizar estado de entrega
    let updateSql = 'UPDATE deliveries SET estado = ?';
    let params = [estado];

    if (comentarios) {
      updateSql += ', comentarios = ?';
      params.push(comentarios);
    }

    if (estado === 'Entregado') {
      updateSql += ', fecha_entrega = NOW()';
      
      // También actualizar el pedido
      const orderUpdateSql = 'UPDATE orders SET estado = "Entregado", fecha_entrega_real = NOW() WHERE id = ?';
      await db.query(orderUpdateSql, [delivery.order_id]);
    }

    updateSql += ' WHERE id = ?';
    params.push(deliveryId);

    await db.query(updateSql, params);

    res.json({ 
      message: 'Estado de entrega actualizado exitosamente',
      estado,
      comentarios
    });

  } catch (error) {
    console.error('Error actualizando estado de entrega:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { authenticate, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { enviarNotificacionNuevoPedido, enviarNotificacionEstadoPedido } = require('../services/emailService');
const { enviarWhatsAppNuevoPedido, enviarWhatsAppEstadoPedido, enviarWhatsAppConfirmacionPedido } = require('../services/whatsappService');
const { notificarNuevoPedidoAdmins, notificarCambioEstadoCliente } = require('../services/pushNotificationService');

const router = express.Router();

// Esquemas de validación
const orderItemSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  cantidad: Joi.number().integer().positive().required(),
  precio_unitario: Joi.number().positive().required()
});

const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  direccion_entrega: Joi.string().min(5).required(),
  telefono_contacto: Joi.string().optional(),
  notas: Joi.string().optional(),
  metodo_pago: Joi.string().valid('efectivo', 'transferencia').optional()
});

// GET /api/orders - Obtener pedidos (filtrados por rol)
router.get('/', authenticate, async (req, res) => {
  try {
    let orders = [];
    
    if (req.user.tipo_usuario === 'Admin') {
      // Admin ve todos los pedidos
      const sql = `
        SELECT o.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono, 
               v.nombre as vendedor_nombre
        FROM orders o 
        JOIN users c ON o.cliente_id = c.id 
        LEFT JOIN users v ON o.vendedor_id = v.id 
        ORDER BY o.fecha_pedido DESC
      `;
      orders = await db.query(sql);
      
    } else if (req.user.tipo_usuario === 'Vendedor') {
      // Vendedor ve sus pedidos asignados
      orders = await db.getOrdersByVendedor(req.user.id);
      
    } else if (req.user.tipo_usuario === 'Cliente') {
      // Cliente ve sus propios pedidos
      orders = await db.getOrdersByUser(req.user.id);
    }

    res.json(orders);
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/orders/pending - Obtener pedidos pendientes (Admin y Vendedor)
router.get('/pending', authenticate, authorize('Admin', 'Vendedor'), async (req, res) => {
  try {
    const sql = `
      SELECT o.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono
      FROM orders o 
      JOIN users c ON o.cliente_id = c.id 
      WHERE o.estado = 'Pendiente' AND o.vendedor_id IS NULL
      ORDER BY o.fecha_pedido ASC
    `;
    
    const pendingOrders = await db.query(sql);
    res.json(pendingOrders);
  } catch (error) {
    console.error('Error obteniendo pedidos pendientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/orders/:id - Obtener detalles de un pedido
router.get('/:id', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'ID de pedido inválido' });
    }

    const orderDetails = await db.getOrderDetails(orderId);
    if (!orderDetails) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Verificar permisos
    if (req.user.tipo_usuario === 'Cliente' && orderDetails.cliente_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos para ver este pedido' });
    }
    
    if (req.user.tipo_usuario === 'Vendedor' && orderDetails.vendedor_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos para ver este pedido' });
    }

    res.json(orderDetails);
  } catch (error) {
    console.error('Error obteniendo detalles del pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/orders - Crear nuevo pedido (Cliente o Admin para testing)
router.post('/', authenticate, async (req, res) => {
  // Verificar que sea Cliente (permitir Admin temporalmente para pruebas)
  if (req.user.tipo_usuario !== 'Cliente' && req.user.tipo_usuario !== 'Admin') {
    return res.status(403).json({
      error: 'Solo clientes pueden crear pedidos',
      userType: req.user.tipo_usuario
    });
  }
  try {
    const { error } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { items, direccion_entrega, telefono_contacto, notas, metodo_pago } = req.body;

    // Validar productos y calcular total
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await db.getProductById(item.product_id);
      if (!product) {
        return res.status(400).json({ 
          error: `Producto con ID ${item.product_id} no encontrado` 
        });
      }

      if (product.stock < item.cantidad) {
        return res.status(400).json({ 
          error: `Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}` 
        });
      }

      const subtotal = item.cantidad * item.precio_unitario;
      total += subtotal;

      validatedItems.push({
        product_id: item.product_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal
      });
    }

    // Crear el pedido
    const orderData = {
      cliente_id: req.user.id,
      total,
      direccion_entrega,
      telefono_contacto: telefono_contacto || req.user.telefono,
      notas,
      metodo_pago: metodo_pago || 'efectivo',
      items: validatedItems
    };

    const orderId = await db.createOrder(orderData);
    const newOrder = await db.getOrderDetails(orderId);

    // Enviar notificación por email al administrador
    enviarNotificacionNuevoPedido(newOrder, req.user)
      .then(result => {
        if (result.success) {
          console.log(`✅ Email de nuevo pedido enviado (ID: ${orderId})`);
        } else {
          console.error(`❌ Error enviando email: ${result.error}`);
        }
      })
      .catch(error => console.error('Error en notificación email:', error));

    // Enviar notificación por WhatsApp al administrador
    enviarWhatsAppNuevoPedido(newOrder, req.user)
      .then(result => {
        if (result.success) {
          console.log(`✅ WhatsApp de nuevo pedido enviado al admin (ID: ${orderId})`);
        } else {
          console.error(`❌ Error enviando WhatsApp al admin: ${result.error}`);
        }
      })
      .catch(error => console.error('Error en notificación WhatsApp admin:', error));

    // Enviar confirmación por WhatsApp al cliente
    enviarWhatsAppConfirmacionPedido(newOrder, req.user)
      .then(result => {
        if (result.success) {
          console.log(`✅ WhatsApp de confirmación enviado al cliente (ID: ${orderId})`);
        } else {
          console.error(`❌ Error enviando WhatsApp al cliente: ${result.error}`);
        }
      })
      .catch(error => console.error('Error en notificación WhatsApp cliente:', error));

    // Enviar notificación push a los admins
    notificarNuevoPedidoAdmins(newOrder, req.user)
      .then(result => {
        if (result.success) {
          console.log(`✅ Notificaciones push enviadas a admins: ${result.successCount || 0} exitosas`);
        } else {
          console.error(`❌ Error enviando push a admins: ${result.error}`);
        }
      })
      .catch(error => console.error('Error en notificación push admins:', error));

    // Emitir notificación al admin (Socket.IO)
    if (req.io) {
      req.io.emit('new_order', {
        orderId,
        cliente: req.user.nombre,
        total,
        items: items.length,
        direccion: direccion_entrega,
        timestamp: new Date()
      });
      console.log(`📢 Notificación Socket.IO de nuevo pedido enviada (ID: ${orderId})`);
    }

    res.status(201).json({
      message: 'Pedido creado exitosamente',
      order: newOrder
    });

  } catch (error) {
    console.error('Error creando pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/orders/:id/assign - Asignar pedido a vendedor (Admin o el mismo vendedor)
router.put('/:id/assign', authenticate, authorize('Admin', 'Vendedor'), async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { vendedor_id } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'ID de pedido inválido' });
    }

    // Si es vendedor, solo puede asignarse a sí mismo
    const finalVendedorId = req.user.tipo_usuario === 'Vendedor' 
      ? req.user.id 
      : vendedor_id || req.user.id;

    // Verificar que el pedido existe y está pendiente
    const orderSql = 'SELECT * FROM orders WHERE id = ? AND estado = "Pendiente"';
    const [existingOrder] = await db.query(orderSql, [orderId]);
    
    if (!existingOrder) {
      return res.status(404).json({ 
        error: 'Pedido no encontrado o ya fue asignado' 
      });
    }

    // Verificar que el vendedor existe
    const vendedor = await db.getUserById(finalVendedorId);
    if (!vendedor || vendedor.tipo_usuario !== 'Vendedor') {
      return res.status(400).json({ error: 'Vendedor no válido' });
    }

    // Asignar pedido
    await db.assignOrderToVendedor(orderId, finalVendedorId);

    // Crear registro de entrega
    await db.createDelivery({
      order_id: orderId,
      vendedor_id: finalVendedorId
    });

    const updatedOrder = await db.getOrderDetails(orderId);

    // Emitir notificación al vendedor asignado
    if (req.io) {
      req.io.emit(`order_assigned_${finalVendedorId}`, {
        orderId,
        cliente: existingOrder.direccion_entrega,
        total: existingOrder.total,
        direccion: existingOrder.direccion_entrega,
        timestamp: new Date()
      });
      console.log(`📢 Notificación de pedido asignado enviada al vendedor ${finalVendedorId}`);
    }

    res.json({
      message: 'Pedido asignado exitosamente',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error asignando pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/orders/:id/status - Actualizar estado del pedido
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { estado } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'ID de pedido inválido' });
    }

    const validStates = ['Pendiente', 'Confirmado', 'En_Preparacion', 'En_Camino', 'Entregado', 'Cancelado'];
    if (!validStates.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    // Obtener pedido actual
    const orderDetails = await db.getOrderDetails(orderId);
    if (!orderDetails) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Verificar permisos
    if (req.user.tipo_usuario === 'Cliente') {
      // Cliente solo puede cancelar sus propios pedidos pendientes
      if (orderDetails.cliente_id !== req.user.id || estado !== 'Cancelado' || orderDetails.estado !== 'Pendiente') {
        return res.status(403).json({ error: 'No tienes permisos para esta acción' });
      }
    } else if (req.user.tipo_usuario === 'Vendedor') {
      // Vendedor solo puede actualizar pedidos asignados a él
      if (orderDetails.vendedor_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permisos para este pedido' });
      }
    }

    // Actualizar estado
    await db.updateOrderStatus(orderId, estado);

    // Si se marca como entregado, actualizar la entrega
    if (estado === 'Entregado') {
      const deliverySql = 'UPDATE deliveries SET estado = "Entregado", fecha_entrega = NOW() WHERE order_id = ?';
      await db.query(deliverySql, [orderId]);

      const orderUpdateSql = 'UPDATE orders SET fecha_entrega_real = NOW() WHERE id = ?';
      await db.query(orderUpdateSql, [orderId]);
    }

    const updatedOrder = await db.getOrderDetails(orderId);

    // Enviar notificación por email al cliente sobre el cambio de estado
    const cliente = await db.getUserById(orderDetails.cliente_id);
    if (cliente && cliente.email) {
      enviarNotificacionEstadoPedido(updatedOrder, cliente, estado)
        .then(result => {
          if (result.success) {
            console.log(`✅ Email de cambio de estado enviado al cliente (Pedido #${orderId})`);
          } else {
            console.error(`❌ Error enviando email al cliente: ${result.error}`);
          }
        })
        .catch(error => console.error('Error en notificación de estado:', error));

      // Enviar notificación por WhatsApp al cliente sobre el cambio de estado
      enviarWhatsAppEstadoPedido(updatedOrder, cliente, estado)
        .then(result => {
          if (result.success) {
            console.log(`✅ WhatsApp de cambio de estado enviado al cliente (Pedido #${orderId})`);
          } else {
            console.error(`❌ Error enviando WhatsApp al cliente: ${result.error}`);
          }
        })
        .catch(error => console.error('Error en notificación WhatsApp de estado:', error));

      // Enviar notificación push al cliente sobre el cambio de estado
      notificarCambioEstadoCliente(updatedOrder, cliente, estado)
        .then(result => {
          if (result.success) {
            console.log(`✅ Notificación push enviada al cliente (Pedido #${orderId})`);
          } else {
            console.error(`❌ Error enviando push al cliente: ${result.error}`);
          }
        })
        .catch(error => console.error('Error en notificación push de estado:', error));
    }

    // Emitir notificación al admin cuando el estado cambia
    if (req.io) {
      req.io.emit('order_status_updated', {
        orderId,
        estado,
        vendedor: req.user.nombre,
        cliente: orderDetails.cliente_nombre || 'Cliente',
        timestamp: new Date()
      });
      console.log(`📢 Notificación de cambio de estado enviada (Pedido #${orderId}: ${estado})`);
    }

    res.json({
      message: 'Estado del pedido actualizado',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error actualizando estado del pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
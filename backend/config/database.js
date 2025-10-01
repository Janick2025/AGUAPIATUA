const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'agua_piatua',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  async query(sql, params = []) {
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async getConnection() {
    return await this.pool.getConnection();
  }

  // Métodos específicos para usuarios
  async getUserById(id) {
    const sql = 'SELECT id, nombre, email, tipo_usuario, telefono, direccion, activo FROM users WHERE id = ?';
    const results = await this.query(sql, [id]);
    return results[0];
  }

  async getUserByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await this.query(sql, [email]);
    return results[0];
  }

  async createUser(userData) {
    const sql = 'INSERT INTO users (nombre, email, password, tipo_usuario, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [userData.nombre, userData.email, userData.password, userData.tipo_usuario, userData.telefono, userData.direccion];
    const result = await this.query(sql, params);
    return result.insertId;
  }

  // Métodos específicos para productos
  async getAllProducts() {
    const sql = 'SELECT * FROM products WHERE activo = 1 ORDER BY nombre';
    return await this.query(sql);
  }

  async getProductById(id) {
    const sql = 'SELECT * FROM products WHERE id = ? AND activo = 1';
    const results = await this.query(sql, [id]);
    return results[0];
  }

  async updateProductStock(productId, newStock) {
    const sql = 'UPDATE products SET stock = ? WHERE id = ?';
    return await this.query(sql, [newStock, productId]);
  }

  // Métodos específicos para pedidos
  async createOrder(orderData) {
    const connection = await this.getConnection();
    try {
      await connection.beginTransaction();

      // Crear el pedido
      const orderSql = 'INSERT INTO orders (cliente_id, total, direccion_entrega, telefono_contacto, notas, metodo_pago) VALUES (?, ?, ?, ?, ?, ?)';
      const [orderResult] = await connection.execute(orderSql, [
        orderData.cliente_id,
        orderData.total,
        orderData.direccion_entrega,
        orderData.telefono_contacto,
        orderData.notas,
        orderData.metodo_pago || 'efectivo'
      ]);

      const orderId = orderResult.insertId;

      // Agregar items del pedido
      for (const item of orderData.items) {
        const itemSql = 'INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)';
        await connection.execute(itemSql, [
          orderId,
          item.product_id,
          item.cantidad,
          item.precio_unitario,
          item.subtotal
        ]);

        // Actualizar stock
        const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
        await connection.execute(updateStockSql, [item.cantidad, item.product_id]);
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getOrdersByUser(userId) {
    const sql = `
      SELECT o.*, u.nombre as vendedor_nombre 
      FROM orders o 
      LEFT JOIN users u ON o.vendedor_id = u.id 
      WHERE o.cliente_id = ? 
      ORDER BY o.fecha_pedido DESC
    `;
    return await this.query(sql, [userId]);
  }

  async getOrdersByVendedor(vendedorId) {
    const sql = `
      SELECT o.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono
      FROM orders o 
      JOIN users c ON o.cliente_id = c.id 
      WHERE o.vendedor_id = ? 
      ORDER BY o.fecha_pedido DESC
    `;
    return await this.query(sql, [vendedorId]);
  }

  async getOrderDetails(orderId) {
    const orderSql = `
      SELECT o.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono, v.nombre as vendedor_nombre
      FROM orders o 
      JOIN users c ON o.cliente_id = c.id 
      LEFT JOIN users v ON o.vendedor_id = v.id 
      WHERE o.id = ?
    `;
    
    const itemsSql = `
      SELECT oi.*, p.nombre as producto_nombre, p.imagen as producto_imagen
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `;

    const [order] = await this.query(orderSql, [orderId]);
    const items = await this.query(itemsSql, [orderId]);

    return { ...order, items };
  }

  async assignOrderToVendedor(orderId, vendedorId) {
    const sql = 'UPDATE orders SET vendedor_id = ?, estado = "Confirmado" WHERE id = ?';
    return await this.query(sql, [vendedorId, orderId]);
  }

  async updateOrderStatus(orderId, estado) {
    const sql = 'UPDATE orders SET estado = ? WHERE id = ?';
    return await this.query(sql, [estado, orderId]);
  }

  // Métodos específicos para entregas
  async createDelivery(deliveryData) {
    const sql = 'INSERT INTO deliveries (order_id, vendedor_id, estado) VALUES (?, ?, ?)';
    const result = await this.query(sql, [deliveryData.order_id, deliveryData.vendedor_id, 'Asignado']);
    return result.insertId;
  }

  async updateDeliveryLocation(deliveryId, latitude, longitude, ubicacion) {
    const sql = 'UPDATE deliveries SET latitud = ?, longitud = ?, ubicacion_actual = ? WHERE id = ?';
    return await this.query(sql, [latitude, longitude, ubicacion, deliveryId]);
  }

  async getDeliveriesByVendedor(vendedorId) {
    const sql = `
      SELECT d.*, o.total, o.direccion_entrega, c.nombre as cliente_nombre, c.telefono as cliente_telefono
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      JOIN users c ON o.cliente_id = c.id
      WHERE d.vendedor_id = ?
      ORDER BY d.fecha_asignacion DESC
    `;
    return await this.query(sql, [vendedorId]);
  }

  // Método para cerrar conexiones
  async close() {
    await this.pool.end();
  }
}

module.exports = new Database();
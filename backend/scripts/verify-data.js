const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyData() {
  let connection;
  
  try {
    console.log('🔍 Conectando a la base de datos...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'agua_piatua'
    });

    console.log('✅ Conexión establecida\n');

    // 1. Verificar usuarios
    console.log('👥 USUARIOS:');
    console.log('═'.repeat(80));
    const [users] = await connection.query('SELECT id, nombre, email, tipo_usuario, telefono FROM users');
    users.forEach(user => {
      console.log(`ID: ${user.id} | ${user.nombre} | ${user.email} | ${user.tipo_usuario} | ${user.telefono || 'Sin teléfono'}`);
    });
    console.log(`Total usuarios: ${users.length}\n`);

    // 2. Verificar productos
    console.log('📦 PRODUCTOS:');
    console.log('═'.repeat(80));
    const [products] = await connection.query('SELECT id, nombre, precio, stock, categoria FROM products WHERE activo = 1');
    products.forEach(product => {
      console.log(`ID: ${product.id} | ${product.nombre} | $${product.precio} | Stock: ${product.stock} | ${product.categoria || 'Sin categoría'}`);
    });
    console.log(`Total productos: ${products.length}\n`);

    // 3. Verificar pedidos
    console.log('📋 PEDIDOS:');
    console.log('═'.repeat(80));
    const [orders] = await connection.query(`
      SELECT o.id, o.total, o.estado, o.fecha_pedido, u.nombre as cliente 
      FROM orders o 
      JOIN users u ON o.cliente_id = u.id 
      ORDER BY o.fecha_pedido DESC
    `);
    if (orders.length > 0) {
      orders.forEach(order => {
        console.log(`ID: ${order.id} | Cliente: ${order.cliente} | Total: $${order.total} | Estado: ${order.estado} | ${order.fecha_pedido}`);
      });
    } else {
      console.log('No hay pedidos registrados');
    }
    console.log(`Total pedidos: ${orders.length}\n`);

    // 4. Verificar entregas
    console.log('🚚 ENTREGAS:');
    console.log('═'.repeat(80));
    const [deliveries] = await connection.query(`
      SELECT d.id, d.estado, d.fecha_asignacion, v.nombre as vendedor 
      FROM deliveries d 
      JOIN users v ON d.vendedor_id = v.id 
      ORDER BY d.fecha_asignacion DESC
    `);
    if (deliveries.length > 0) {
      deliveries.forEach(delivery => {
        console.log(`ID: ${delivery.id} | Vendedor: ${delivery.vendedor} | Estado: ${delivery.estado} | ${delivery.fecha_asignacion}`);
      });
    } else {
      console.log('No hay entregas registradas');
    }
    console.log(`Total entregas: ${deliveries.length}\n`);

    // 5. Verificar estructura de tablas
    console.log('🗄️ TABLAS DE LA BASE DE DATOS:');
    console.log('═'.repeat(80));
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
      const tableName = table[`Tables_in_${process.env.DB_NAME || 'agua_piatua'}`];
      console.log(`📋 ${tableName}`);
    });
    console.log(`Total tablas: ${tables.length}\n`);

    console.log('🎉 Verificación completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyData();
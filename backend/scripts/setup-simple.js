const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDatabaseSimple() {
  let connection;
  
  try {
    console.log('🔄 Iniciando configuración simple de base de datos...');

    // Conectar a MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('✅ Conexión a MySQL establecida');

    // Crear y usar base de datos
    await connection.query('CREATE DATABASE IF NOT EXISTS agua_piatua');
    await connection.query('USE agua_piatua');
    console.log('✅ Base de datos agua_piatua creada/seleccionada');

    // Crear tablas una por una con query simple
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        tipo_usuario VARCHAR(20) NOT NULL,
        telefono VARCHAR(20),
        direccion TEXT,
        activo BOOLEAN DEFAULT TRUE,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10,2) NOT NULL,
        stock INT DEFAULT 0,
        imagen VARCHAR(255),
        categoria VARCHAR(50),
        activo BOOLEAN DEFAULT TRUE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NOT NULL,
        vendedor_id INT NULL,
        total DECIMAL(10,2) NOT NULL,
        estado VARCHAR(20) DEFAULT 'Pendiente',
        direccion_entrega TEXT NOT NULL,
        telefono_contacto VARCHAR(20),
        notas TEXT,
        fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_entrega_estimada DATETIME,
        fecha_entrega_real DATETIME NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        vendedor_id INT NOT NULL,
        estado VARCHAR(20) DEFAULT 'Asignado',
        ubicacion_actual VARCHAR(255),
        latitud DECIMAL(10,8),
        longitud DECIMAL(11,8),
        comentarios TEXT,
        fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_inicio DATETIME NULL,
        fecha_entrega DATETIME NULL
      )
    `);

    console.log('✅ Todas las tablas creadas');

    // Insertar productos si no existen
    const [productCount] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (productCount[0].count === 0) {
      await connection.query(`
        INSERT INTO products (nombre, descripcion, precio, stock, imagen, categoria) VALUES
        ('Agua Purificada 1L', 'Botella de agua purificada de 1 litro', 2.50, 100, '/litro.jpg', 'Botellas'),
        ('Agua Purificada 12U', 'Pack de 12 botellas de agua purificada', 25.00, 50, '/12U.jpg', 'Packs'),
        ('Garrafón 20L', 'Garrafón de agua purificada de 20 litros', 15.00, 30, '/garrafon.webp', 'Garrafones'),
        ('Garrafa 5L', 'Garrafa de agua purificada de 5 litros', 8.00, 40, '/garrafa.jpg', 'Garrafas'),
        ('Hielo 2kg', 'Bolsa de hielo de 2 kilogramos', 5.00, 25, '/hielo.jpg', 'Hielo'),
        ('Six Pack Premium', 'Six pack de botellas premium 500ml', 18.00, 35, '/Six_Pag.jpg', 'Packs')
      `);
      console.log('✅ Productos iniciales insertados');
    }

    // Insertar usuarios si no existen
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userCount[0].count === 0) {
      const adminPass = await bcrypt.hash('admin123', 12);
      const vendedorPass = await bcrypt.hash('vendedor123', 12);
      const clientePass = await bcrypt.hash('cliente123', 12);

      await connection.query(`
        INSERT INTO users (nombre, email, password, tipo_usuario, telefono, direccion) VALUES
        ('Admin Sistema', 'admin@aguapiatua.com', ?, 'Admin', '555-0001', 'Oficina Central'),
        ('Juan Pérez', 'vendedor@aguapiatua.com', ?, 'Vendedor', '555-0002', 'Zona Norte'),
        ('María González', 'cliente@example.com', ?, 'Cliente', '555-0003', 'Av. Principal 123')
      `, [adminPass, vendedorPass, clientePass]);
      
      console.log('✅ Usuarios de prueba creados');
    }

    console.log('');
    console.log('🎉 ¡Base de datos configurada exitosamente!');
    console.log('');
    console.log('📋 Usuarios de prueba:');
    console.log('   👤 Admin: admin@aguapiatua.com / admin123');
    console.log('   🚚 Vendedor: vendedor@aguapiatua.com / vendedor123');
    console.log('   🛒 Cliente: cliente@example.com / cliente123');
    console.log('');
    console.log('🚀 Ya puedes iniciar el servidor!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabaseSimple();
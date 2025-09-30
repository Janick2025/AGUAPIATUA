const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDatabaseManual() {
  let connection;
  
  try {
    console.log('🔄 Iniciando configuración manual de base de datos...');

    // Conectar a MySQL sin especificar base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD
    });

    console.log('✅ Conexión a MySQL establecida');

    // 1. Crear base de datos
    await connection.execute('CREATE DATABASE IF NOT EXISTS agua_piatua');
    await connection.execute('USE agua_piatua');
    console.log('✅ Base de datos agua_piatua creada/seleccionada');

    // 2. Crear tabla users
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        tipo_usuario ENUM('Cliente', 'Vendedor', 'Admin') NOT NULL,
        telefono VARCHAR(20),
        direccion TEXT,
        activo BOOLEAN DEFAULT TRUE,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla users creada');

    // 3. Crear tabla products
    await connection.execute(`
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
    console.log('✅ Tabla products creada');

    // 4. Crear tabla orders
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NOT NULL,
        vendedor_id INT NULL,
        total DECIMAL(10,2) NOT NULL,
        estado ENUM('Pendiente', 'Confirmado', 'En_Preparacion', 'En_Camino', 'Entregado', 'Cancelado') DEFAULT 'Pendiente',
        direccion_entrega TEXT NOT NULL,
        telefono_contacto VARCHAR(20),
        notas TEXT,
        fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_entrega_estimada DATETIME,
        fecha_entrega_real DATETIME NULL,
        FOREIGN KEY (cliente_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (vendedor_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Tabla orders creada');

    // 5. Crear tabla order_items
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla order_items creada');

    // 6. Crear tabla deliveries
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        vendedor_id INT NOT NULL,
        estado ENUM('Asignado', 'En_Camino', 'Entregado', 'Fallido') DEFAULT 'Asignado',
        ubicacion_actual VARCHAR(255),
        latitud DECIMAL(10,8),
        longitud DECIMAL(11,8),
        comentarios TEXT,
        fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_inicio DATETIME NULL,
        fecha_entrega DATETIME NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (vendedor_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla deliveries creada');

    // 7. Crear tabla user_sessions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla user_sessions creada');

    // 8. Crear tabla inventory_movements
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        tipo_movimiento ENUM('Entrada', 'Salida', 'Ajuste') NOT NULL,
        cantidad INT NOT NULL,
        referencia VARCHAR(100),
        usuario_id INT NOT NULL,
        motivo TEXT,
        fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla inventory_movements creada');

    // 9. Insertar productos iniciales
    const checkProducts = await connection.execute('SELECT COUNT(*) as count FROM products');
    if (checkProducts[0][0].count === 0) {
      await connection.execute(`
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

    // 10. Insertar usuarios de prueba
    const checkUsers = await connection.execute('SELECT COUNT(*) as count FROM users');
    if (checkUsers[0][0].count === 0) {
      const hashedPasswordAdmin = await bcrypt.hash('admin123', 12);
      const hashedPasswordVendedor = await bcrypt.hash('vendedor123', 12);
      const hashedPasswordCliente = await bcrypt.hash('cliente123', 12);

      await connection.execute(`
        INSERT INTO users (nombre, email, password, tipo_usuario, telefono, direccion) VALUES
        (?, ?, ?, 'Admin', '555-0001', 'Oficina Central'),
        (?, ?, ?, 'Vendedor', '555-0002', 'Zona Norte'),
        (?, ?, ?, 'Cliente', '555-0003', 'Av. Principal 123')
      `, [
        'Admin Sistema', 'admin@aguapiatua.com', hashedPasswordAdmin,
        'Juan Pérez', 'vendedor@aguapiatua.com', hashedPasswordVendedor,
        'María González', 'cliente@example.com', hashedPasswordCliente
      ]);
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
    console.log('🚀 Ahora puedes iniciar el servidor con: npm run dev');

  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabaseManual();
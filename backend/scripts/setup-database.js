const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Iniciando configuración de base de datos...');

    // Conectar sin especificar base de datos para crearla
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD
    });

    console.log('✅ Conexión a MySQL establecida');

    // Leer el archivo schema.sql
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Dividir en statements individuales y ejecutar
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.toLowerCase().includes('use ')) {
        continue; // Saltamos USE statements
      }
      try {
        await connection.query(statement);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`Ejecutando: ${statement.substring(0, 50)}...`);
          throw error;
        }
      }
    }

    console.log('✅ Esquema de base de datos creado');

    // Reconectarse usando la base de datos creada
    await connection.end();
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'agua_piatua'
    });

    // Crear contraseñas hasheadas para usuarios de prueba
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 12);
    const hashedPasswordVendedor = await bcrypt.hash('vendedor123', 12);
    const hashedPasswordCliente = await bcrypt.hash('cliente123', 12);

    // Actualizar contraseñas de usuarios de prueba
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPasswordAdmin, 'admin@aguapiatua.com']
    );
    
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?', 
      [hashedPasswordVendedor, 'vendedor@aguapiatua.com']
    );
    
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPasswordCliente, 'cliente@example.com']
    );

    console.log('✅ Usuarios de prueba configurados con contraseñas hasheadas');
    console.log('');
    console.log('🎉 ¡Base de datos configurada exitosamente!');
    console.log('');
    console.log('📋 Usuarios de prueba creados:');
    console.log('   👤 Admin: admin@aguapiatua.com / admin123');
    console.log('   🚚 Vendedor: vendedor@aguapiatua.com / vendedor123');
    console.log('   🛒 Cliente: cliente@example.com / cliente123');
    console.log('');
    console.log('🚀 Ahora puedes iniciar el servidor con: npm run dev');

  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Verifica las credenciales de MySQL en el archivo .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Verifica que MySQL esté ejecutándose');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
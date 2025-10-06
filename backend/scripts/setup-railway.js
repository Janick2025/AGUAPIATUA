const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupRailway() {
  let connection;

  try {
    console.log('🚂 Iniciando configuración de Railway MySQL...');
    console.log('');

    // Conectar a Railway MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conexión a Railway MySQL establecida');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log('');

    // Leer el archivo SQL de Railway
    const sqlPath = path.join(__dirname, '..', '..', 'database', 'railway-setup.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir en statements individuales
    // Primero eliminar comentarios de línea completa
    const lines = sqlContent.split('\n');
    const cleanedLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('--');
    });
    const cleanedContent = cleanedLines.join('\n');

    // Ahora dividir por punto y coma
    const statements = cleanedContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📋 Ejecutando ${statements.length} statements SQL...`);
    console.log('');

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await connection.query(statement);

        // Mostrar progreso
        if (statement.toLowerCase().includes('create table')) {
          const tableName = statement.match(/create table (?:if not exists )?(\w+)/i)?.[1];
          console.log(`✅ Tabla creada: ${tableName}`);
        } else if (statement.toLowerCase().includes('insert into')) {
          const tableName = statement.match(/insert into (\w+)/i)?.[1];
          console.log(`✅ Datos insertados en: ${tableName}`);
        }
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Ya existe (saltando)`);
        } else {
          console.error(`❌ Error en statement ${i + 1}:`, error.message);
          throw error;
        }
      }
    }

    console.log('');
    console.log('✅ Schema creado exitosamente');
    console.log('');

    // Actualizar contraseñas con bcrypt (las del SQL son placeholders)
    console.log('🔐 Generando contraseñas hasheadas...');
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 12);
    const hashedPasswordVendedor = await bcrypt.hash('vendedor123', 12);
    const hashedPasswordCliente = await bcrypt.hash('cliente123', 12);

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

    console.log('✅ Contraseñas actualizadas');
    console.log('');
    console.log('🎉 ¡Base de datos de Railway configurada exitosamente!');
    console.log('');
    console.log('📋 Usuarios de prueba:');
    console.log('   👤 Admin: admin@aguapiatua.com / admin123');
    console.log('   🚚 Vendedor: vendedor@aguapiatua.com / vendedor123');
    console.log('   🛒 Cliente: cliente@example.com / cliente123');
    console.log('');
    console.log('🚀 Tu aplicación ya está lista para usarse en producción!');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error configurando Railway MySQL:', error.message);
    console.error('');

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Verifica las credenciales de Railway en las variables de entorno');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('💡 Verifica que las variables de Railway estén correctamente configuradas');
      console.error('   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME');
    } else if (error.code === 'ENOTFOUND') {
      console.error('💡 No se puede resolver el host de Railway. Verifica DB_HOST');
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📡 Conexión cerrada');
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupRailway();
}

module.exports = setupRailway;

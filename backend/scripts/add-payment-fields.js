const mysql = require('mysql2/promise');
require('dotenv').config();

async function addPaymentFields() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('✅ Conectado a la base de datos');

  try {
    // Verificar si las columnas ya existen
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'orders' 
        AND COLUMN_NAME IN ('metodo_pago', 'comprobante_pago')
    `, [process.env.DB_NAME]);

    const existingColumns = columns.map(c => c.COLUMN_NAME);
    
    if (!existingColumns.includes('metodo_pago')) {
      await connection.execute(`
        ALTER TABLE orders 
        ADD COLUMN metodo_pago VARCHAR(20) DEFAULT 'efectivo'
      `);
      console.log('✅ Campo metodo_pago agregado');
    } else {
      console.log('ℹ️  Campo metodo_pago ya existe');
    }

    if (!existingColumns.includes('comprobante_pago')) {
      await connection.execute(`
        ALTER TABLE orders 
        ADD COLUMN comprobante_pago VARCHAR(255) NULL
      `);
      console.log('✅ Campo comprobante_pago agregado');
    } else {
      console.log('ℹ️  Campo comprobante_pago ya existe');
    }

    // Mostrar estructura actualizada
    const [describe] = await connection.execute('DESCRIBE orders');
    console.log('\n📋 Estructura de la tabla orders:');
    console.table(describe);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

addPaymentFields();

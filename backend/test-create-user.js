const axios = require('axios');

async function testCreateUser() {
  try {
    // Primero hacer login como admin
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@aguapiatua.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login exitoso, token:', token.substring(0, 20) + '...');

    // Intentar crear un usuario Admin
    const createRes = await axios.post('http://localhost:3001/api/auth/register', {
      nombre: 'Test Admin',
      email: 'testadmin@test.com',
      password: 'test123456',
      tipo_usuario: 'Admin'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Usuario creado:', createRes.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testCreateUser();

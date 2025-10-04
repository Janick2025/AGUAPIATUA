const admin = require('firebase-admin');
const db = require('../config/database');

// Inicializar Firebase Admin
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) return;

  try {
    // Verificar si existe la configuración
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.warn('⚠️ Firebase no configurado. Las notificaciones push no estarán disponibles.');
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando Firebase Admin:', error.message);
  }
}

// Enviar notificación push a un dispositivo específico
async function enviarNotificacionPush(token, titulo, mensaje, data = {}) {
  if (!firebaseInitialized) {
    initializeFirebase();
    if (!firebaseInitialized) {
      return { success: false, error: 'Firebase no inicializado' };
    }
  }

  try {
    const message = {
      notification: {
        title: titulo,
        body: mensaje,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      token: token,
      android: {
        notification: {
          sound: 'default',
          channelId: 'pedidos',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notificación push enviada:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Error enviando notificación push:', error);
    return { success: false, error: error.message };
  }
}

// Enviar notificación push a múltiples dispositivos
async function enviarNotificacionPushMultiple(tokens, titulo, mensaje, data = {}) {
  if (!firebaseInitialized) {
    initializeFirebase();
    if (!firebaseInitialized) {
      return { success: false, error: 'Firebase no inicializado' };
    }
  }

  try {
    const message = {
      notification: {
        title: titulo,
        body: mensaje,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      tokens: tokens,
      android: {
        notification: {
          sound: 'default',
          channelId: 'pedidos',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ Notificaciones push enviadas: ${response.successCount}/${tokens.length}`);
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('❌ Error enviando notificaciones push múltiples:', error);
    return { success: false, error: error.message };
  }
}

// Enviar notificación de nuevo pedido a todos los admins
async function notificarNuevoPedidoAdmins(pedido, cliente) {
  try {
    // Obtener tokens de dispositivos de los admins
    const sql = 'SELECT fcm_token FROM users WHERE tipo_usuario = "Admin" AND fcm_token IS NOT NULL';
    const admins = await db.query(sql);

    if (!admins || admins.length === 0) {
      console.log('⚠️ No hay admins con tokens FCM registrados');
      return { success: false, error: 'No hay admins con tokens' };
    }

    const tokens = admins.map(admin => admin.fcm_token).filter(token => token);

    if (tokens.length === 0) {
      console.log('⚠️ No hay tokens válidos de admins');
      return { success: false, error: 'No hay tokens válidos' };
    }

    const titulo = '🛒 Nuevo Pedido Recibido';
    const mensaje = `${cliente.nombre} realizó un pedido de $${pedido.total.toFixed(2)}`;
    const data = {
      tipo: 'nuevo_pedido',
      pedido_id: pedido.id.toString(),
      cliente_nombre: cliente.nombre,
      total: pedido.total.toString(),
    };

    return await enviarNotificacionPushMultiple(tokens, titulo, mensaje, data);
  } catch (error) {
    console.error('❌ Error notificando nuevo pedido a admins:', error);
    return { success: false, error: error.message };
  }
}

// Enviar notificación de cambio de estado al cliente
async function notificarCambioEstadoCliente(pedido, cliente, nuevoEstado) {
  try {
    // Obtener token del cliente
    const sql = 'SELECT fcm_token FROM users WHERE id = ? AND fcm_token IS NOT NULL';
    const results = await db.query(sql, [cliente.id]);

    if (!results || results.length === 0 || !results[0].fcm_token) {
      console.log(`⚠️ Cliente ${cliente.nombre} no tiene token FCM registrado`);
      return { success: false, error: 'Cliente sin token FCM' };
    }

    const token = results[0].fcm_token;

    const estadosEmoji = {
      'Pendiente': '⏳',
      'Confirmado': '✅',
      'En_Preparacion': '📦',
      'En_Camino': '🚚',
      'Entregado': '✅',
      'Cancelado': '❌'
    };

    const estadosTexto = {
      'Pendiente': 'Pendiente',
      'Confirmado': 'Confirmado',
      'En_Preparacion': 'En preparación',
      'En_Camino': 'En camino',
      'Entregado': 'Entregado',
      'Cancelado': 'Cancelado'
    };

    const titulo = `${estadosEmoji[nuevoEstado]} Pedido ${estadosTexto[nuevoEstado]}`;
    const mensaje = `Tu pedido #${pedido.id} está ${estadosTexto[nuevoEstado].toLowerCase()}`;
    const data = {
      tipo: 'cambio_estado',
      pedido_id: pedido.id.toString(),
      estado: nuevoEstado,
    };

    return await enviarNotificacionPush(token, titulo, mensaje, data);
  } catch (error) {
    console.error('❌ Error notificando cambio de estado a cliente:', error);
    return { success: false, error: error.message };
  }
}

// Enviar notificación de pedido asignado al vendedor
async function notificarPedidoAsignadoVendedor(pedido, vendedor) {
  try {
    // Obtener token del vendedor
    const sql = 'SELECT fcm_token FROM users WHERE id = ? AND fcm_token IS NOT NULL';
    const results = await db.query(sql, [vendedor.id]);

    if (!results || results.length === 0 || !results[0].fcm_token) {
      console.log(`⚠️ Vendedor ${vendedor.nombre} no tiene token FCM registrado`);
      return { success: false, error: 'Vendedor sin token FCM' };
    }

    const token = results[0].fcm_token;

    const titulo = '📦 Nuevo Pedido Asignado';
    const mensaje = `Se te asignó el pedido #${pedido.id} - $${pedido.total.toFixed(2)}`;
    const data = {
      tipo: 'pedido_asignado',
      pedido_id: pedido.id.toString(),
      total: pedido.total.toString(),
    };

    return await enviarNotificacionPush(token, titulo, mensaje, data);
  } catch (error) {
    console.error('❌ Error notificando asignación a vendedor:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  initializeFirebase,
  enviarNotificacionPush,
  enviarNotificacionPushMultiple,
  notificarNuevoPedidoAdmins,
  notificarCambioEstadoCliente,
  notificarPedidoAsignadoVendedor,
};

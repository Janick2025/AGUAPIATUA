const twilio = require('twilio');

// Configurar cliente de Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Función para enviar notificación de nuevo pedido por WhatsApp
async function enviarWhatsAppNuevoPedido(pedido, cliente) {
  try {
    const mensaje = `🛒 *NUEVO PEDIDO - Agua Piatua*

📋 *Pedido:* #${pedido.id}

👤 *Cliente:* ${cliente.nombre}
📧 *Email:* ${cliente.email}
📱 *Teléfono:* ${pedido.telefono_contacto || 'No especificado'}
📍 *Dirección:* ${pedido.direccion_entrega}

💰 *Total:* $${pedido.total.toFixed(2)}
💳 *Método de pago:* ${pedido.metodo_pago || 'Efectivo'}

${pedido.notas ? `📝 *Notas:* ${pedido.notas}\n` : ''}
🕐 *Fecha:* ${new Date(pedido.fecha_pedido).toLocaleString('es-ES')}

✅ Ingresa al dashboard para gestionar el pedido.`;

    const message = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${process.env.ADMIN_WHATSAPP_NUMBER}`,
      body: mensaje
    });

    console.log('✅ WhatsApp enviado:', message.sid);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error);
    return { success: false, error: error.message };
  }
}

// Función para enviar notificación de cambio de estado al cliente
async function enviarWhatsAppEstadoPedido(pedido, cliente, nuevoEstado) {
  try {
    const estadosEmoji = {
      'Pendiente': '⏳',
      'Confirmado': '✅',
      'En_Preparacion': '📦',
      'En_Camino': '🚚',
      'Entregado': '✅',
      'Cancelado': '❌'
    };

    const estadosTexto = {
      'Pendiente': 'Pendiente de confirmación',
      'Confirmado': 'Confirmado',
      'En_Preparacion': 'En preparación',
      'En_Camino': 'En camino',
      'Entregado': 'Entregado',
      'Cancelado': 'Cancelado'
    };

    const mensaje = `${estadosEmoji[nuevoEstado]} *Agua Piatua - Actualización de Pedido*

Hola *${cliente.nombre}*,

Tu pedido #${pedido.id} ha sido actualizado:

📊 *Nuevo Estado:* ${estadosTexto[nuevoEstado]}

💰 *Total:* $${pedido.total.toFixed(2)}
📍 *Dirección:* ${pedido.direccion_entrega}

${nuevoEstado === 'En_Camino' ? '🚚 Tu pedido está en camino. ¡Llegará pronto!' : ''}
${nuevoEstado === 'Entregado' ? '✅ ¡Gracias por tu compra! Esperamos que disfrutes de nuestros productos.' : ''}

Cualquier duda, contáctanos.`;

    // Verificar que el cliente tenga teléfono
    const clientPhone = cliente.telefono || pedido.telefono_contacto;
    if (!clientPhone) {
      console.log('⚠️ Cliente sin número de teléfono, WhatsApp no enviado');
      return { success: false, error: 'Cliente sin número de teléfono' };
    }

    // Limpiar número de teléfono (eliminar espacios, guiones, etc)
    const cleanPhone = clientPhone.replace(/[\s\-()]/g, '');

    const message = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${cleanPhone}`,
      body: mensaje
    });

    console.log('✅ WhatsApp de estado enviado al cliente:', message.sid);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('❌ Error enviando WhatsApp de estado:', error);
    return { success: false, error: error.message };
  }
}

// Función para enviar confirmación de pedido al cliente
async function enviarWhatsAppConfirmacionPedido(pedido, cliente) {
  try {
    const mensaje = `✅ *Pedido Confirmado - Agua Piatua*

Hola *${cliente.nombre}*,

¡Tu pedido ha sido recibido con éxito!

📋 *Número de pedido:* #${pedido.id}
💰 *Total:* $${pedido.total.toFixed(2)}
📍 *Dirección de entrega:* ${pedido.direccion_entrega}
💳 *Método de pago:* ${pedido.metodo_pago || 'Efectivo'}

⏳ Tu pedido está siendo procesado. Te notificaremos cuando cambie de estado.

¡Gracias por tu compra! 💧`;

    // Verificar que el cliente tenga teléfono
    const clientPhone = cliente.telefono || pedido.telefono_contacto;
    if (!clientPhone) {
      console.log('⚠️ Cliente sin número de teléfono, confirmación WhatsApp no enviada');
      return { success: false, error: 'Cliente sin número de teléfono' };
    }

    // Limpiar número de teléfono
    const cleanPhone = clientPhone.replace(/[\s\-()]/g, '');

    const message = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${cleanPhone}`,
      body: mensaje
    });

    console.log('✅ WhatsApp de confirmación enviado al cliente:', message.sid);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('❌ Error enviando WhatsApp de confirmación:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  enviarWhatsAppNuevoPedido,
  enviarWhatsAppEstadoPedido,
  enviarWhatsAppConfirmacionPedido
};

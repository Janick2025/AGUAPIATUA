const nodemailer = require('nodemailer');

// Configurar transporter con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Tu email de Gmail
    pass: process.env.EMAIL_PASSWORD // Contraseña de aplicación de Gmail
  }
});

// Función para enviar notificación de nuevo pedido
async function enviarNotificacionNuevoPedido(pedido, cliente) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Email del administrador
      subject: `🛒 Nuevo Pedido #${pedido.id} - Agua Piatua`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0EA5E9, #38BDF8); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">💧 Agua Piatua</h1>
            <h2 style="color: white; margin: 10px 0 0 0;">Nuevo Pedido Recibido</h2>
          </div>

          <div style="padding: 20px; background: #f8f9fa;">
            <h3 style="color: #0EA5E9;">Detalles del Pedido #${pedido.id}</h3>

            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <p><strong>Cliente:</strong> ${cliente.nombre}</p>
              <p><strong>Email:</strong> ${cliente.email}</p>
              <p><strong>Teléfono:</strong> ${pedido.telefono_contacto || 'No especificado'}</p>
              <p><strong>Dirección:</strong> ${pedido.direccion_entrega}</p>
            </div>

            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <p><strong>Total:</strong> <span style="color: #0EA5E9; font-size: 1.5rem; font-weight: bold;">$${pedido.total.toFixed(2)}</span></p>
              <p><strong>Método de pago:</strong> ${pedido.metodo_pago || 'Efectivo'}</p>
              <p><strong>Fecha:</strong> ${new Date(pedido.fecha_pedido).toLocaleString('es-ES')}</p>
            </div>

            ${pedido.notas ? `
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <p><strong>Notas del cliente:</strong></p>
              <p style="font-style: italic; color: #666;">${pedido.notas}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL}/admin-dashboard"
                 style="background: #0EA5E9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Ver en Dashboard
              </a>
            </div>
          </div>

          <div style="background: #1e293b; padding: 15px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 0.9rem;">Agua Piatua - Sistema de Gestión de Pedidos</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { success: false, error: error.message };
  }
}

// Función para enviar notificación de cambio de estado
async function enviarNotificacionEstadoPedido(pedido, cliente, nuevoEstado) {
  try {
    const estadosEmoji = {
      'Pendiente': '⏳',
      'Confirmado': '✅',
      'En_Preparacion': '📦',
      'En_Camino': '🚚',
      'Entregado': '✅',
      'Cancelado': '❌'
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: cliente.email, // Email del cliente
      subject: `${estadosEmoji[nuevoEstado]} Tu pedido #${pedido.id} está ${nuevoEstado.replace('_', ' ')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0EA5E9, #38BDF8); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">💧 Agua Piatua</h1>
            <h2 style="color: white; margin: 10px 0 0 0;">Actualización de tu Pedido</h2>
          </div>

          <div style="padding: 20px; background: #f8f9fa;">
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <h2 style="color: #0EA5E9; margin: 0;">Estado: ${nuevoEstado.replace('_', ' ')}</h2>
              <p style="font-size: 3rem; margin: 10px 0;">${estadosEmoji[nuevoEstado]}</p>
            </div>

            <div style="background: white; padding: 15px; border-radius: 8px;">
              <p><strong>Pedido:</strong> #${pedido.id}</p>
              <p><strong>Total:</strong> $${pedido.total.toFixed(2)}</p>
              <p><strong>Dirección de entrega:</strong> ${pedido.direccion_entrega}</p>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #666;">Gracias por confiar en Agua Piatua</p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Notificación de estado enviada:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  enviarNotificacionNuevoPedido,
  enviarNotificacionEstadoPedido
};

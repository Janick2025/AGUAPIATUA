import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import apiService from './apiService';

class PushNotificationService {
  private isInitialized = false;

  /**
   * Inicializar servicio de notificaciones push
   */
  async initialize() {
    // Solo en plataformas nativas (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      console.log('⚠️ Push notifications solo disponibles en plataformas nativas');
      return;
    }

    if (this.isInitialized) {
      console.log('✅ Push notifications ya inicializadas');
      return;
    }

    try {
      // Solicitar permisos
      const permission = await PushNotifications.requestPermissions();

      if (permission.receive === 'granted') {
        console.log('✅ Permisos de notificaciones concedidos');
        await this.registerListeners();
        await PushNotifications.register();
        this.isInitialized = true;
      } else {
        console.warn('⚠️ Permisos de notificaciones denegados');
      }
    } catch (error) {
      console.error('❌ Error inicializando push notifications:', error);
    }
  }

  /**
   * Registrar listeners de eventos
   */
  private async registerListeners() {
    // Listener cuando se registra exitosamente y se obtiene el token
    await PushNotifications.addListener('registration', async (token: Token) => {
      console.log('📱 Token FCM recibido:', token.value);

      try {
        // Enviar token al backend
        const response = await apiService.registerDeviceToken(token.value);
        console.log('✅ Token registrado en backend:', response);
      } catch (error) {
        console.error('❌ Error registrando token en backend:', error);
      }
    });

    // Listener cuando falla el registro
    await PushNotifications.addListener('registrationError', (error: any) => {
      console.error('❌ Error en registro de push notifications:', error);
    });

    // Listener cuando llega una notificación (app en primer plano)
    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('🔔 Notificación recibida (app abierta):', notification);

        // Mostrar notificación local personalizada si es necesario
        this.handleForegroundNotification(notification);
      }
    );

    // Listener cuando el usuario hace click en una notificación
    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('👆 Notificación clickeada:', action);

        // Navegar según el tipo de notificación
        this.handleNotificationClick(action);
      }
    );
  }

  /**
   * Manejar notificación cuando la app está en primer plano
   */
  private handleForegroundNotification(notification: PushNotificationSchema) {
    // Aquí puedes mostrar una alerta o toast personalizado
    console.log('Título:', notification.title);
    console.log('Mensaje:', notification.body);
    console.log('Datos:', notification.data);

    // Ejemplo: mostrar un toast
    if (notification.title && notification.body) {
      // Puedes integrar con IonToast aquí si lo deseas
      console.log(`📢 ${notification.title}: ${notification.body}`);
    }
  }

  /**
   * Manejar click en notificación
   */
  private handleNotificationClick(action: ActionPerformed) {
    const notification = action.notification;
    const data = notification.data;

    console.log('Datos de notificación:', data);

    // Navegar según el tipo de notificación
    switch (data.tipo) {
      case 'nuevo_pedido':
        // Navegar al dashboard de admin
        console.log('Navegar a pedido:', data.pedido_id);
        // window.location.href = `/admin-dashboard`;
        break;

      case 'cambio_estado':
        // Navegar a mis pedidos
        console.log('Navegar a pedido:', data.pedido_id);
        // window.location.href = `/historial-pedidos`;
        break;

      case 'pedido_asignado':
        // Navegar al dashboard de vendedor
        console.log('Navegar a pedido asignado:', data.pedido_id);
        // window.location.href = `/vendedor-dashboard`;
        break;

      default:
        console.log('Tipo de notificación desconocido:', data.tipo);
    }
  }

  /**
   * Obtener el token FCM actual
   */
  async getToken(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    try {
      const result = await PushNotifications.register();
      // El token se recibirá en el listener 'registration'
      return null; // El token se maneja en el listener
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Remover todos los listeners
   */
  async removeAllListeners() {
    await PushNotifications.removeAllListeners();
    this.isInitialized = false;
    console.log('🔇 Listeners de notificaciones removidos');
  }

  /**
   * Obtener las notificaciones entregadas (pendientes en el centro de notificaciones)
   */
  async getDeliveredNotifications() {
    const notificationList = await PushNotifications.getDeliveredNotifications();
    console.log('📬 Notificaciones entregadas:', notificationList);
    return notificationList;
  }

  /**
   * Limpiar todas las notificaciones del centro de notificaciones
   */
  async clearNotifications() {
    await PushNotifications.removeAllDeliveredNotifications();
    console.log('🗑️ Notificaciones limpiadas');
  }
}

// Exportar instancia singleton
export default new PushNotificationService();

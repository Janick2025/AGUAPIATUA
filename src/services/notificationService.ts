import { io, Socket } from 'socket.io-client';

class NotificationService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(userId: number, userType: string) {
    if (this.socket?.connected) {
      console.log('Socket ya está conectado');
      return;
    }

    this.socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado a Socket.IO:', this.socket?.id);

      // Identificarse con el servidor
      this.socket?.emit('identify', { userId, userType });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado de Socket.IO');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión Socket.IO:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('Socket.IO desconectado');
    }
  }

  // Escuchar notificación de nuevo pedido (para admin)
  onNewOrder(callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.on('new_order', callback);

    // Guardar referencia para poder desuscribirse después
    if (!this.listeners.has('new_order')) {
      this.listeners.set('new_order', []);
    }
    this.listeners.get('new_order')?.push(callback);
  }

  // Escuchar notificación de pedido asignado (para vendedor)
  onOrderAssigned(vendedorId: number, callback: (data: any) => void) {
    if (!this.socket) return;

    const eventName = `order_assigned_${vendedorId}`;
    this.socket.on(eventName, callback);

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)?.push(callback);
  }

  // Desuscribirse de todos los eventos
  off(eventName: string) {
    if (!this.socket) return;

    this.socket.off(eventName);
    this.listeners.delete(eventName);
  }

  // Verificar si está conectado
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new NotificationService();

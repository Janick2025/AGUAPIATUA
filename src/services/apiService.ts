// Servicio para comunicación con la API de Agua Piatua
class ApiService {
  private baseURL: string = 'http://localhost:3001/api';
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('aguapiatua_token');
  }

  // Configurar token de autenticación
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('aguapiatua_token', token);
    } else {
      localStorage.removeItem('aguapiatua_token');
    }
  }

  // Headers por defecto
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Método HTTP genérico
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error en ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos de autenticación
  async login(email: string, password: string) {
    const response = await this.request<{
      message: string;
      token: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setToken(response.token);
    return response;
  }

  async register(userData: {
    nombre: string;
    email: string;
    password: string;
    tipo_usuario: 'Cliente' | 'Vendedor' | 'Admin';
    telefono?: string;
    direccion?: string;
  }) {
    const response = await this.request<{
      message: string;
      token: string;
      user: any;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.setToken(response.token);
    return response;
  }

  async verifyToken() {
    if (!this.token) return { valid: false };
    
    try {
      return await this.request<{
        valid: boolean;
        user: any;
        decoded: any;
      }>('/auth/verify-token', {
        method: 'POST',
        body: JSON.stringify({ token: this.token }),
      });
    } catch (error) {
      this.setToken(null);
      return { valid: false };
    }
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('aguapiatua_user');
  }

  // Métodos de productos
  async getProducts() {
    return this.request<any[]>('/products');
  }

  async getProduct(id: number) {
    return this.request<any>(`/products/${id}`);
  }

  async createProduct(productData: {
    nombre: string;
    descripcion?: string;
    precio: number;
    stock: number;
    imagen?: string;
    categoria?: string;
  }) {
    return this.request<{
      message: string;
      product: any;
    }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: number, productData: any) {
    return this.request<{
      message: string;
      product: any;
    }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async updateProductStock(id: number, stock: number) {
    return this.request<{
      message: string;
      product: any;
    }>(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
  }

  // Métodos de pedidos
  async getOrders() {
    return this.request<any[]>('/orders');
  }

  async getPendingOrders() {
    return this.request<any[]>('/orders/pending');
  }

  async getOrder(id: number) {
    return this.request<any>(`/orders/${id}`);
  }

  async createOrder(orderData: {
    items: Array<{
      product_id: number;
      cantidad: number;
      precio_unitario: number;
    }>;
    direccion_entrega: string;
    telefono_contacto?: string;
    notas?: string;
  }) {
    return this.request<{
      message: string;
      order: any;
    }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async assignOrder(orderId: number, vendedorId?: number) {
    return this.request<{
      message: string;
      order: any;
    }>(`/orders/${orderId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ vendedor_id: vendedorId }),
    });
  }

  async updateOrderStatus(orderId: number, estado: string) {
    return this.request<{
      message: string;
      order: any;
    }>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  }

  // Métodos de entregas
  async getDeliveries() {
    return this.request<any[]>('/deliveries');
  }

  async getAllDeliveries() {
    return this.request<any[]>('/deliveries/all');
  }

  async getDelivery(id: number) {
    return this.request<any>(`/deliveries/${id}`);
  }

  async updateDeliveryLocation(
    id: number, 
    latitude: number, 
    longitude: number, 
    ubicacion?: string
  ) {
    return this.request<{
      message: string;
    }>(`/deliveries/${id}/location`, {
      method: 'PATCH',
      body: JSON.stringify({ latitude, longitude, ubicacion }),
    });
  }

  async updateDeliveryStatus(id: number, estado: string, comentarios?: string) {
    return this.request<{
      message: string;
    }>(`/deliveries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado, comentarios }),
    });
  }

  // Métodos de usuarios
  async getUsers() {
    return this.request<any[]>('/users');
  }

  async getVendedores() {
    return this.request<any[]>('/users/vendedores');
  }

  async getUser(id: number) {
    return this.request<any>(`/users/${id}`);
  }

  async updateUser(id: number, userData: {
    nombre?: string;
    email?: string;
    tipo_usuario?: 'Cliente' | 'Vendedor' | 'Admin';
    telefono?: string;
    direccion?: string;
    activo?: boolean;
    password?: string;
  }) {
    return this.request<{
      message: string;
      user: any;
    }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateUserStatus(id: number, activo: boolean) {
    return this.request<{
      message: string;
      user: any;
    }>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    });
  }

  // Método para verificar la salud del servidor
  async healthCheck() {
    return this.request<{
      status: string;
      timestamp: string;
      service: string;
    }>('/health');
  }
}

export default new ApiService();
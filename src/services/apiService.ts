// Servicio para comunicación con la API de Agua Piatua
class ApiService {
  // URL del backend desplegado en ngrok (usar esta URL tanto en desarrollo como en producción)
  private baseURL: string = 'https://aca5eb15b5ac.ngrok-free.app/api';
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

    // Obtener el token más reciente de localStorage
    const currentToken = localStorage.getItem('aguapiatua_token');
    if (currentToken) {
      this.token = currentToken;
      headers['Authorization'] = `Bearer ${currentToken}`;
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
      console.log(`📤 ${options.method || 'GET'} ${url}`);
      console.log(`📋 Config:`, JSON.stringify(config.headers));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📥 ${response.status} ${response.statusText}`);

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error(`❌ Respuesta no es JSON:`, text.substring(0, 200));
        throw new Error('El servidor no respondió con JSON válido');
      }

      if (!response.ok) {
        const errorMsg = data.error || data.message || `HTTP error! status: ${response.status}`;
        console.error(`❌ Error HTTP:`, errorMsg);
        throw new Error(errorMsg);
      }

      console.log(`✅ Respuesta exitosa`);
      return data;
    } catch (error: any) {
      console.error(`❌ Error en ${endpoint}:`, error.message);
      console.error(`❌ Error type:`, error.name);

      // Si es timeout
      if (error.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado. El servidor no responde.');
      }

      // Si es un error de red (Failed to fetch)
      if (error.message && (error.message.includes('fetch') || error.name === 'TypeError')) {
        // Intentar verificar si es problema de CORS o red
        console.error('💡 AYUDA: Si ves este error:');
        console.error('1. Cierra Chrome completamente');
        console.error('2. Abre Chrome de nuevo o usa Incógnito (Ctrl+Shift+N)');
        console.error('3. Borra caché: Ctrl+Shift+Delete');
        console.error('4. Verifica que no tengas extensiones bloqueando');
        throw new Error('❌ Error de conexión. Por favor:\n1. Abre Chrome en modo incógnito (Ctrl+Shift+N)\n2. O borra caché (Ctrl+Shift+Delete)\n3. Recarga la página');
      }

      throw error;
    }
  }

  // Métodos de autenticación
  async login(email: string, password: string) {
    console.log('🔐 Intentando login con:', email);

    try {
      const response = await this.request<{
        message: string;
        token: string;
        user: any;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('🔐 Login exitoso, guardando token...');
      this.setToken(response.token);
      console.log('🔐 Token guardado:', response.token.substring(0, 20) + '...');

      return response;
    } catch (error: any) {
      console.error('🔐 Error en login:', error);
      throw error;
    }
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

  async deleteProduct(id: number) {
    return this.request<{
      message: string;
    }>(`/products/${id}`, {
      method: 'DELETE',
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

  async deleteUser(id: number) {
    return this.request<{
      message: string;
      userId: number;
    }>(`/users/${id}`, {
      method: 'DELETE',
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

  // Métodos para subida de archivos
  async uploadComprobante(file: File, orderId?: number) {
    const formData = new FormData();
    formData.append('comprobante', file);

    if (orderId) {
      formData.append('orderId', orderId.toString());
    }

    const url = `${this.baseURL}/uploads/comprobante`;
    const currentToken = localStorage.getItem('aguapiatua_token');

    try {
      console.log(`📤 POST ${url}`);
      console.log(`📋 Subiendo archivo: ${file.name}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': currentToken ? `Bearer ${currentToken}` : ''
        },
        body: formData
      });

      console.log(`📥 ${response.status} ${response.statusText}`);

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error(`❌ Respuesta no es JSON:`, text.substring(0, 200));
        throw new Error('El servidor no respondió con JSON válido');
      }

      if (!response.ok) {
        const errorMsg = data.error || data.message || `HTTP error! status: ${response.status}`;
        console.error(`❌ Error HTTP:`, errorMsg);
        throw new Error(errorMsg);
      }

      console.log(`✅ Archivo subido exitosamente`);
      return data;
    } catch (error: any) {
      console.error(`❌ Error subiendo archivo:`, error.message);
      throw error;
    }
  }

  async getComprobante(filename: string) {
    return `${this.baseURL}/uploads/comprobante/${filename}`;
  }

  async deleteComprobante(filename: string) {
    return this.request<{
      message: string;
    }>(`/uploads/comprobante/${filename}`, {
      method: 'DELETE'
    });
  }
}

export default new ApiService();
// Servicio de gestión de inventario
export interface ProductStock {
  id: number;
  nombre: string;
  precio: number;
  precioAntes?: number;
  imagen: string;
  descripcion: string;
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  activo: boolean;
  rating?: number;
  reviews?: number;
  categoria?: string;
  ventas?: string;
}

// Estado inicial del inventario
const INITIAL_INVENTORY: ProductStock[] = [
  {
    id: 1,
    nombre: 'Agua Piatua 500ml',
    precio: 0.50,
    imagen: 'agua.jpg',
    descripcion: 'Pequeña, práctica y siempre contigo. Perfecta para llevar a cualquier lugar.',
    stock: 150,
    stockMinimo: 20,
    stockMaximo: 300,
    activo: true,
    rating: 4.8,
    reviews: 124,
    categoria: 'individual'
  },
  {
    id: 2,
    nombre: 'Agua Piatua 1L',
    precio: 1.00,
    imagen: 'litro.jpg',
    descripcion: 'Un litro de pureza, un litro de vida. Ideal para el hogar y oficina.',
    stock: 100,
    stockMinimo: 15,
    stockMaximo: 200,
    activo: true,
    rating: 4.9,
    reviews: 89,
    categoria: 'individual'
  },
  {
    id: 3,
    nombre: 'Agua Piatua Six Pack',
    precio: 2.50,
    imagen: 'Six_Pag.jpg',
    descripcion: 'Tu fuente de frescura en grande. Perfecto para familias.',
    stock: 50,
    stockMinimo: 10,
    stockMaximo: 100,
    activo: true,
    rating: 4.7,
    reviews: 156,
    categoria: 'pack'
  },
  {
    id: 4,
    nombre: 'Agua Piatua 12 Unidades',
    precio: 2.75,
    imagen: '12U.jpg',
    descripcion: 'Abastecimiento completo para tu hogar u oficina.',
    stock: 30,
    stockMinimo: 5,
    stockMaximo: 60,
    activo: true,
    rating: 4.6,
    reviews: 67,
    categoria: 'pack'
  },
  {
    id: 5,
    nombre: 'Agua Piatua Hielo en Cubos',
    precio: 1.80,
    imagen: 'hielo.jpg',
    descripcion: 'Hielo puro para tus bebidas más refrescantes.',
    stock: 75,
    stockMinimo: 20,
    stockMaximo: 150,
    activo: true,
    rating: 4.5,
    reviews: 92,
    categoria: 'hielo'
  },
  {
    id: 6,
    nombre: 'Agua Piatua 20L',
    precio: 2.50,
    imagen: 'garrafa.jpg',
    descripcion: 'La máxima capacidad para tu dispensador. Agua pura en cantidad.',
    stock: 25,
    stockMinimo: 8,
    stockMaximo: 50,
    activo: true,
    rating: 4.9,
    reviews: 203,
    categoria: 'garrafa'
  }
];

class InventoryService {
  private static instance: InventoryService;
  private inventory: ProductStock[];

  private constructor() {
    // Cargar inventario desde localStorage o usar inicial
    const savedInventory = localStorage.getItem('inventoryData');
    this.inventory = savedInventory ? JSON.parse(savedInventory) : INITIAL_INVENTORY;
  }

  public static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService();
    }
    return InventoryService.instance;
  }

  // Inicializar inventario - asegurar que esté cargado
  initializeInventory(): void {
    if (!this.inventory || this.inventory.length === 0) {
      console.log('Inicializando inventario con datos por defecto');
      this.inventory = [...INITIAL_INVENTORY];
      this.saveInventory();
    }
    console.log('Inventario inicializado con', this.inventory.length, 'productos');
  }

  // Obtener todos los productos
  getAllProducts(): ProductStock[] {
    return this.inventory;
  }

  // Obtener productos activos (con stock > 0 y activos)
  getAvailableProducts(): ProductStock[] {
    return this.inventory.filter(product => product.activo && product.stock > 0);
  }

  // Obtener producto por ID
  getProductById(id: number): ProductStock | undefined {
    return this.inventory.find(product => product.id === id);
  }

  // Verificar si un producto está disponible
  isProductAvailable(id: number, quantity: number = 1): boolean {
    const product = this.getProductById(id);
    return product ? product.activo && product.stock >= quantity : false;
  }

  // Reducir stock después de una compra
  reduceStock(id: number, quantity: number): boolean {
    const product = this.getProductById(id);
    if (!product || !this.isProductAvailable(id, quantity)) {
      return false;
    }

    product.stock -= quantity;
    
    // Desactivar producto si se queda sin stock
    if (product.stock <= 0) {
      product.stock = 0;
      product.activo = false;
    }

    this.saveInventory();
    return true;
  }

  // Añadir stock (solo para administradores)
  addStock(id: number, quantity: number): boolean {
    const product = this.getProductById(id);
    if (!product) return false;

    product.stock += quantity;
    
    // Reactivar producto si tenía stock 0
    if (product.stock > 0) {
      product.activo = true;
    }

    // No superar el stock máximo
    if (product.stock > product.stockMaximo) {
      product.stock = product.stockMaximo;
    }

    this.saveInventory();
    return true;
  }

  // Actualizar stock directo (para administradores)
  updateStock(id: number, newStock: number): boolean {
    const product = this.getProductById(id);
    if (!product) return false;

    product.stock = Math.max(0, Math.min(newStock, product.stockMaximo));
    product.activo = product.stock > 0;

    this.saveInventory();
    return true;
  }

  // Obtener productos con stock bajo
  getLowStockProducts(): ProductStock[] {
    return this.inventory.filter(product => 
      product.stock <= product.stockMinimo && product.stock > 0
    );
  }

  // Obtener productos sin stock
  getOutOfStockProducts(): ProductStock[] {
    return this.inventory.filter(product => product.stock === 0);
  }

  // Procesar una compra completa
  processPurchase(cart: Array<{id: number, quantity: number}>): boolean {
    // Verificar que todos los productos estén disponibles
    for (const item of cart) {
      if (!this.isProductAvailable(item.id, item.quantity)) {
        return false;
      }
    }

    // Si todo está disponible, reducir stock
    for (const item of cart) {
      this.reduceStock(item.id, item.quantity);
    }

    return true;
  }

  // Guardar inventario en localStorage
  private saveInventory(): void {
    localStorage.setItem('inventoryData', JSON.stringify(this.inventory));
  }

  // Restaurar inventario inicial (para pruebas)
  resetInventory(): void {
    this.inventory = [...INITIAL_INVENTORY];
    this.saveInventory();
  }

  // Obtener estadísticas de inventario
  getInventoryStats() {
    const total = this.inventory.length;
    const available = this.inventory.filter(p => p.activo && p.stock > 0).length;
    const lowStock = this.getLowStockProducts().length;
    const outOfStock = this.getOutOfStockProducts().length;
    const totalValue = this.inventory.reduce((sum, p) => sum + (p.stock * p.precio), 0);

    return {
      total,
      available,
      lowStock,
      outOfStock,
      totalValue: totalValue.toFixed(2)
    };
  }

  // Añadir nuevo producto al inventario
  addProduct(product: ProductStock): boolean {
    try {
      // Verificar que no exista un producto con el mismo ID
      if (this.inventory.some(p => p.id === product.id)) {
        return false;
      }

      this.inventory.push(product);
      this.saveInventory();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Cambiar estado activo/inactivo de un producto
  toggleProductStatus(id: number): boolean {
    const product = this.getProductById(id);
    if (!product) return false;

    product.activo = !product.activo;
    this.saveInventory();
    return true;
  }

  // Actualizar límites de stock
  updateStockLimits(id: number, minStock: number, maxStock: number): boolean {
    const product = this.getProductById(id);
    if (!product) return false;

    if (minStock < 0 || maxStock < minStock) return false;

    product.stockMinimo = minStock;
    product.stockMaximo = maxStock;
    this.saveInventory();
    return true;
  }

  // Actualizar información básica del producto
  updateProduct(id: number, updates: Partial<ProductStock>): boolean {
    const productIndex = this.inventory.findIndex(p => p.id === id);
    if (productIndex === -1) return false;

    // Mantener ciertos campos inmutables
    const { id: _, ...allowedUpdates } = updates;
    
    this.inventory[productIndex] = { 
      ...this.inventory[productIndex], 
      ...allowedUpdates 
    };
    
    this.saveInventory();
    return true;
  }

  // Eliminar producto del inventario
  removeProduct(id: number): boolean {
    const initialLength = this.inventory.length;
    this.inventory = this.inventory.filter(p => p.id !== id);
    
    if (this.inventory.length < initialLength) {
      this.saveInventory();
      return true;
    }
    
    return false;
  }
}

export default InventoryService.getInstance();

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonIcon, IonToast, IonAlert, IonPage, IonContent 
} from '@ionic/react';
import inventoryService from '../services/inventoryService';
import {
  gridOutline, peopleOutline, cubeOutline, analyticsOutline,
  settingsOutline, logOutOutline, menuOutline, searchOutline,
  notificationsOutline, addOutline, createOutline, trashOutline,
  eyeOutline, checkmarkCircleOutline, closeCircleOutline,
  trendingUpOutline, trendingDownOutline, saveOutline,
  personAddOutline, storefront, barChartOutline, refreshOutline,
  pencilOutline
} from 'ionicons/icons';
import './AdminDashboard.css';

// Tipos TypeScript
interface Usuario {
  id: number;
  username: string;
  email: string;
  tipo: 'vendedor' | 'cliente';
  fechaCreacion: string;
  estado: 'activo' | 'inactivo';
  ultimoLogin?: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
  categoria: string;
  stock: number;
  fechaCreacion: string;
  activo: boolean;
  ventas: number;
}

interface Estadistica {
  totalUsuarios: number;
  totalProductos: number;
  pedidosHoy: number;
  ventasHoy: number;
  crecimientoUsuarios: number;
  crecimientoVentas: number;
}

// Datos iniciales simulados
const usuariosIniciales: Usuario[] = [
  {
    id: 1,
    username: 'vendedor1',
    email: 'vendedor1@aguapiatua.com',
    tipo: 'vendedor',
    fechaCreacion: '2024-01-15',
    estado: 'activo',
    ultimoLogin: '2024-12-20 10:30'
  },
  {
    id: 2,
    username: 'cliente_juan',
    email: 'juan@email.com',
    tipo: 'cliente',
    fechaCreacion: '2024-02-10',
    estado: 'activo',
    ultimoLogin: '2024-12-19 15:45'
  },
  {
    id: 3,
    username: 'vendedor2',
    email: 'vendedor2@aguapiatua.com',
    tipo: 'vendedor',
    fechaCreacion: '2024-03-05',
    estado: 'inactivo',
    ultimoLogin: '2024-12-18 09:20'
  }
];

const productosIniciales: Producto[] = [
  {
    id: 1,
    nombre: 'Agua Piatua 500ml',
    precio: 0.50,
    descripcion: 'Agua purificada de 500ml, perfecta para llevar',
    imagen: 'agua.jpg',
    categoria: 'individual',
    stock: 150,
    fechaCreacion: '2024-01-01',
    activo: true,
    ventas: 1250
  },
  {
    id: 2,
    nombre: 'Agua Piatua 1L',
    precio: 1.00,
    descripcion: 'Agua purificada de 1 litro, ideal para el hogar',
    imagen: 'litro.jpg',
    categoria: 'individual',
    stock: 89,
    fechaCreacion: '2024-01-01',
    activo: true,
    ventas: 890
  },
  {
    id: 3,
    nombre: 'Agua Piatua Six Pack',
    precio: 2.50,
    descripcion: 'Pack de 6 botellas de 500ml',
    imagen: 'Six_Pag.jpg',
    categoria: 'pack',
    stock: 45,
    fechaCreacion: '2024-01-15',
    activo: true,
    ventas: 567
  },
  {
    id: 4,
    nombre: 'Agua Piatua 20L',
    precio: 2.50,
    descripcion: 'Garrafa de 20 litros para dispensador',
    imagen: 'garrafa.jpg',
    categoria: 'garrafa',
    stock: 25,
    fechaCreacion: '2024-02-01',
    activo: false,
    ventas: 234
  }
];

const AdminInterface: React.FC = () => {
  const history = useHistory();
  
  // Estados principales
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales);
  const [productos, setProductos] = useState<Producto[]>([]);
  
  // Estados para formularios
  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: '',
    email: '',
    password: '',
    tipo: 'vendedor' as 'vendedor' | 'cliente'
  });
  
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: 0,
    descripcion: '',
    imagen: '',
    categoria: '',
    stock: 0
  });
  
  // Estados de UI
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Verificar autenticación
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (!isAuthenticated || userType !== 'administrador') {
      showMessage('Acceso denegado. Solo administradores.', 'danger');
      setTimeout(() => history.push('/login'), 2000);
    }
  }, [history]);

  // Cargar productos desde el servicio de inventario
  useEffect(() => {
    const loadProducts = () => {
      try {
        // Forzar inicialización del servicio de inventario
        inventoryService.initializeInventory();
        
        const inventoryProducts = inventoryService.getAllProducts();
        console.log('Productos cargados del inventario:', inventoryProducts);
        
        // Si no hay productos del servicio, usar productos de ejemplo
        if (!inventoryProducts || inventoryProducts.length === 0) {
          console.log('No hay productos en inventoryService, creando productos de ejemplo');
          const ejemploProductos: Producto[] = [
            {
              id: 1,
              nombre: 'Agua Piatua 500ml',
              precio: 0.50,
              descripcion: 'Pequeña, práctica y siempre contigo',
              imagen: '/agua.jpg',
              categoria: 'Individual',
              stock: 150,
              fechaCreacion: new Date().toISOString().split('T')[0],
              activo: true,
              ventas: 45
            },
            {
              id: 2,
              nombre: 'Agua Piatua 1L',
              precio: 1.00,
              descripcion: 'Un litro de pureza, un litro de vida',
              imagen: '/litro.jpg',
              categoria: 'Individual',
              stock: 100,
              fechaCreacion: new Date().toISOString().split('T')[0],
              activo: true,
              ventas: 32
            },
            {
              id: 3,
              nombre: 'Six Pack Agua Piatua',
              precio: 5.00,
              descripcion: 'Pack de 6 botellas de 500ml',
              imagen: '/Six_Pag.jpg',
              categoria: 'Pack',
              stock: 75,
              fechaCreacion: new Date().toISOString().split('T')[0],
              activo: true,
              ventas: 28
            },
            {
              id: 4,
              nombre: 'Garrafa 20L',
              precio: 8.00,
              descripcion: 'Garrafa de 20 litros para dispensador',
              imagen: '/garrafa.jpg',
              categoria: 'Garrafa',
              stock: 50,
              fechaCreacion: new Date().toISOString().split('T')[0],
              activo: true,
              ventas: 15
            },
            {
              id: 5,
              nombre: 'Hielo en Cubos',
              precio: 2.50,
              descripcion: 'Bolsa de hielo en cubos 2kg',
              imagen: '/hielo.jpg',
              categoria: 'Hielo',
              stock: 80,
              fechaCreacion: new Date().toISOString().split('T')[0],
              activo: true,
              ventas: 22
            }
          ];
          
          setProductos(ejemploProductos);
          showMessage(`${ejemploProductos.length} productos de ejemplo cargados`, 'success');
          return;
        }
        
        // Convertir ProductStock a Producto (interface del AdminDashboard)
        const adminProducts: Producto[] = inventoryProducts.map((product: any) => ({
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          descripcion: product.descripcion,
          imagen: product.imagen,
          categoria: product.categoria || 'General',
          stock: product.stock,
          fechaCreacion: new Date().toISOString().split('T')[0],
          activo: product.activo !== false, // Asegurar que sea true por defecto
          ventas: 0 // Se puede obtener de otra fuente o calcular
        }));
        
        console.log('Productos convertidos para admin:', adminProducts);
        setProductos(adminProducts);
        
        if (adminProducts.length > 0) {
          showMessage(`${adminProducts.length} productos cargados correctamente`, 'success');
        }
      } catch (error) {
        console.error('Error cargando productos:', error);
        showMessage('Error al cargar productos', 'danger');
        
        // Fallback a productos de ejemplo en caso de error
        const ejemploProductos: Producto[] = [
          {
            id: 1,
            nombre: 'Agua Piatua 500ml',
            precio: 0.50,
            descripcion: 'Pequeña, práctica y siempre contigo',
            imagen: '/agua.jpg',
            categoria: 'Individual',
            stock: 150,
            fechaCreacion: new Date().toISOString().split('T')[0],
            activo: true,
            ventas: 45
          }
        ];
        setProductos(ejemploProductos);
      }
    };
    
    // Pequeño delay para asegurar que todo esté inicializado
    setTimeout(loadProducts, 100);
  }, []);
  
  // Función para mostrar mensajes
  const showMessage = (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };
  
  // Calcular estadísticas
  const inventoryStats = inventoryService.getInventoryStats();
  const estadisticas: Estadistica = {
    totalUsuarios: usuarios.length,
    totalProductos: inventoryStats.total,
    pedidosHoy: 23,
    ventasHoy: parseFloat(inventoryStats.totalValue) / 10, // Simular ventas basadas en valor del inventario
    crecimientoUsuarios: 12.5,
    crecimientoVentas: 8.3
  };
  
  // Función para crear usuario
  const crearUsuario = async () => {
    if (!nuevoUsuario.username || !nuevoUsuario.email || !nuevoUsuario.password) {
      showMessage('Por favor complete todos los campos', 'warning');
      return;
    }
    
    if (usuarios.some(u => u.username === nuevoUsuario.username)) {
      showMessage('El nombre de usuario ya existe', 'danger');
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      const usuario: Usuario = {
        id: usuarios.length + 1,
        username: nuevoUsuario.username,
        email: nuevoUsuario.email,
        tipo: nuevoUsuario.tipo,
        fechaCreacion: new Date().toISOString().split('T')[0],
        estado: 'activo'
      };
      
      setUsuarios([...usuarios, usuario]);
      setNuevoUsuario({ username: '', email: '', password: '', tipo: 'vendedor' });
      showMessage(`Usuario ${usuario.username} creado exitosamente`, 'success');
      setIsLoading(false);
    }, 1000);
  };
  
  // Función para eliminar usuario
  const eliminarUsuario = (id: number) => {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;
    
    setAlertConfig({
      isOpen: true,
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar al usuario "${usuario.username}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            setUsuarios(usuarios.filter(u => u.id !== id));
            showMessage(`Usuario ${usuario.username} eliminado`, 'success');
          }
        }
      ]
    });
    setShowAlert(true);
  };
  
  // Función para crear producto
  const crearProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio) {
      showMessage('Por favor complete los campos obligatorios', 'warning');
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      // Crear producto usando el servicio de inventario
      const newProduct = {
        id: Date.now(), // Usar timestamp como ID único
        nombre: nuevoProducto.nombre,
        precio: nuevoProducto.precio,
        descripcion: nuevoProducto.descripcion,
        imagen: nuevoProducto.imagen || 'default.jpg',
        categoria: nuevoProducto.categoria || 'General',
        stock: nuevoProducto.stock,
        stockMinimo: 10, // Valor por defecto
        stockMaximo: 1000, // Valor por defecto
        activo: true,
        rating: 4.5,
        reviews: 0
      };
      
      if (inventoryService.addProduct(newProduct)) {
        setNuevoProducto({
          nombre: '', precio: 0, descripcion: '', imagen: '', categoria: '', stock: 0
        });
        showMessage(`Producto ${newProduct.nombre} creado exitosamente`, 'success');
        reloadProducts();
      } else {
        showMessage('Error al crear el producto', 'danger');
      }
      
      setIsLoading(false);
    }, 1000);
  };
  
  // Función para alternar estado de producto
  const toggleProductoEstado = (id: number) => {
    const success = inventoryService.toggleProductStatus(id);
    if (success) {
      const producto = inventoryService.getProductById(id);
      showMessage(`Producto ${producto?.activo ? 'activado' : 'desactivado'}`, 'success');
      // Recargar productos desde el servicio
      reloadProducts();
    } else {
      showMessage('Error al cambiar estado del producto', 'danger');
    }
  };

  // Función para recargar productos desde el servicio
  const reloadProducts = () => {
    try {
      const inventoryProducts = inventoryService.getAllProducts();
      console.log('Recargando productos:', inventoryProducts);
      
      const adminProducts: Producto[] = inventoryProducts.map((product: any) => ({
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        descripcion: product.descripcion,
        imagen: product.imagen,
        categoria: product.categoria || 'General',
        stock: product.stock,
        fechaCreacion: new Date().toISOString().split('T')[0],
        activo: product.activo !== false,
        ventas: 0
      }));
      
      setProductos(adminProducts);
      showMessage(`${adminProducts.length} productos recargados`, 'success');
    } catch (error) {
      console.error('Error recargando productos:', error);
      showMessage('Error al recargar productos', 'danger');
    }
  };

  // Funciones específicas de gestión de inventario
  const updateStock = (productId: number, newStock: number) => {
    const product = inventoryService.getProductById(productId);
    if (!product) {
      showMessage('Producto no encontrado', 'danger');
      return;
    }

    const currentStock = product.stock;
    const difference = newStock - currentStock;

    if (difference > 0) {
      // Añadir stock
      if (inventoryService.addStock(productId, difference)) {
        showMessage(`Stock actualizado: +${difference} unidades`, 'success');
        reloadProducts();
      } else {
        showMessage('Error al añadir stock', 'danger');
      }
    } else if (difference < 0) {
      // Reducir stock
      if (inventoryService.reduceStock(productId, Math.abs(difference))) {
        showMessage(`Stock actualizado: ${difference} unidades`, 'success');
        reloadProducts();
      } else {
        showMessage('Error al reducir stock', 'danger');
      }
    } else {
      showMessage('El stock no ha cambiado', 'warning');
    }
  };

  const updateStockLimits = (productId: number, minStock: number, maxStock: number) => {
    if (inventoryService.updateStockLimits(productId, minStock, maxStock)) {
      showMessage('Límites de stock actualizados correctamente', 'success');
      reloadProducts();
    } else {
      showMessage('Error al actualizar límites de stock', 'danger');
    }
  };

  const resetInventory = () => {
    setAlertConfig({
      isOpen: true,
      header: 'Restablecer Inventario',
      message: '¿Estás seguro de que quieres restablecer todo el inventario a los valores iniciales? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Restablecer',
          handler: () => {
            inventoryService.resetInventory();
            reloadProducts();
            showMessage('Inventario restablecido correctamente', 'success');
          }
        }
      ]
    });
    setShowAlert(true);
  };
  
  // Función para cerrar sesión
  const handleLogout = () => {
    setAlertConfig({
      isOpen: true,
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar Sesión',
          handler: () => {
            localStorage.clear();
            showMessage('Sesión cerrada correctamente', 'success');
            setTimeout(() => history.push('/login'), 1000);
          }
        }
      ]
    });
    setShowAlert(true);
  };
  
  // Renderizar sección del dashboard
  const renderDashboard = () => (
    <div>
      {/* Estadísticas principales */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-info">
              <h3>Total Usuarios</h3>
              <p className="admin-stat-value">{estadisticas.totalUsuarios}</p>
            </div>
            <div className="admin-stat-icon users">
              <IonIcon icon={peopleOutline} />
            </div>
          </div>
          <div className="admin-stat-trend">
            <IonIcon icon={trendingUpOutline} className="admin-trend-positive" />
            <span className="admin-trend-value admin-trend-positive">
              +{estadisticas.crecimientoUsuarios}%
            </span>
            <span className="admin-trend-text">vs mes anterior</span>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-info">
              <h3>Total Productos</h3>
              <p className="admin-stat-value">{estadisticas.totalProductos}</p>
            </div>
            <div className="admin-stat-icon products">
              <IonIcon icon={cubeOutline} />
            </div>
          </div>
          <div className="admin-stat-trend">
            <IonIcon icon={trendingUpOutline} className="admin-trend-positive" />
            <span className="admin-trend-value admin-trend-positive">+4</span>
            <span className="admin-trend-text">nuevos este mes</span>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-info">
              <h3>Pedidos Hoy</h3>
              <p className="admin-stat-value">{estadisticas.pedidosHoy}</p>
            </div>
            <div className="admin-stat-icon orders">
              <IonIcon icon={barChartOutline} />
            </div>
          </div>
          <div className="admin-stat-trend">
            <IonIcon icon={trendingUpOutline} className="admin-trend-positive" />
            <span className="admin-trend-value admin-trend-positive">+15%</span>
            <span className="admin-trend-text">vs ayer</span>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-info">
              <h3>Ventas Hoy</h3>
              <p className="admin-stat-value">${estadisticas.ventasHoy}</p>
            </div>
            <div className="admin-stat-icon revenue">
              <IonIcon icon={analyticsOutline} />
            </div>
          </div>
          <div className="admin-stat-trend">
            <IonIcon icon={trendingUpOutline} className="admin-trend-positive" />
            <span className="admin-trend-value admin-trend-positive">
              +{estadisticas.crecimientoVentas}%
            </span>
            <span className="admin-trend-text">vs ayer</span>
          </div>
        </div>
      </div>
      
      {/* Actividad reciente */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <IonIcon icon={analyticsOutline} />
            Actividad Reciente
          </h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Alertas dinámicas de inventario */}
          {inventoryService.getOutOfStockProducts().length > 0 && (
            <div style={{ 
              padding: '16px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '12px', 
              borderLeft: '4px solid #EF4444' 
            }}>
              <strong style={{ color: '#EF4444' }}>🛑 Productos sin stock:</strong>
              <span style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px' }}>
                {inventoryService.getOutOfStockProducts().length} producto(s) agotado(s)
              </span>
            </div>
          )}
          
          {inventoryService.getLowStockProducts().length > 0 && (
            <div style={{ 
              padding: '16px', 
              background: 'rgba(245, 158, 11, 0.1)', 
              borderRadius: '12px', 
              borderLeft: '4px solid #F59E0B' 
            }}>
              <strong style={{ color: '#F59E0B' }}>⚠️ Stock bajo:</strong>
              <span style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px' }}>
                {inventoryService.getLowStockProducts().length} producto(s) necesitan reabastecimiento
              </span>
            </div>
          )}
          
          <div style={{ 
            padding: '16px', 
            background: 'rgba(16, 185, 129, 0.1)', 
            borderRadius: '12px', 
            borderLeft: '4px solid #10B981' 
          }}>
            <strong style={{ color: '#10B981' }}>✅ Sistema de inventario:</strong>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px' }}>
              Gestión automática de stock activa - Total productos: {inventoryService.getAllProducts().length}
            </span>
          </div>
          
          <div style={{ 
            padding: '16px', 
            background: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '12px', 
            borderLeft: '4px solid #3B82F6' 
          }}>
            <strong style={{ color: '#3B82F6' }}>� Valor del inventario:</strong>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px' }}>
              ${inventoryService.getInventoryStats().totalValue} en productos disponibles
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Renderizar sección de usuarios
  const renderUsuarios = () => (
    <div>
      {/* Formulario crear usuario */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <IonIcon icon={personAddOutline} />
            Crear Nuevo Usuario
          </h2>
        </div>
        
        <form className="admin-form admin-form-usuarios" onSubmit={(e) => { e.preventDefault(); crearUsuario(); }}>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-form-label">
                <IonIcon icon={peopleOutline} />
                Nombre de Usuario *
              </label>
              <input
                type="text"
                className="admin-form-input"
                value={nuevoUsuario.username}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, username: e.target.value})}
                placeholder="Ej: vendedor123"
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Email *</label>
              <input
                type="email"
                className="admin-form-input"
                value={nuevoUsuario.email}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
                placeholder="usuario@aguapiatua.com"
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Contraseña *</label>
              <input
                type="password"
                className="admin-form-input"
                value={nuevoUsuario.password}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})}
                placeholder="Contraseña segura"
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Tipo de Usuario *</label>
              <select
                className="admin-form-select"
                value={nuevoUsuario.tipo}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, tipo: e.target.value as 'vendedor' | 'cliente'})}
              >
                <option value="vendedor">Vendedor</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="admin-btn admin-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="admin-spinner" style={{ width: '16px', height: '16px' }}></div>
                Creando...
              </>
            ) : (
              <>
                <IonIcon icon={saveOutline} />
                Crear Usuario
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Tabla de usuarios */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <IonIcon icon={peopleOutline} />
            Lista de Usuarios ({usuarios.filter(u => 
              u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
              u.email.toLowerCase().includes(searchTerm.toLowerCase())
            ).length})
          </h2>
          <div className="admin-search-container">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IonIcon icon={searchOutline} className="admin-search-icon" />
          </div>
        </div>
        
        <div className="admin-table-container admin-usuarios-table">
          <table className="admin-table admin-table-usuarios">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Último Login</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios
                .filter(usuario => 
                  usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(usuario => (
                <tr key={usuario.id}>
                  <td>#{usuario.id}</td>
                  <td style={{ fontWeight: '600' }}>{usuario.username}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${usuario.tipo}`}>
                      {usuario.tipo}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge-${usuario.estado}`}>
                      <IonIcon icon={usuario.estado === 'activo' ? checkmarkCircleOutline : closeCircleOutline} />
                      {usuario.estado}
                    </span>
                  </td>
                  <td>{usuario.fechaCreacion}</td>
                  <td>{usuario.ultimoLogin || 'Nunca'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="admin-btn admin-btn-outline" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                        <IonIcon icon={eyeOutline} />
                      </button>
                      <button 
                        className="admin-btn admin-btn-danger" 
                        style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                        onClick={() => eliminarUsuario(usuario.id)}
                      >
                        <IonIcon icon={trashOutline} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vista de tarjetas para móviles */}
        <div className="admin-usuarios-cards">
          {usuarios
            .filter(usuario => 
              usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
              usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(usuario => (
            <div key={usuario.id} className="admin-usuario-card">
              <div className="admin-usuario-card-header">
                <div className="admin-usuario-avatar" style={{ position: 'relative' }}>
                  {usuario.username.charAt(0).toUpperCase()}
                  <div className={`admin-usuario-status-indicator ${usuario.estado}`}></div>
                </div>
                <div className="admin-usuario-card-info">
                  <div className="admin-usuario-card-name">{usuario.username}</div>
                  <div className="admin-usuario-card-email">{usuario.email}</div>
                </div>
              </div>
              
              <div className="admin-usuario-card-details">
                <div className="admin-usuario-card-detail">
                  <div className="admin-usuario-card-detail-label">ID</div>
                  <div className="admin-usuario-card-detail-value">#{usuario.id}</div>
                </div>
                <div className="admin-usuario-card-detail">
                  <div className="admin-usuario-card-detail-label">Tipo</div>
                  <div className="admin-usuario-card-detail-value">
                    <span className={`admin-badge admin-badge-${usuario.tipo}`}>
                      {usuario.tipo}
                    </span>
                  </div>
                </div>
                <div className="admin-usuario-card-detail">
                  <div className="admin-usuario-card-detail-label">Estado</div>
                  <div className="admin-usuario-card-detail-value">
                    <span className={`admin-badge admin-badge-${usuario.estado}`}>
                      <IonIcon icon={usuario.estado === 'activo' ? checkmarkCircleOutline : closeCircleOutline} />
                      {usuario.estado}
                    </span>
                  </div>
                </div>
                <div className="admin-usuario-card-detail">
                  <div className="admin-usuario-card-detail-label">Fecha Creación</div>
                  <div className="admin-usuario-card-detail-value">{usuario.fechaCreacion}</div>
                </div>
                <div className="admin-usuario-card-detail">
                  <div className="admin-usuario-card-detail-label">Último Login</div>
                  <div className="admin-usuario-card-detail-value">{usuario.ultimoLogin || 'Nunca'}</div>
                </div>
              </div>

              <div className="admin-usuario-card-actions">
                <button className="admin-btn admin-btn-outline">
                  <IonIcon icon={eyeOutline} />
                  Ver Detalles
                </button>
                <button 
                  className="admin-btn admin-btn-danger"
                  onClick={() => eliminarUsuario(usuario.id)}
                >
                  <IonIcon icon={trashOutline} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Renderizar sección de productos
  const renderProductos = () => (
    <div>
      {/* Formulario crear producto */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <IonIcon icon={addOutline} />
            Agregar Nuevo Producto
          </h2>
        </div>
        
        <form className="admin-form admin-form-productos" onSubmit={(e) => { e.preventDefault(); crearProducto(); }}>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-form-label">Nombre del Producto *</label>
              <input
                type="text"
                className="admin-form-input"
                value={nuevoProducto.nombre}
                onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                placeholder="Ej: Agua Piatua 2L"
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Precio (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="admin-form-input"
                value={nuevoProducto.precio}
                onChange={(e) => setNuevoProducto({...nuevoProducto, precio: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Categoría</label>
              <select
                className="admin-form-select"
                value={nuevoProducto.categoria}
                onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})}
              >
                <option value="">Seleccionar categoría</option>
                <option value="individual">Individual</option>
                <option value="pack">Pack/Multipack</option>
                <option value="garrafa">Garrafa</option>
                <option value="hielo">Hielo</option>
              </select>
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Stock Inicial</label>
              <input
                type="number"
                min="0"
                className="admin-form-input"
                value={nuevoProducto.stock}
                onChange={(e) => setNuevoProducto({...nuevoProducto, stock: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="admin-form-group admin-form-group-full">
            <label className="admin-form-label">Descripción *</label>
            <textarea
              className="admin-form-textarea"
              value={nuevoProducto.descripcion}
              onChange={(e) => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})}
              placeholder="Descripción detallada del producto"
              required
            />
          </div>
          
          <div className="admin-form-group admin-form-group-full">
            <label className="admin-form-label">URL de Imagen</label>
            <input
              type="text"
              className="admin-form-input"
              value={nuevoProducto.imagen}
              onChange={(e) => setNuevoProducto({...nuevoProducto, imagen: e.target.value})}
              placeholder="producto.jpg"
            />
          </div>
          
          <button 
            type="submit" 
            className="admin-btn admin-btn-success"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="admin-spinner" style={{ width: '16px', height: '16px' }}></div>
                Creando...
              </>
            ) : (
              <>
                <IonIcon icon={addOutline} />
                Agregar Producto
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Tabla de productos */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <IonIcon icon={cubeOutline} />
            Catálogo de Productos ({productos.filter(p => 
              p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
            ).length})
          </h2>
          <div className="admin-search-container">
            <input
              type="text"
              className="admin-search-input"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IonIcon icon={searchOutline} className="admin-search-icon" />
          </div>
        </div>
        
        {/* Tabla de productos para desktop */}
        <div className="admin-table-container admin-productos-table-enhanced">
          <table className="admin-table admin-table-productos-enhanced">
            <thead>
              <tr>
                <th>ID</th>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Ventas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos
                .filter(producto => 
                  producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(producto => (
                <tr key={producto.id} className={`admin-producto-row ${producto.activo ? 'admin-producto-activo' : 'admin-producto-inactivo'}`}>
                  <td className="admin-producto-id">#{producto.id}</td>
                  <td className="admin-producto-imagen">
                    <img 
                      src={producto.imagen} 
                      alt={producto.nombre}
                      className="admin-producto-img"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'default.jpg';
                      }}
                    />
                  </td>
                  <td className="admin-producto-nombre">{producto.nombre}</td>
                  <td className="admin-producto-precio">${producto.precio.toFixed(2)}</td>
                  <td>
                    <span className={`admin-categoria-badge ${producto.categoria}`}>
                      {producto.categoria}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-stock-indicator ${
                      producto.stock === 0 ? 'out' :
                      producto.stock <= 10 ? 'low' :
                      producto.stock <= 30 ? 'medium' : 'high'
                    }`}>
                      <IonIcon icon={
                        producto.stock === 0 ? closeCircleOutline :
                        producto.stock <= 10 ? trendingDownOutline :
                        checkmarkCircleOutline
                      } />
                      {producto.stock}
                    </span>
                  </td>
                  <td style={{ color: '#8B5CF6', fontWeight: '600' }}>{producto.ventas}</td>
                  <td>
                    <span className={`admin-badge ${producto.activo ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                      <IonIcon icon={producto.activo ? checkmarkCircleOutline : closeCircleOutline} />
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className={`admin-btn ${producto.activo ? 'admin-btn-outline' : 'admin-btn-success'}`}
                        style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                        onClick={() => toggleProductoEstado(producto.id)}
                      >
                        {producto.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button className="admin-btn admin-btn-outline" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                        <IonIcon icon={createOutline} />
                      </button>
                      <button 
                        className="admin-btn admin-btn-danger" 
                        style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                        onClick={() => {
                          setAlertConfig({
                            isOpen: true,
                            header: 'Confirmar eliminación',
                            message: `¿Estás seguro de eliminar "${producto.nombre}"?`,
                            buttons: [
                              { text: 'Cancelar', role: 'cancel' },
                              {
                                text: 'Eliminar',
                                handler: () => {
                                  setProductos(productos.filter(p => p.id !== producto.id));
                                  showMessage(`Producto ${producto.nombre} eliminado`, 'success');
                                }
                              }
                            ]
                          });
                          setShowAlert(true);
                        }}
                      >
                        <IonIcon icon={trashOutline} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vista de cuadrícula para tablet y móvil */}
        <div className="admin-productos-grid">
          {productos
            .filter(producto => 
              producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
              producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(producto => (
            <div key={producto.id} className={`admin-producto-grid-card ${producto.activo ? 'admin-producto-activo' : 'admin-producto-inactivo'}`}>
              <div className="admin-producto-grid-header">
                <img 
                  src={producto.imagen} 
                  alt={producto.nombre}
                  className="admin-producto-grid-img"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'default.jpg';
                  }}
                />
                <div className="admin-producto-grid-info">
                  <div className="admin-producto-grid-name">{producto.nombre}</div>
                  <div className="admin-producto-grid-price">${producto.precio.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="admin-producto-grid-details">
                <div className="admin-producto-grid-detail">
                  <div className="admin-producto-grid-detail-label">ID</div>
                  <div className="admin-producto-grid-detail-value">#{producto.id}</div>
                </div>
                <div className="admin-producto-grid-detail">
                  <div className="admin-producto-grid-detail-label">Categoría</div>
                  <div className="admin-producto-grid-detail-value">
                    <span className={`admin-categoria-badge ${producto.categoria}`}>
                      {producto.categoria}
                    </span>
                  </div>
                </div>
                <div className="admin-producto-grid-detail">
                  <div className="admin-producto-grid-detail-label">Stock</div>
                  <div className="admin-producto-grid-detail-value">
                    <span className={`admin-stock-indicator ${
                      producto.stock === 0 ? 'out' :
                      producto.stock <= 10 ? 'low' :
                      producto.stock <= 30 ? 'medium' : 'high'
                    }`}>
                      <IonIcon icon={
                        producto.stock === 0 ? closeCircleOutline :
                        producto.stock <= 10 ? trendingDownOutline :
                        checkmarkCircleOutline
                      } />
                      {producto.stock}
                    </span>
                  </div>
                </div>
                <div className="admin-producto-grid-detail">
                  <div className="admin-producto-grid-detail-label">Ventas</div>
                  <div className="admin-producto-grid-detail-value" style={{ color: '#8B5CF6', fontWeight: '600' }}>
                    {producto.ventas}
                  </div>
                </div>
                <div className="admin-producto-grid-detail">
                  <div className="admin-producto-grid-detail-label">Estado</div>
                  <div className="admin-producto-grid-detail-value">
                    <span className={`admin-badge ${producto.activo ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                      <IonIcon icon={producto.activo ? checkmarkCircleOutline : closeCircleOutline} />
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              {producto.descripcion && (
                <div className="admin-producto-grid-description">
                  <p className="admin-producto-grid-description-text">{producto.descripcion}</p>
                </div>
              )}

              <div className="admin-producto-grid-actions">
                <button 
                  className={`admin-btn ${producto.activo ? 'admin-btn-outline' : 'admin-btn-success'}`}
                  onClick={() => toggleProductoEstado(producto.id)}
                >
                  <IonIcon icon={producto.activo ? closeCircleOutline : checkmarkCircleOutline} />
                  {producto.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button className="admin-btn admin-btn-outline">
                  <IonIcon icon={createOutline} />
                  Editar
                </button>
                <button 
                  className="admin-btn admin-btn-danger"
                  onClick={() => {
                    setAlertConfig({
                      isOpen: true,
                      header: 'Confirmar eliminación',
                      message: `¿Estás seguro de eliminar "${producto.nombre}"?`,
                      buttons: [
                        { text: 'Cancelar', role: 'cancel' },
                        {
                          text: 'Eliminar',
                          handler: () => {
                            setProductos(productos.filter(p => p.id !== producto.id));
                            showMessage(`Producto ${producto.nombre} eliminado`, 'success');
                          }
                        }
                      ]
                    });
                    setShowAlert(true);
                  }}
                >
                  <IonIcon icon={trashOutline} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Vista de tarjetas para móviles muy pequeños */}
        <div className="admin-productos-cards">
          {productos
            .filter(producto => 
              producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
              producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(producto => (
            <div key={producto.id} className="admin-producto-card">
              <div className="admin-producto-card-header">
                <img 
                  src={producto.imagen} 
                  alt={producto.nombre}
                  className="admin-producto-card-img"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'default.jpg';
                  }}
                />
                <div className="admin-producto-card-info">
                  <div className="admin-producto-card-name">{producto.nombre}</div>
                  <div className="admin-producto-card-price">${producto.precio.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="admin-producto-card-details">
                <div className="admin-producto-card-detail">
                  <span>Categoría:</span>
                  <span className="admin-badge admin-badge-primary">{producto.categoria}</span>
                </div>
                <div className="admin-producto-card-detail">
                  <span>Stock:</span>
                  <span>{inventoryService.getProductById(producto.id)?.stock || 0}</span>
                </div>
                <div className="admin-producto-card-detail">
                  <span>Ventas:</span>
                  <span style={{ color: '#8B5CF6', fontWeight: '600' }}>{producto.ventas || 0}</span>
                </div>
                <div className="admin-producto-card-detail">
                  <span>Estado:</span>
                  <span className="admin-badge admin-badge-success">
                    <IonIcon icon={checkmarkCircleOutline} />
                    Activo
                  </span>
                </div>
              </div>

              <div className="admin-producto-card-actions">
                <button 
                  className="admin-btn-icon admin-btn-warning"
                  onClick={() => {
                    const currentStock = inventoryService.getProductById(producto.id)?.stock || 0;
                    const nuevoStock = prompt(`Stock actual: ${currentStock}\nNuevo stock:`);
                    if (nuevoStock && !isNaN(Number(nuevoStock))) {
                      updateStock(producto.id, parseInt(nuevoStock));
                    }
                  }}
                >
                  <IonIcon icon={createOutline} />
                </button>
                <button 
                  className="admin-btn-icon admin-btn-danger"
                  onClick={() => {
                    if (window.confirm(`¿Eliminar ${producto.nombre}?`)) {
                      setProductos(productos.filter(p => p.id !== producto.id));
                      showMessage(`Producto ${producto.nombre} eliminado`, 'success');
                    }
                  }}
                >
                  <IonIcon icon={trashOutline} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Renderizar sección de reportes
  // Estados adicionales para gestión de inventario
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [stockUpdate, setStockUpdate] = useState({ newStock: 0, minStock: 0, maxStock: 0 });

  // Renderizar sección de inventario
  const renderInventario = () => (
    <div>
      {/* Estadísticas de inventario responsive */}
      <div className="admin-inventario-stats">
        <div className="admin-inventario-stat-card">
          <div className="admin-inventario-stat-content">
            <div className="admin-inventario-stat-info">
              <h3>Total Productos</h3>
              <div className="admin-inventario-stat-number">{inventoryService.getInventoryStats().total}</div>
            </div>
            <div className="admin-inventario-stat-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
              <IonIcon icon={cubeOutline} />
            </div>
          </div>
          <div className="admin-inventario-stat-trend">
            <IonIcon icon={trendingUpOutline} className="admin-inventario-stat-trend-positive" />
            <span className="admin-inventario-stat-trend-positive">Gestión activa</span>
          </div>
        </div>

        <div className="admin-inventario-stat-card">
          <div className="admin-inventario-stat-content">
            <div className="admin-inventario-stat-info">
              <h3>En Stock</h3>
              <div className="admin-inventario-stat-number">{inventoryService.getInventoryStats().available}</div>
            </div>
            <div className="admin-inventario-stat-icon" style={{ background: 'linear-gradient(135deg, #10B981, #047857)' }}>
              <IonIcon icon={checkmarkCircleOutline} />
            </div>
          </div>
          <div className="admin-inventario-stat-trend">
            <IonIcon icon={checkmarkCircleOutline} className="admin-inventario-stat-trend-positive" />
            <span className="admin-inventario-stat-trend-positive">Disponibles</span>
          </div>
        </div>

        <div className="admin-inventario-stat-card">
          <div className="admin-inventario-stat-content">
            <div className="admin-inventario-stat-info">
              <h3>Stock Bajo</h3>
              <div className="admin-inventario-stat-number">{inventoryService.getInventoryStats().lowStock}</div>
            </div>
            <div className="admin-inventario-stat-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              <IonIcon icon={trendingDownOutline} />
            </div>
          </div>
          <div className="admin-inventario-stat-trend">
            <IonIcon icon={trendingDownOutline} className="admin-inventario-stat-trend-negative" />
            <span className="admin-inventario-stat-trend-negative">Reabastecer</span>
          </div>
        </div>

        <div className="admin-inventario-stat-card">
          <div className="admin-inventario-stat-content">
            <div className="admin-inventario-stat-info">
              <h3>Sin Stock</h3>
              <div className="admin-inventario-stat-number">{inventoryService.getInventoryStats().outOfStock}</div>
            </div>
            <div className="admin-inventario-stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
              <IonIcon icon={closeCircleOutline} />
            </div>
          </div>
          <div className="admin-inventario-stat-trend">
            <IonIcon icon={closeCircleOutline} className="admin-inventario-stat-trend-negative" />
            <span className="admin-inventario-stat-trend-negative">Agotados</span>
          </div>
        </div>
      </div>

      {/* Acciones rápidas responsive */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <IonIcon icon={settingsOutline} />
            Acciones de Inventario
          </h2>
        </div>
        <div className="admin-inventario-actions-grid">
          <button 
            className="admin-inventario-quick-btn admin-inventario-quick-btn-primary"
            onClick={resetInventory}
          >
            <div className="admin-inventario-quick-btn-icon">
              <IonIcon icon={saveOutline} />
            </div>
            <div className="admin-inventario-quick-btn-text">
              <span className="admin-inventario-quick-btn-title">Restablecer Inventario</span>
              <span className="admin-inventario-quick-btn-desc">Resetear todos los stocks</span>
            </div>
          </button>
          <button 
            className="admin-inventario-quick-btn admin-inventario-quick-btn-secondary"
            onClick={reloadProducts}
          >
            <div className="admin-inventario-quick-btn-icon">
              <IonIcon icon={refreshOutline} />
            </div>
            <div className="admin-inventario-quick-btn-text">
              <span className="admin-inventario-quick-btn-title">Recargar Datos</span>
              <span className="admin-inventario-quick-btn-desc">Actualizar información</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tabla de gestión de inventario responsive */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <IonIcon icon={storefront} />
            Gestión de Stock
          </h2>
        </div>

        {/* Tabla con scroll horizontal para todas las pantallas */}
        <div className="admin-inventario-table">
          <table className="admin-table-inventario">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Stock Actual</th>
                <th>Stock Mín.</th>
                <th>Stock Máx.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(producto => {
                const inventoryProduct = inventoryService.getProductById(producto.id);
                return (
                  <tr key={producto.id}>
                    <td>
                      <div className="admin-user-avatar">
                        <img src={producto.imagen} alt={producto.nombre} />
                      </div>
                    </td>
                    <td>
                      <div className="admin-product-info">
                        <div className="admin-product-name">{producto.nombre}</div>
                        <div className="admin-product-price">${producto.precio.toFixed(2)}</div>
                      </div>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="admin-form-input-small"
                        value={selectedProduct?.id === producto.id ? stockUpdate.newStock : producto.stock}
                        onChange={(e) => {
                          setSelectedProduct(producto);
                          setStockUpdate({...stockUpdate, newStock: parseInt(e.target.value) || 0});
                        }}
                        min="0"
                        style={{ width: '80px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="admin-form-input-small"
                        value={selectedProduct?.id === producto.id ? stockUpdate.minStock : inventoryProduct?.stockMinimo || 0}
                        onChange={(e) => {
                          setSelectedProduct(producto);
                          setStockUpdate({...stockUpdate, minStock: parseInt(e.target.value) || 0});
                        }}
                        min="0"
                        style={{ width: '60px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="admin-form-input-small"
                        value={selectedProduct?.id === producto.id ? stockUpdate.maxStock : inventoryProduct?.stockMaximo || 0}
                        onChange={(e) => {
                          setSelectedProduct(producto);
                          setStockUpdate({...stockUpdate, maxStock: parseInt(e.target.value) || 0});
                        }}
                        min="0"
                        style={{ width: '80px' }}
                      />
                    </td>
                    <td>
                      <span className={`admin-badge ${
                        producto.stock === 0 ? 'admin-badge-danger' : 
                        producto.stock <= (inventoryProduct?.stockMinimo || 10) ? 'admin-badge-warning' : 
                        'admin-badge-success'
                      }`}>
                        {producto.stock === 0 ? 'Sin Stock' : 
                         producto.stock <= (inventoryProduct?.stockMinimo || 10) ? 'Stock Bajo' : 
                         'Disponible'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="admin-btn-icon admin-btn-success"
                          onClick={() => {
                            if (selectedProduct?.id === producto.id) {
                              updateStock(producto.id, stockUpdate.newStock);
                              updateStockLimits(producto.id, stockUpdate.minStock, stockUpdate.maxStock);
                              setSelectedProduct(null);
                              setStockUpdate({ newStock: 0, minStock: 0, maxStock: 0 });
                            } else {
                              showMessage('Modifique los valores primero', 'warning');
                            }
                          }}
                          title="Guardar cambios"
                        >
                          <IonIcon icon={saveOutline} />
                        </button>
                        <button
                          className="admin-btn-icon admin-btn-primary"
                          onClick={() => toggleProductoEstado(producto.id)}
                          title={producto.activo ? 'Desactivar' : 'Activar'}
                        >
                          <IonIcon icon={producto.activo ? closeCircleOutline : checkmarkCircleOutline} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {productos.length === 0 && (
          <div className="admin-empty-state" style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            marginTop: '20px'
          }}>
            <IonIcon icon={cubeOutline} style={{ fontSize: '64px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '16px' }} />
            <h3 style={{ color: 'white', marginBottom: '8px' }}>No hay productos en el inventario</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '20px' }}>
              Agrega productos en la sección "Productos" o utiliza el botón de recargar datos.
            </p>
            <button 
              className="admin-btn admin-btn-primary"
              onClick={reloadProducts}
            >
              <IonIcon icon={refreshOutline} />
              Recargar Productos
            </button>
          </div>
        )}
      </div>

      {/* Alertas de stock bajo */}
      {inventoryService.getLowStockProducts().length > 0 && (
        <div className="admin-card" style={{ border: '2px solid #F59E0B', background: 'rgba(245, 158, 11, 0.1)' }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title" style={{ color: '#F59E0B' }}>
              <IonIcon icon={trendingDownOutline} />
              Alertas de Stock Bajo
            </h2>
          </div>
          <div className="admin-notification-list">
            {inventoryService.getLowStockProducts().map((product: any) => (
              <div key={product.id} className="admin-notification-item">
                <div className="admin-notification-content">
                  <strong>{product.nombre}</strong>
                  <span>Stock actual: {product.stock} | Mínimo requerido: {product.stockMinimo}</span>
                </div>
                <button 
                  className="admin-btn-icon admin-btn-warning"
                  onClick={() => {
                    setSelectedProduct(productos.find(p => p.id === product.id) || null);
                    setStockUpdate({ 
                      newStock: product.stockMaximo, 
                      minStock: product.stockMinimo, 
                      maxStock: product.stockMaximo 
                    });
                  }}
                  title="Reabastecer"
                >
                  <IonIcon icon={trendingUpOutline} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderReportes = () => (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <IonIcon icon={analyticsOutline} />
            Reportes y Análisis
          </h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            padding: '24px', 
            borderRadius: '16px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <h3 style={{ color: '#3B82F6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={peopleOutline} />
              Usuarios Registrados
            </h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
              {usuarios.length}
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
              Total de usuarios en la plataforma
            </p>
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Vendedores:</span>
                <span>{usuarios.filter(u => u.tipo === 'vendedor').length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Clientes:</span>
                <span>{usuarios.filter(u => u.tipo === 'cliente').length}</span>
              </div>
            </div>
          </div>
          
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            padding: '24px', 
            borderRadius: '16px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <h3 style={{ color: '#10B981', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={cubeOutline} />
              Inventario Total
            </h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
              {productos.reduce((total, p) => total + p.stock, 0)}
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
              Unidades en inventario
            </p>
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Productos activos:</span>
                <span>{productos.filter(p => p.activo).length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Stock bajo (&lt;30):</span>
                <span style={{ color: '#F59E0B' }}>{productos.filter(p => p.stock < 30).length}</span>
              </div>
            </div>
          </div>
          
          <div style={{ 
            background: 'rgba(245, 158, 11, 0.1)', 
            padding: '24px', 
            borderRadius: '16px',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            <h3 style={{ color: '#F59E0B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={barChartOutline} />
              Ventas Totales
            </h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
              {productos.reduce((total, p) => total + p.ventas, 0)}
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
              Unidades vendidas hasta hoy
            </p>
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Producto top:</span>
                <span>{productos.sort((a, b) => b.ventas - a.ventas)[0]?.nombre.split(' ').slice(0, 2).join(' ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Ventas hoy:</span>
                <span>23</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Top productos */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonIcon icon={trendingUpOutline} />
            Top Productos por Ventas
          </h3>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {productos
              .sort((a, b) => b.ventas - a.ventas)
              .slice(0, 5)
              .map((producto, index) => (
                <div key={producto.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    #{index + 1}
                  </div>
                  
                  <img 
                    src={producto.imagen} 
                    alt={producto.nombre}
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      objectFit: 'contain', 
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.1)'
                    }}
                  />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'white' }}>{producto.nombre}</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      ${producto.precio.toFixed(2)} • Stock: {producto.stock}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#10B981' }}>
                      {producto.ventas}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      ventas
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  // Renderizar contenido según sección activa
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'usuarios':
        return renderUsuarios();
      case 'productos':
        return renderProductos();
      case 'inventario':
        return renderInventario();
      case 'reportes':
        return renderReportes();
      default:
        return renderDashboard();
    }
  };
  
  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="admin-interface">
          {/* Backdrop para móvil */}
          <div 
            className={`admin-backdrop ${sidebarOpen ? 'open' : ''}`}
            onClick={() => setSidebarOpen(false)}
          ></div>
          
          {/* Sidebar */}
          <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}>
            {/* Header del sidebar */}
            <div className="admin-sidebar-header">
              <div className="admin-logo">💧</div>
              <div className="admin-brand">Agua Piatua</div>
            </div>
            
            {/* Navegación */}
            <nav className="admin-nav">
              <button
                className={`admin-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('dashboard');
                  setSidebarOpen(false);
                }}
              >
                <IonIcon icon={gridOutline} />
                <span className="admin-nav-text">Dashboard</span>
              </button>
              
              <button
                className={`admin-nav-item ${activeSection === 'usuarios' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('usuarios');
                  setSidebarOpen(false);
                }}
              >
                <IonIcon icon={peopleOutline} />
                <span className="admin-nav-text">Usuarios</span>
              </button>
              
              <button
                className={`admin-nav-item ${activeSection === 'productos' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('productos');
                  setSidebarOpen(false);
                }}
              >
                <IonIcon icon={cubeOutline} />
                <span className="admin-nav-text">Productos</span>
              </button>
              
              <button
                className={`admin-nav-item ${activeSection === 'inventario' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('inventario');
                  setSidebarOpen(false);
                }}
              >
                <IonIcon icon={storefront} />
                <span className="admin-nav-text">Inventario</span>
              </button>
              
              <button
                className={`admin-nav-item ${activeSection === 'reportes' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('reportes');
                  setSidebarOpen(false);
                }}
              >
                <IonIcon icon={analyticsOutline} />
                <span className="admin-nav-text">Reportes</span>
              </button>
              
              <button
                className="admin-nav-item"
                onClick={() => {
                  setSidebarOpen(false);
                  // Aquí puedes agregar la funcionalidad de configuración
                }}
              >
                <IonIcon icon={settingsOutline} />
                <span className="admin-nav-text">Configuración</span>
              </button>
            </nav>
            
            {/* Footer del sidebar */}
            <div className="admin-sidebar-footer">
              <div className="admin-user-info">
                <div className="admin-user-avatar">
                  A
                </div>
                <div className="admin-user-details">
                  <div className="admin-user-name">Administrador</div>
                  <div className="admin-user-role">Super Admin</div>
                </div>
              </div>
            </div>
          </aside>
          
          {/* Contenido principal */}
          <main className="admin-main">
            {/* Header superior */}
            <header className="admin-header">
              <div className="admin-header-left">
                <button 
                  className="admin-toggle-btn"
                  onClick={() => {
                    if (window.innerWidth <= 1024) {
                      setSidebarOpen(!sidebarOpen);
                    } else {
                      setSidebarCollapsed(!sidebarCollapsed);
                    }
                  }}
                >
                  <IonIcon icon={menuOutline} />
                </button>
                
                <div className="admin-breadcrumb">
                  <IonIcon icon={
                    activeSection === 'dashboard' ? gridOutline :
                    activeSection === 'usuarios' ? peopleOutline :
                    activeSection === 'productos' ? cubeOutline :
                    activeSection === 'inventario' ? storefront :
                    activeSection === 'reportes' ? analyticsOutline :
                    gridOutline
                  } />
                  {activeSection === 'dashboard' && 'Panel de Control'}
                  {activeSection === 'usuarios' && 'Gestión de Usuarios'}
                  {activeSection === 'productos' && 'Gestión de Productos'}
                  {activeSection === 'inventario' && 'Gestión de Inventario'}
                  {activeSection === 'reportes' && 'Reportes y Análisis'}
                </div>
              </div>
              
              <div className="admin-header-right">
                {/* Buscador */}
                <div className="admin-search">
                  <IonIcon icon={searchOutline} className="admin-search-icon" />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Buscar usuarios, productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Notificaciones */}
                <button className="admin-notifications">
                  <IonIcon icon={notificationsOutline} />
                  <div className="admin-notification-badge"></div>
                </button>
                
                {/* Botón de logout */}
                <button 
                  className="admin-btn admin-btn-outline"
                  onClick={handleLogout}
                  style={{ padding: '8px 16px' }}
                >
                  <IonIcon icon={logOutOutline} />
                  Salir
                </button>
              </div>
            </header>
            
            {/* Área de contenido */}
            <div className="admin-content">
              {renderContent()}
            </div>
          </main>
        </div>
        
        {/* Toast para mensajes */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          position="top"
        />
        
        {/* Alert para confirmaciones */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          {...alertConfig}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminInterface;
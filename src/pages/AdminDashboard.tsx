
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonIcon, IonToast, IonAlert, IonPage, IonContent
} from '@ionic/react';
import ApiService from '../services/apiService';
import notificationService from '../services/notificationService';
import {
  gridOutline, peopleOutline, cubeOutline, analyticsOutline,
  settingsOutline, logOutOutline, menuOutline, searchOutline,
  notificationsOutline, addOutline, createOutline, trashOutline,
  eyeOutline, checkmarkCircleOutline, closeCircleOutline,
  trendingUpOutline, trendingDownOutline, saveOutline,
  personAddOutline, storefront, barChartOutline, cartOutline,
  timeOutline, carOutline, personCircleOutline
} from 'ionicons/icons';
import './AdminDashboard.css';

// Tipos TypeScript
interface Usuario {
  id: number;
  username: string;
  email: string;
  tipo: 'vendedor' | 'cliente' | 'admin';
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

interface Pedido {
  id: number;
  cliente_id: number;
  cliente_nombre: string;
  vendedor_id?: number;
  vendedor_nombre?: string;
  total: number;
  estado: string;
  direccion_entrega: string;
  telefono_contacto: string;
  fecha_pedido: string;
  metodo_pago?: string;
  comprobante_pago?: string;
  items?: any[];
}

// Datos iniciales simulados
const usuariosIniciales: Usuario[] = [
  {
    id: 1,
    username: 'vendedor1',
    email: 'vendedor1@aguacampos.com',
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
    email: 'vendedor2@aguacampos.com',
    tipo: 'vendedor',
    fechaCreacion: '2024-03-05',
    estado: 'inactivo',
    ultimoLogin: '2024-12-18 09:20'
  }
];

const productosIniciales: Producto[] = [
  {
    id: 1,
    nombre: 'AGUA CAMPOS 500ml',
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
    nombre: 'AGUA CAMPOS 1L',
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
    nombre: 'AGUA CAMPOS Six Pack',
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
    nombre: 'AGUA CAMPOS 20L',
    precio: 2.50,
    descripcion: 'Garrafa de 20 litros para dispensador',
    imagen: 'garrafon.png',
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
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<number[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Estados para formularios
  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: '',
    email: '',
    password: '',
    tipo: 'vendedor' as 'vendedor' | 'cliente' | 'admin'
  });
  
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: 0,
    descripcion: '',
    imagen: '',
    categoria: '',
    stock: 0
  });

  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  // Estados de UI
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de notificaciones
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [notificationData, setNotificationData] = useState<any>(null);

  // Estados para asignación de pedidos
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [selectedVendedorId, setSelectedVendedorId] = useState<number | null>(null);
  const [vendedoresDisponibles, setVendedoresDisponibles] = useState<any[]>([]);

  // Estado para estadísticas del dashboard
  const [estadisticas, setEstadisticas] = useState<Estadistica>({
    totalUsuarios: 0,
    totalProductos: 0,
    pedidosHoy: 0,
    ventasHoy: 0,
    crecimientoUsuarios: 0,
    crecimientoVentas: 0
  });
  
  // Verificar autenticación y cargar datos
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const isAuthenticated = localStorage.getItem('isAuthenticated');

    if (!isAuthenticated || userType !== 'administrador') {
      showMessage('Acceso denegado. Solo administradores.', 'danger');
      setTimeout(() => history.push('/login'), 2000);
      return;
    }

    // Cargar datos desde la API
    const loadData = async () => {
      try {
        console.log('Cargando datos del admin...');

        // Cargar productos
        const productsData = await ApiService.getProducts();
        console.log('Productos obtenidos:', productsData);

        setProductos(productsData.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          precio: Number(p.precio),
          descripcion: p.descripcion || '',
          imagen: p.imagen || 'default.jpg',
          categoria: p.categoria || 'general',
          stock: p.stock || 0,
          fechaCreacion: p.fecha_creacion,
          activo: p.activo,
          ventas: Math.floor(Math.random() * 1000)
        })));

        // Cargar usuarios
        const usersData = await ApiService.getUsers();
        console.log('Usuarios obtenidos:', usersData);

        setUsuarios(usersData.map((u: any) => ({
          id: u.id,
          username: u.nombre,
          email: u.email,
          tipo: u.tipo_usuario === 'Admin' ? 'admin' :
                u.tipo_usuario === 'Vendedor' ? 'vendedor' : 'cliente',
          fechaCreacion: u.fecha_registro?.split('T')[0] || '',
          estado: u.activo ? 'activo' : 'inactivo',
          ultimoLogin: u.ultimo_login
        })));

        // Cargar pedidos
        const ordersData = await ApiService.getOrders();
        console.log('📦 Pedidos básicos obtenidos:', ordersData);

        // Obtener detalles completos de cada pedido (incluyendo productos)
        const detailedOrders = await Promise.all(
          ordersData.map(async (o: any) => {
            try {
              const orderDetails = await ApiService.getOrder(o.id);
              console.log(`📋 Detalles del pedido #${o.id}:`, orderDetails);
              return orderDetails;
            } catch (error) {
              console.error(`Error obteniendo detalles del pedido ${o.id}:`, error);
              return o; // Devolver orden básica si falla
            }
          })
        );

        console.log('✅ Todos los pedidos con detalles:', detailedOrders);

        setPedidos(detailedOrders.map((o: any) => ({
          id: o.id,
          cliente_id: o.cliente_id,
          cliente_nombre: o.cliente_nombre || 'Cliente desconocido',
          vendedor_id: o.vendedor_id || null,
          vendedor_nombre: o.vendedor_nombre || 'Sin asignar',
          total: Number(o.total) || 0,
          estado: o.estado || 'Pendiente',
          direccion_entrega: o.direccion_entrega || '',
          telefono_contacto: o.telefono_contacto || '',
          fecha_pedido: o.fecha_pedido || new Date().toISOString(),
          metodo_pago: o.metodo_pago || 'efectivo',
          comprobante_pago: o.comprobante_pago || null,
          items: o.items || []
        })));

        // Cargar estadísticas del dashboard
        const statsData = await ApiService.getEstadisticasDashboard();
        console.log('📊 Estadísticas obtenidas:', statsData);

        setEstadisticas({
          totalUsuarios: statsData.totalUsuarios,
          totalProductos: statsData.totalProductos,
          pedidosHoy: statsData.pedidosHoy,
          ventasHoy: parseFloat(statsData.ventasHoy),
          crecimientoUsuarios: statsData.crecimientoUsuarios,
          crecimientoVentas: statsData.crecimientoVentas
        });

      } catch (error) {
        console.error('Error loading data:', error);
        showMessage('Error al cargar datos', 'danger');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();

    // Conectar Socket.IO para notificaciones
    const userId = localStorage.getItem('userId');
    if (userId) {
      notificationService.connect(parseInt(userId), 'Admin');

      // Escuchar nuevos pedidos
      notificationService.onNewOrder((data) => {
        console.log('🔔 Nuevo pedido recibido:', data);
        setNotificationCount(prev => prev + 1);
        setNotificationData(data);
        setShowNotificationToast(true);

        // Recargar pedidos
        reloadOrders();

        // Actualizar estadísticas si es necesario
        showMessage(`Nuevo pedido de ${data.cliente} - Total: $${data.total}`, 'success');
      });

      // Escuchar actualizaciones de estado de pedidos
      notificationService.onOrderStatusUpdated((data) => {
        console.log('📦 Estado de pedido actualizado:', data);

        // Recargar pedidos
        reloadOrders();

        // Mostrar notificación específica
        if (data.estado === 'Entregado') {
          showMessage(`✅ Pedido #${data.orderId} entregado por ${data.vendedor}`, 'success');
        } else {
          showMessage(`📦 Pedido #${data.orderId} actualizado a: ${data.estado}`, 'success');
        }
      });
    }

    // Cleanup: desconectar al desmontar
    return () => {
      notificationService.disconnect();
    };
  }, [history]);

  // UseEffect para habilitar scroll horizontal en tablas móviles
  useEffect(() => {
    const enableTableScroll = () => {
      const isMobile = window.innerWidth <= 768;
      const viewportWidth = window.innerWidth;

      const tableContainers = document.querySelectorAll('.admin-table-container');
      const tables = document.querySelectorAll('.admin-table');

      console.log('📱 Viewport width:', viewportWidth, 'Mobile:', isMobile);

      tableContainers.forEach((container, index) => {
        const element = container as HTMLElement;
        const table = tables[index] as HTMLElement;

        if (isMobile) {
          // En móviles, forzar scroll
          element.style.overflowX = 'scroll';
          element.style.width = '100vw';
          element.style.maxWidth = '100vw';
          (element.style as any).webkitOverflowScrolling = 'touch';

          // Asegurar que la tabla sea más ancha que el viewport
          if (table) {
            const minTableWidth = Math.max(viewportWidth * 1.5, 800);
            table.style.minWidth = `${minTableWidth}px`;
            console.log(`✅ Tabla ${index + 1}: min-width = ${minTableWidth}px`);
          }

          // Prevenir que otros elementos bloqueen el scroll
          element.addEventListener('touchstart', (e) => {
            e.stopPropagation();
          }, { passive: true });

          element.addEventListener('touchmove', (e) => {
            e.stopPropagation();
          }, { passive: true });

          // Log detallado
          setTimeout(() => {
            console.log(`📊 Tabla ${index + 1}:`, {
              containerWidth: element.clientWidth,
              tableWidth: table?.scrollWidth || 0,
              scrollWidth: element.scrollWidth,
              canScroll: element.scrollWidth > element.clientWidth,
              scrollLeft: element.scrollLeft,
              maxScrollLeft: element.scrollWidth - element.clientWidth
            });
          }, 200);
        }
      });
    };

    // Ejecutar inmediatamente
    enableTableScroll();

    // Ejecutar después de renders
    const timer1 = setTimeout(enableTableScroll, 100);
    const timer2 = setTimeout(enableTableScroll, 500);

    // Escuchar cambios de orientación/resize
    window.addEventListener('resize', enableTableScroll);
    window.addEventListener('orientationchange', enableTableScroll);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', enableTableScroll);
      window.removeEventListener('orientationchange', enableTableScroll);
    };
  }, [activeSection, productos, usuarios, pedidos]);

  // Función para mostrar mensajes
  const showMessage = (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  // Función para recargar pedidos
  // Función para recargar estadísticas
  const reloadEstadisticas = async () => {
    try {
      const statsData = await ApiService.getEstadisticasDashboard();
      console.log('📊 Estadísticas recargadas:', statsData);

      setEstadisticas({
        totalUsuarios: statsData.totalUsuarios,
        totalProductos: statsData.totalProductos,
        pedidosHoy: statsData.pedidosHoy,
        ventasHoy: parseFloat(statsData.ventasHoy),
        crecimientoUsuarios: statsData.crecimientoUsuarios,
        crecimientoVentas: statsData.crecimientoVentas
      });
    } catch (error) {
      console.error('Error recargando estadísticas:', error);
    }
  };

  const reloadOrders = async () => {
    try {
      const ordersData = await ApiService.getOrders();
      console.log('📦 Pedidos básicos recibidos:', ordersData);

      // Obtener detalles completos de cada pedido (incluyendo productos)
      const detailedOrders = await Promise.all(
        ordersData.map(async (o: any) => {
          try {
            const orderDetails = await ApiService.getOrder(o.id);
            console.log(`📋 Detalles del pedido #${o.id}:`, orderDetails);
            return orderDetails;
          } catch (error) {
            console.error(`Error obteniendo detalles del pedido ${o.id}:`, error);
            return o; // Devolver orden básica si falla
          }
        })
      );

      console.log('✅ Todos los pedidos con detalles:', detailedOrders);

      setPedidos(detailedOrders.map((o: any) => ({
        id: o.id,
        cliente_id: o.cliente_id,
        cliente_nombre: o.cliente_nombre || 'Cliente desconocido',
        vendedor_id: o.vendedor_id || null,
        vendedor_nombre: o.vendedor_nombre || 'Sin asignar',
        total: Number(o.total) || 0,
        estado: o.estado || 'Pendiente',
        direccion_entrega: o.direccion_entrega || '',
        telefono_contacto: o.telefono_contacto || '',
        fecha_pedido: o.fecha_pedido || new Date().toISOString(),
        metodo_pago: o.metodo_pago || 'efectivo',
        comprobante_pago: o.comprobante_pago || null,
        items: o.items || []
      })));

      // Recargar estadísticas también
      await reloadEstadisticas();
    } catch (error) {
      console.error('Error recargando pedidos:', error);
      showMessage('Error al recargar pedidos', 'danger');
    }
  };
  
  // Calcular estadísticas (ya se cargan desde la API en useEffect)
  
  // Función para crear usuario
  const crearUsuario = async () => {
    if (!nuevoUsuario.username || !nuevoUsuario.email || !nuevoUsuario.password) {
      showMessage('Por favor complete todos los campos', 'warning');
      return;
    }

    if (nuevoUsuario.password.length < 6) {
      showMessage('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      // Mapear tipo de usuario al formato del backend
      let tipoUsuario: 'Cliente' | 'Vendedor' | 'Admin' = 'Cliente';
      if (nuevoUsuario.tipo === 'vendedor') tipoUsuario = 'Vendedor';
      if (nuevoUsuario.tipo === 'admin') tipoUsuario = 'Admin';

      const response = await ApiService.register({
        nombre: nuevoUsuario.username,
        email: nuevoUsuario.email,
        password: nuevoUsuario.password,
        tipo_usuario: tipoUsuario
      });

      const newUser: Usuario = {
        id: response.user.id,
        username: response.user.nombre,
        email: response.user.email,
        tipo: nuevoUsuario.tipo,
        fechaCreacion: new Date().toISOString().split('T')[0],
        estado: 'activo'
      };

      setUsuarios([...usuarios, newUser]);
      setNuevoUsuario({ username: '', email: '', password: '', tipo: 'vendedor' });
      showMessage(`Usuario ${newUser.username} creado exitosamente`, 'success');
    } catch (error: any) {
      console.error('Error creating user:', error);
      showMessage(error.message || 'Error al crear usuario', 'danger');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para abrir modal de edición de usuario
  const openEditUserModal = (usuario: Usuario) => {
    setEditingUser(usuario);
    setNewPassword('');
    setShowEditUserModal(true);
  };

  // Función para actualizar usuario
  const actualizarUsuario = async () => {
    if (!editingUser) return;

    if (!editingUser.username || !editingUser.email) {
      showMessage('Por favor complete los campos obligatorios', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      // Mapear tipo de usuario al formato del backend
      let tipoUsuario = 'Cliente';
      if (editingUser.tipo === 'vendedor') tipoUsuario = 'Vendedor';
      if (editingUser.tipo === 'admin') tipoUsuario = 'Admin';

      const updateData: any = {
        nombre: editingUser.username,
        email: editingUser.email,
        tipo_usuario: tipoUsuario,
        activo: editingUser.estado === 'activo'
      };

      // Solo incluir password si se ingresó una nueva
      if (newPassword && newPassword.length >= 6) {
        updateData.password = newPassword;
      }

      await ApiService.updateUser(editingUser.id, updateData);

      // Actualizar la lista local
      setUsuarios(usuarios.map(u =>
        u.id === editingUser.id ? editingUser : u
      ));

      showMessage(`Usuario ${editingUser.username} actualizado exitosamente`, 'success');
      setShowEditUserModal(false);
      setEditingUser(null);
      setNewPassword('');
    } catch (error: any) {
      console.error('Error updating user:', error);
      showMessage(error.message || 'Error al actualizar usuario', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar usuario
  const eliminarUsuario = async (id: number) => {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    setAlertConfig({
      isOpen: true,
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar al usuario "${usuario.username}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              setIsLoading(true);

              // Llamar al API para eliminar
              await ApiService.deleteUser(id);

              // Actualizar el estado local
              setUsuarios(usuarios.filter(u => u.id !== id));
              showMessage(`Usuario ${usuario.username} eliminado exitosamente`, 'success');
            } catch (error: any) {
              console.error('Error eliminando usuario:', error);
              showMessage(error.message || 'Error al eliminar usuario', 'danger');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    });
    setShowAlert(true);
  };

  // Función para seleccionar/deseleccionar un usuario
  const toggleSeleccionUsuario = (id: number) => {
    setUsuariosSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
  };

  // Función para seleccionar/deseleccionar todos los usuarios
  const toggleSeleccionarTodos = () => {
    if (usuariosSeleccionados.length === usuarios.length) {
      setUsuariosSeleccionados([]);
    } else {
      setUsuariosSeleccionados(usuarios.map(u => u.id));
    }
  };

  // Función para eliminar múltiples usuarios
  const eliminarUsuariosSeleccionados = async () => {
    if (usuariosSeleccionados.length === 0) {
      showMessage('No hay usuarios seleccionados', 'warning');
      return;
    }

    setAlertConfig({
      isOpen: true,
      header: 'Confirmar eliminación múltiple',
      message: `¿Estás seguro de eliminar ${usuariosSeleccionados.length} usuario(s)? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              setIsLoading(true);

              // Eliminar todos los usuarios en paralelo
              await Promise.all(
                usuariosSeleccionados.map(id => ApiService.deleteUser(id))
              );

              // Actualizar el estado local
              setUsuarios(usuarios.filter(u => !usuariosSeleccionados.includes(u.id)));
              showMessage(`${usuariosSeleccionados.length} usuario(s) eliminado(s) exitosamente`, 'success');

              // Limpiar selección
              setUsuariosSeleccionados([]);
            } catch (error: any) {
              console.error('Error eliminando usuarios:', error);
              showMessage(error.message || 'Error al eliminar usuarios', 'danger');
            } finally {
              setIsLoading(false);
            }
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

    try {
      const response = await ApiService.createProduct({
        nombre: nuevoProducto.nombre,
        precio: nuevoProducto.precio,
        descripcion: nuevoProducto.descripcion,
        imagen: nuevoProducto.imagen || '/agua.jpg',
        categoria: nuevoProducto.categoria || 'general',
        stock: nuevoProducto.stock
      });

      const newProduct: Producto = {
        id: response.product.id,
        nombre: response.product.nombre,
        precio: response.product.precio,
        descripcion: response.product.descripcion,
        imagen: response.product.imagen,
        categoria: response.product.categoria,
        stock: response.product.stock,
        fechaCreacion: new Date().toISOString().split('T')[0],
        activo: true,
        ventas: 0
      };

      setProductos([...productos, newProduct]);
      setNuevoProducto({
        nombre: '', precio: 0, descripcion: '', imagen: '', categoria: '', stock: 0
      });
      showMessage(`Producto ${newProduct.nombre} creado exitosamente`, 'success');
    } catch (error: any) {
      console.error('Error creating product:', error);
      showMessage(error.message || 'Error al crear producto', 'danger');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para abrir modal de edición
  const openEditModal = (producto: Producto) => {
    setEditingProduct(producto);
    setShowEditModal(true);
  };

  // Función para actualizar producto
  const actualizarProducto = async () => {
    if (!editingProduct) return;

    if (!editingProduct.nombre || !editingProduct.precio) {
      showMessage('Por favor complete los campos obligatorios', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      await ApiService.updateProduct(editingProduct.id, {
        nombre: editingProduct.nombre,
        precio: editingProduct.precio,
        descripcion: editingProduct.descripcion,
        imagen: editingProduct.imagen,
        categoria: editingProduct.categoria,
        stock: editingProduct.stock
      });

      // Actualizar la lista local
      setProductos(productos.map(p =>
        p.id === editingProduct.id ? editingProduct : p
      ));

      showMessage(`Producto ${editingProduct.nombre} actualizado exitosamente`, 'success');
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error('Error updating product:', error);
      showMessage(error.message || 'Error al actualizar producto', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para alternar estado de producto
  const toggleProductoEstado = async (id: number) => {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    try {
      await ApiService.updateProduct(id, {
        nombre: producto.nombre,
        precio: producto.precio,
        descripcion: producto.descripcion,
        imagen: producto.imagen,
        categoria: producto.categoria,
        stock: producto.stock,
        activo: !producto.activo
      } as any);

      setProductos(productos.map(p =>
        p.id === id ? { ...p, activo: !p.activo } : p
      ));
      showMessage(`Producto ${producto.activo ? 'desactivado' : 'activado'}`, 'success');
    } catch (error: any) {
      console.error('Error toggling product status:', error);
      showMessage(error.message || 'Error al cambiar estado del producto', 'danger');
    }
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
            setTimeout(() => history.push('/bienvenida'), 1000);
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
          <div style={{ 
            padding: '16px', 
            background: 'rgba(16, 185, 129, 0.1)', 
            borderRadius: '12px', 
            borderLeft: '4px solid #10B981' 
          }}>
            <strong style={{ color: '#10B981' }}>✅ Usuario creado:</strong>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px' }}>
              vendedor2 se registró hace 2 horas
            </span>
          </div>
          
          <div style={{ 
            padding: '16px', 
            background: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '12px', 
            borderLeft: '4px solid #3B82F6' 
          }}>
            <strong style={{ color: '#3B82F6' }}>📦 Producto actualizado:</strong>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px' }}>
              Stock de AGUA CAMPOS 1L actualizado
            </span>
          </div>
          
          {/* Lista de productos con stock */}
          <div style={{
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            borderLeft: '4px solid #3B82F6'
          }}>
            <strong style={{ color: '#3B82F6', marginBottom: '12px', display: 'block' }}>
              📦 Inventario de Productos:
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {productos.filter(p => p.activo).map((producto) => (
                <div
                  key={producto.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: producto.stock <= 10 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: producto.stock <= 10 ? '1px solid rgba(239, 68, 68, 0.3)' : 'none'
                  }}
                >
                  <span style={{
                    color: producto.stock <= 10 ? '#EF4444' : 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    fontWeight: producto.stock <= 10 ? '600' : '400'
                  }}>
                    {producto.stock <= 10 && '⚠️ '}{producto.nombre}
                  </span>
                  <span style={{
                    color: producto.stock <= 10 ? '#EF4444' : '#10B981',
                    fontWeight: '700',
                    fontSize: '1rem',
                    background: producto.stock <= 10 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    {producto.stock} {producto.stock === 1 ? 'ud' : 'uds'}
                  </span>
                </div>
              ))}
              {productos.filter(p => p.activo).length === 0 && (
                <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
                  No hay productos activos
                </span>
              )}
            </div>
          </div>
          
          <div style={{ 
            padding: '16px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            borderRadius: '12px', 
            borderLeft: '4px solid #EF4444' 
          }}>
            <strong style={{ color: '#EF4444' }}>🛑 Producto desactivado:</strong>
            <span style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px' }}>
              AGUA CAMPOS 20L fue desactivado temporalmente
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
        
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); crearUsuario(); }}>
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
                placeholder="usuario@aguacampos.com"
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
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, tipo: e.target.value as 'vendedor' | 'cliente' | 'admin'})}
              >
                <option value="cliente">Cliente</option>
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
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
            Lista de Usuarios ({usuarios.length})
          </h2>
          {usuariosSeleccionados.length > 0 && (
            <button
              className="admin-btn admin-btn-danger"
              onClick={eliminarUsuariosSeleccionados}
              style={{ marginLeft: 'auto' }}
            >
              <IonIcon icon={trashOutline} />
              Eliminar {usuariosSeleccionados.length} usuario(s)
            </button>
          )}
        </div>
        
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={usuariosSeleccionados.length === usuarios.length && usuarios.length > 0}
                    onChange={toggleSeleccionarTodos}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
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
              {usuarios.map(usuario => (
                <tr key={usuario.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={usuariosSeleccionados.includes(usuario.id)}
                      onChange={() => toggleSeleccionUsuario(usuario.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>#{usuario.id}</td>
                  <td style={{ fontWeight: '600' }}>{usuario.username}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`admin-badge ${
                      usuario.tipo === 'admin' ? 'admin-badge-danger' :
                      usuario.tipo === 'vendedor' ? 'admin-badge-primary' :
                      'admin-badge-success'
                    }`}>
                      {usuario.tipo === 'admin' ? 'Administrador' : usuario.tipo}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${usuario.estado === 'activo' ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                      <IonIcon icon={usuario.estado === 'activo' ? checkmarkCircleOutline : closeCircleOutline} />
                      {usuario.estado}
                    </span>
                  </td>
                  <td>{usuario.fechaCreacion}</td>
                  <td>{usuario.ultimoLogin || 'Nunca'}</td>
                  <td>
                    <div className="admin-table-actions" style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="admin-btn admin-btn-outline"
                        onClick={() => openEditUserModal(usuario)}
                        title="Editar usuario"
                      >
                        <IonIcon icon={createOutline} />
                      </button>
                      <button
                        className="admin-btn admin-btn-danger"
                        onClick={() => eliminarUsuario(usuario.id)}
                        title="Eliminar usuario"
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
      </div>
    </div>
  );
  
  // Renderizar sección de productos
  const renderProductos = () => (
    <div>
      {isLoadingData ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '60px' }}>
          <div className="admin-spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px' }}></div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Cargando productos...</p>
        </div>
      ) : null}

      {/* Formulario crear producto */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <IonIcon icon={addOutline} />
            Agregar Nuevo Producto
          </h2>
        </div>
        
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); crearProducto(); }}>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-form-label">Nombre del Producto *</label>
              <input
                type="text"
                className="admin-form-input"
                value={nuevoProducto.nombre}
                onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                placeholder="Ej: AGUA CAMPOS 2L"
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
          
          <div className="admin-form-group">
            <label className="admin-form-label">Descripción *</label>
            <textarea
              className="admin-form-textarea"
              value={nuevoProducto.descripcion}
              onChange={(e) => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})}
              placeholder="Descripción detallada del producto"
              required
            />
          </div>
          
          <div className="admin-form-group">
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
            Catálogo de Productos ({productos.length})
          </h2>
        </div>

        {productos.length === 0 && !isLoadingData ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.7)' }}>
            <IonIcon icon={cubeOutline} style={{ fontSize: '64px', opacity: 0.3, marginBottom: '16px' }} />
            <p>No hay productos registrados</p>
            <p style={{ fontSize: '0.9rem' }}>Usa el formulario arriba para agregar productos</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
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
                {productos.map(producto => (
                <tr key={producto.id}>
                  <td>#{producto.id}</td>
                  <td>
                    <img 
                      src={producto.imagen} 
                      alt={producto.nombre}
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        objectFit: 'contain', 
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'default.jpg';
                      }}
                    />
                  </td>
                  <td style={{ fontWeight: '600' }}>{producto.nombre}</td>
                  <td style={{ fontWeight: '700', color: '#10B981' }}>${producto.precio.toFixed(2)}</td>
                  <td>
                    <span className="admin-badge admin-badge-primary">
                      {producto.categoria}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${producto.stock > 50 ? 'admin-badge-success' : producto.stock > 20 ? 'admin-badge-warning' : 'admin-badge-danger'}`}>
                      {producto.stock}
                    </span>
                  </td>
                  <td>{producto.ventas}</td>
                  <td>
                    <span className={`admin-badge ${producto.activo ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                      <IonIcon icon={producto.activo ? checkmarkCircleOutline : closeCircleOutline} />
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions" style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className={`admin-btn ${producto.activo ? 'admin-btn-outline' : 'admin-btn-success'}`}
                        onClick={() => toggleProductoEstado(producto.id)}
                      >
                        {producto.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        className="admin-btn admin-btn-outline"
                        onClick={() => openEditModal(producto)}
                        title="Editar producto"
                      >
                        <IonIcon icon={createOutline} />
                      </button>
                      <button
                        className="admin-btn admin-btn-danger"
                        onClick={() => {
                          setAlertConfig({
                            isOpen: true,
                            header: 'Confirmar eliminación',
                            message: `¿Estás seguro de eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
                            buttons: [
                              { text: 'Cancelar', role: 'cancel' },
                              {
                                text: 'Eliminar',
                                handler: async () => {
                                  try {
                                    await ApiService.deleteProduct(producto.id);
                                    setProductos(productos.filter(p => p.id !== producto.id));
                                    showMessage(`Producto "${producto.nombre}" eliminado exitosamente`, 'success');
                                  } catch (error: any) {
                                    console.error('Error eliminando producto:', error);
                                    showMessage(error.message || 'Error al eliminar producto', 'danger');
                                  }
                                }
                              }
                            ]
                          });
                          setShowAlert(true);
                        }}
                        title="Eliminar producto"
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
        )}
      </div>
    </div>
  );

  // Renderizar sección de pedidos
  const renderPedidos = () => {
    const pedidosPendientes = pedidos.filter(p => !p.vendedor_id);
    const pedidosAsignados = pedidos.filter(p => p.vendedor_id && p.estado !== 'Entregado');
    const pedidosEntregados = pedidos.filter(p => p.estado === 'Entregado');

    const asignarPedidoAVendedor = async (pedidoId: number) => {
      try {
        const vendedoresData = await ApiService.getVendedores();

        if (vendedoresData.length === 0) {
          showMessage('No hay vendedores disponibles', 'warning');
          return;
        }

        // Configurar el modal
        setSelectedPedidoId(pedidoId);
        setVendedoresDisponibles(vendedoresData);
        setSelectedVendedorId(vendedoresData[0]?.id || null);
        setShowAssignModal(true);
      } catch (error: any) {
        console.error('Error cargando vendedores:', error);
        showMessage(error.message || 'Error al cargar vendedores', 'danger');
      }
    };

    const confirmarAsignacion = async (vendedorIdFromAlert?: number) => {
      const vendedorId = vendedorIdFromAlert || selectedVendedorId;

      if (!selectedPedidoId || !vendedorId) {
        showMessage('Selecciona un vendedor', 'warning');
        return;
      }

      try {
        await ApiService.assignOrder(selectedPedidoId, vendedorId);

        // Recargar pedidos
        await reloadOrders();

        setShowAssignModal(false);
        showMessage('Pedido asignado exitosamente', 'success');
      } catch (error: any) {
        console.error('Error asignando pedido:', error);
        showMessage(error.message || 'Error al asignar pedido', 'danger');
      }
    };

    return (
      <div>
        {/* Pedidos Pendientes */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <IonIcon icon={timeOutline} />
              Pedidos Pendientes de Asignación ({pedidosPendientes.length})
            </h2>
          </div>

          {pedidosPendientes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.7)' }}>
              <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '64px', opacity: 0.3, marginBottom: '16px' }} />
              <p>No hay pedidos pendientes</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Teléfono</th>
                    <th>Dirección</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Pago</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosPendientes.map(pedido => (
                    <tr key={pedido.id}>
                      <td>#{pedido.id}</td>
                      <td style={{ fontWeight: '600' }}>{pedido.cliente_nombre || 'N/A'}</td>
                      <td>{pedido.telefono_contacto || 'N/A'}</td>
                      <td>{pedido.direccion_entrega || 'N/A'}</td>
                      <td>
                        {pedido.items && pedido.items.length > 0 ? (
                          <div style={{ fontSize: '0.85rem' }}>
                            {pedido.items.map((item: any, idx: number) => (
                              <div key={idx} style={{ marginBottom: '4px' }}>
                                {item.cantidad}x {item.producto_nombre}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Sin productos</span>
                        )}
                      </td>
                      <td style={{ fontWeight: '700', color: '#10B981' }}>${Number(pedido.total || 0).toFixed(2)}</td>
                      <td>
                        {pedido.metodo_pago === 'transferencia' ? (
                          <div>
                            <span className="admin-badge admin-badge-success">Transferencia</span>
                            {pedido.comprobante_pago && (
                              <a
                                href={`http://localhost:3001${pedido.comprobante_pago}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'block', marginTop: '4px', fontSize: '0.85rem', color: '#38BDF8' }}
                              >
                                📥 Ver Comprobante
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="admin-badge admin-badge-secondary">Efectivo</span>
                        )}
                      </td>
                      <td>{new Date(pedido.fecha_pedido).toLocaleString('es-EC')}</td>
                      <td>
                        <span className="admin-badge admin-badge-warning">
                          <IonIcon icon={timeOutline} />
                          Pendiente
                        </span>
                      </td>
                      <td>
                        <button
                          className="admin-btn admin-btn-primary"
                          onClick={() => asignarPedidoAVendedor(pedido.id)}
                        >
                          <IonIcon icon={personCircleOutline} />
                          Asignar Vendedor
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pedidos Asignados en Proceso */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <IonIcon icon={carOutline} />
              Pedidos en Proceso ({pedidosAsignados.length})
            </h2>
          </div>

          {pedidosAsignados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.7)' }}>
              <p>No hay pedidos en proceso</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Vendedor</th>
                    <th>Dirección</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Pago</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosAsignados.map(pedido => (
                    <tr key={pedido.id}>
                      <td>#{pedido.id}</td>
                      <td style={{ fontWeight: '600' }}>{pedido.cliente_nombre || 'N/A'}</td>
                      <td>
                        <span className="admin-badge admin-badge-primary">
                          {pedido.vendedor_nombre || 'Sin asignar'}
                        </span>
                      </td>
                      <td>{pedido.direccion_entrega || 'N/A'}</td>
                      <td>
                        {pedido.items && pedido.items.length > 0 ? (
                          <div style={{ fontSize: '0.85rem' }}>
                            {pedido.items.map((item: any, idx: number) => (
                              <div key={idx} style={{ marginBottom: '4px' }}>
                                {item.cantidad}x {item.producto_nombre}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Sin productos</span>
                        )}
                      </td>
                      <td style={{ fontWeight: '700', color: '#10B981' }}>${Number(pedido.total || 0).toFixed(2)}</td>
                      <td>
                        {pedido.metodo_pago === 'transferencia' ? (
                          <div>
                            <span className="admin-badge admin-badge-success">Transferencia</span>
                            {pedido.comprobante_pago && (
                              <a
                                href={`http://localhost:3001${pedido.comprobante_pago}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'block', marginTop: '4px', fontSize: '0.85rem', color: '#38BDF8' }}
                              >
                                📥 Ver Comprobante
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="admin-badge admin-badge-secondary">Efectivo</span>
                        )}
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-primary">
                          {pedido.estado}
                        </span>
                      </td>
                      <td>{new Date(pedido.fecha_pedido).toLocaleString('es-EC')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pedidos Entregados */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <IonIcon icon={checkmarkCircleOutline} />
              Pedidos Entregados ({pedidosEntregados.length})
            </h2>
          </div>

          {pedidosEntregados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.7)' }}>
              <p>No hay pedidos entregados</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Vendedor</th>
                    <th>Dirección de Entrega</th>
                    <th>Teléfono</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Pago</th>
                    <th>Fecha Pedido</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosEntregados.map(pedido => (
                    <tr key={pedido.id}>
                      <td>#{pedido.id}</td>
                      <td>{pedido.cliente_nombre || 'N/A'}</td>
                      <td>{pedido.vendedor_nombre || 'Sin asignar'}</td>
                      <td style={{ maxWidth: '200px', fontSize: '0.9rem' }}>{pedido.direccion_entrega || 'N/A'}</td>
                      <td>{pedido.telefono_contacto || 'N/A'}</td>
                      <td>
                        {pedido.items && pedido.items.length > 0 ? (
                          <div style={{ fontSize: '0.85rem' }}>
                            {pedido.items.map((item: any, idx: number) => (
                              <div key={idx} style={{ marginBottom: '4px' }}>
                                {item.cantidad}x {item.producto_nombre}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Sin productos</span>
                        )}
                      </td>
                      <td style={{ fontWeight: '700', color: '#10B981' }}>${Number(pedido.total || 0).toFixed(2)}</td>
                      <td>
                        {pedido.metodo_pago === 'transferencia' ? (
                          <div>
                            <span className="admin-badge admin-badge-success">Transferencia</span>
                            {pedido.comprobante_pago && (
                              <a
                                href={`http://localhost:3001${pedido.comprobante_pago}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'block', marginTop: '4px', fontSize: '0.85rem', color: '#38BDF8' }}
                              >
                                📥 Ver Comprobante
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="admin-badge admin-badge-secondary">Efectivo</span>
                        )}
                      </td>
                      <td>{new Date(pedido.fecha_pedido).toLocaleString('es-EC')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Renderizar sección de reportes
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

        {/* Sección de descarga de reportes */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonIcon icon={analyticsOutline} />
            Descargar Reportes
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Reporte Diario */}
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))',
              borderRadius: '16px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              const pedidosHoy = pedidos.filter(p => p.fecha_pedido.startsWith(today));
              const totalVentas = pedidosHoy.reduce((sum, p) => sum + p.total, 0);

              // Formato CSV mejorado con BOM para Excel y columnas bien alineadas
              const csvRows = [
                ['REPORTE DIARIO DE VENTAS'],
                ['Fecha:', today],
                [''],
                ['RESUMEN'],
                ['Total de Pedidos:', pedidosHoy.length],
                ['Total de Ventas:', `$${totalVentas.toFixed(2)}`],
                ['Promedio por Pedido:', `$${(totalVentas / pedidosHoy.length || 0).toFixed(2)}`],
                [''],
                ['DETALLE DE PEDIDOS'],
                ['ID Pedido', 'Cliente', 'Teléfono', 'Dirección', 'Productos', 'Total', 'Estado', 'Método Pago', 'Fecha y Hora'],
                ...pedidosHoy.map(p => [
                  p.id,
                  p.cliente_nombre,
                  p.telefono_contacto || 'N/A',
                  p.direccion_entrega || 'N/A',
                  p.items ? p.items.map((item: any) => `${item.cantidad}x ${item.producto_nombre}`).join('; ') : 'Sin productos',
                  `$${p.total.toFixed(2)}`,
                  p.estado,
                  p.metodo_pago === 'transferencia' ? 'Transferencia' : 'Efectivo',
                  new Date(p.fecha_pedido).toLocaleString('es-EC')
                ])
              ];

              // Convertir a CSV con BOM para que Excel lo abra correctamente
              const csvContent = '\uFEFF' + csvRows.map(row => row.join(',')).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `Reporte_Diario_${today}.csv`;
              link.click();
              showMessage('✅ Reporte diario descargado', 'success');
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  📅
                </div>
                <div>
                  <h4 style={{ color: '#3B82F6', margin: 0, fontWeight: '700' }}>Reporte Diario</h4>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0, fontSize: '0.85rem' }}>
                    Ventas del día actual
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '12px' }}>
                • Pedidos de hoy<br />
                • Total de ventas<br />
                • Detalle por pedido
              </div>
              <button className="admin-btn admin-btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                📥 Descargar CSV
              </button>
            </div>

            {/* Reporte Mensual */}
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
              borderRadius: '16px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => {
              const now = new Date();
              const mesActual = now.getMonth();
              const anioActual = now.getFullYear();
              const pedidosMes = pedidos.filter(p => {
                const fecha = new Date(p.fecha_pedido);
                return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
              });
              const totalVentas = pedidosMes.reduce((sum, p) => sum + p.total, 0);
              const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

              // Formato CSV mejorado
              const csvRows = [
                ['REPORTE MENSUAL DE VENTAS'],
                ['Período:', `${meses[mesActual]} ${anioActual}`],
                [''],
                ['RESUMEN'],
                ['Total de Pedidos:', pedidosMes.length],
                ['Total de Ventas:', `$${totalVentas.toFixed(2)}`],
                ['Promedio por Pedido:', `$${(totalVentas / pedidosMes.length || 0).toFixed(2)}`],
                [''],
                ['DETALLE DE PEDIDOS'],
                ['ID Pedido', 'Cliente', 'Teléfono', 'Dirección', 'Productos', 'Total', 'Estado', 'Método Pago', 'Vendedor', 'Fecha y Hora'],
                ...pedidosMes.map(p => [
                  p.id,
                  p.cliente_nombre,
                  p.telefono_contacto || 'N/A',
                  p.direccion_entrega || 'N/A',
                  p.items ? p.items.map((item: any) => `${item.cantidad}x ${item.producto_nombre}`).join('; ') : 'Sin productos',
                  `$${p.total.toFixed(2)}`,
                  p.estado,
                  p.metodo_pago === 'transferencia' ? 'Transferencia' : 'Efectivo',
                  p.vendedor_nombre || 'Sin asignar',
                  new Date(p.fecha_pedido).toLocaleString('es-EC')
                ])
              ];

              const csvContent = '\uFEFF' + csvRows.map(row => row.join(',')).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `Reporte_Mensual_${meses[mesActual]}_${anioActual}.csv`;
              link.click();
              showMessage('✅ Reporte mensual descargado', 'success');
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  📊
                </div>
                <div>
                  <h4 style={{ color: '#10B981', margin: 0, fontWeight: '700' }}>Reporte Mensual</h4>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0, fontSize: '0.85rem' }}>
                    Ventas del mes actual
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '12px' }}>
                • Pedidos del mes<br />
                • Total de ventas<br />
                • Promedio por pedido
              </div>
              <button className="admin-btn admin-btn-primary" style={{ width: '100%', marginTop: '12px', background: '#10B981' }}>
                📥 Descargar CSV
              </button>
            </div>

            {/* Reporte Anual */}
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
              borderRadius: '16px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => {
              const anioActual = new Date().getFullYear();
              const pedidosAnio = pedidos.filter(p => {
                const fecha = new Date(p.fecha_pedido);
                return fecha.getFullYear() === anioActual;
              });
              const totalVentas = pedidosAnio.reduce((sum, p) => sum + p.total, 0);

              // Estadísticas por mes
              const ventasPorMes = Array(12).fill(0);
              const pedidosPorMes = Array(12).fill(0);
              pedidosAnio.forEach(p => {
                const mes = new Date(p.fecha_pedido).getMonth();
                ventasPorMes[mes] += p.total;
                pedidosPorMes[mes]++;
              });

              const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

              // Formato CSV mejorado
              const csvRows = [
                ['REPORTE ANUAL DE VENTAS'],
                ['Año:', anioActual],
                [''],
                ['RESUMEN GENERAL'],
                ['Total de Pedidos:', pedidosAnio.length],
                ['Total de Ventas:', `$${totalVentas.toFixed(2)}`],
                ['Promedio por Pedido:', `$${(totalVentas / pedidosAnio.length || 0).toFixed(2)}`],
                [''],
                ['ESTADÍSTICAS POR MES'],
                ['Mes', 'Pedidos', 'Ventas', 'Promedio'],
                ...meses.map((mes, i) => [
                  mes,
                  pedidosPorMes[i],
                  `$${ventasPorMes[i].toFixed(2)}`,
                  pedidosPorMes[i] > 0 ? `$${(ventasPorMes[i] / pedidosPorMes[i]).toFixed(2)}` : '$0.00'
                ]),
                [''],
                ['DETALLE DE TODOS LOS PEDIDOS'],
                ['ID Pedido', 'Cliente', 'Teléfono', 'Dirección', 'Productos', 'Total', 'Estado', 'Método Pago', 'Vendedor', 'Fecha y Hora'],
                ...pedidosAnio.map(p => [
                  p.id,
                  p.cliente_nombre,
                  p.telefono_contacto || 'N/A',
                  p.direccion_entrega || 'N/A',
                  p.items ? p.items.map((item: any) => `${item.cantidad}x ${item.producto_nombre}`).join('; ') : 'Sin productos',
                  `$${p.total.toFixed(2)}`,
                  p.estado,
                  p.metodo_pago === 'transferencia' ? 'Transferencia' : 'Efectivo',
                  p.vendedor_nombre || 'Sin asignar',
                  new Date(p.fecha_pedido).toLocaleString('es-EC')
                ])
              ];

              const csvContent = '\uFEFF' + csvRows.map(row => row.join(',')).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `Reporte_Anual_${anioActual}.csv`;
              link.click();
              showMessage('✅ Reporte anual descargado', 'success');
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  📈
                </div>
                <div>
                  <h4 style={{ color: '#F59E0B', margin: 0, fontWeight: '700' }}>Reporte Anual</h4>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0, fontSize: '0.85rem' }}>
                    Ventas del año actual
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '12px' }}>
                • Pedidos del año<br />
                • Total de ventas<br />
                • Promedio por pedido
              </div>
              <button className="admin-btn admin-btn-primary" style={{ width: '100%', marginTop: '12px', background: '#F59E0B' }}>
                📥 Descargar CSV
              </button>
            </div>
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
      case 'pedidos':
        return renderPedidos();
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
              <div className="admin-brand">AGUA CAMPOS</div>
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
                className={`admin-nav-item ${activeSection === 'pedidos' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('pedidos');
                  setSidebarOpen(false);
                }}
              >
                <IonIcon icon={cartOutline} />
                <span className="admin-nav-text">Pedidos</span>
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
                    activeSection === 'pedidos' ? cartOutline :
                    activeSection === 'reportes' ? analyticsOutline :
                    gridOutline
                  } />
                  {activeSection === 'dashboard' && 'Panel de Control'}
                  {activeSection === 'usuarios' && 'Gestión de Usuarios'}
                  {activeSection === 'productos' && 'Gestión de Productos'}
                  {activeSection === 'pedidos' && 'Gestión de Pedidos'}
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
                <button
                  className="admin-notifications"
                  onClick={() => {
                    setNotificationCount(0);
                    setActiveSection('pedidos');
                  }}
                  title={`${notificationCount} notificaciones nuevas`}
                >
                  <IonIcon icon={notificationsOutline} />
                  {notificationCount > 0 && (
                    <div className="admin-notification-badge" style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#EF4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {notificationCount}
                    </div>
                  )}
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

        {/* Toast especial para notificaciones de pedidos */}
        <IonToast
          isOpen={showNotificationToast}
          onDidDismiss={() => setShowNotificationToast(false)}
          message={notificationData ? `🔔 Nuevo Pedido de ${notificationData.cliente}: $${notificationData.total} (${notificationData.items} items)` : ''}
          duration={5000}
          color="primary"
          position="top"
          buttons={[
            {
              text: 'Ver',
              handler: () => {
                setActiveSection('pedidos');
                setNotificationCount(0);
              }
            }
          ]}
        />

        {/* Modal para asignar vendedor - SIMPLE */}
        <IonAlert
          isOpen={showAssignModal}
          onDidDismiss={() => setShowAssignModal(false)}
          header="👤 Asignar Vendedor"
          message="Selecciona el vendedor que entregará este pedido"
          inputs={vendedoresDisponibles.map((vendedor) => ({
            type: 'radio',
            label: `${vendedor.nombre} - ${vendedor.email}`,
            value: vendedor.id,
            checked: selectedVendedorId === vendedor.id
          }))}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: 'Asignar',
              handler: async (vendedorId) => {
                if (vendedorId && selectedPedidoId) {
                  try {
                    await ApiService.assignOrder(selectedPedidoId, Number(vendedorId));
                    await reloadOrders();
                    setShowAssignModal(false);
                    showMessage('Pedido asignado exitosamente', 'success');
                  } catch (error: any) {
                    console.error('Error asignando pedido:', error);
                    showMessage(error.message || 'Error al asignar pedido', 'danger');
                  }
                }
              }
            }
          ]}
        />

        {/* Alert para confirmaciones */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          {...alertConfig}
        />

        {/* Modal de edición de producto */}
        {showEditModal && editingProduct && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '20px'
            }}
            onClick={() => setShowEditModal(false)}
          >
            <div
              className="admin-card"
              style={{
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                margin: 0
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <IonIcon icon={createOutline} />
                  Editar Producto
                </h2>
              </div>

              <form className="admin-form" onSubmit={(e) => { e.preventDefault(); actualizarProducto(); }}>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Nombre del Producto *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editingProduct.nombre}
                      onChange={(e) => setEditingProduct({...editingProduct, nombre: e.target.value})}
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
                      value={editingProduct.precio}
                      onChange={(e) => setEditingProduct({...editingProduct, precio: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Categoría</label>
                    <select
                      className="admin-form-select"
                      value={editingProduct.categoria}
                      onChange={(e) => setEditingProduct({...editingProduct, categoria: e.target.value})}
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="Botellas">Botellas</option>
                      <option value="Packs">Pack/Multipack</option>
                      <option value="Garrafones">Garrafón</option>
                      <option value="Garrafas">Garrafa</option>
                      <option value="Hielo">Hielo</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Stock</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-form-input"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Descripción *</label>
                  <textarea
                    className="admin-form-textarea"
                    value={editingProduct.descripcion}
                    onChange={(e) => setEditingProduct({...editingProduct, descripcion: e.target.value})}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">URL de Imagen</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={editingProduct.imagen}
                    onChange={(e) => setEditingProduct({...editingProduct, imagen: e.target.value})}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProduct(null);
                    }}
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary"
                    disabled={isLoading}
                    style={{ flex: 1 }}
                  >
                    {isLoading ? (
                      <>
                        <div className="admin-spinner" style={{ width: '16px', height: '16px' }}></div>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <IonIcon icon={saveOutline} />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de edición de usuario */}
        {showEditUserModal && editingUser && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '20px'
            }}
            onClick={() => setShowEditUserModal(false)}
          >
            <div
              className="admin-card"
              style={{
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                margin: 0
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <IonIcon icon={createOutline} />
                  Editar Usuario
                </h2>
              </div>

              <form className="admin-form" onSubmit={(e) => { e.preventDefault(); actualizarUsuario(); }}>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      <IonIcon icon={peopleOutline} />
                      Nombre de Usuario *
                    </label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Email *</label>
                    <input
                      type="email"
                      className="admin-form-input"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Tipo de Usuario *</label>
                    <select
                      className="admin-form-select"
                      value={editingUser.tipo}
                      onChange={(e) => setEditingUser({...editingUser, tipo: e.target.value as 'vendedor' | 'cliente' | 'admin'})}
                    >
                      <option value="cliente">Cliente</option>
                      <option value="vendedor">Vendedor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Estado</label>
                    <select
                      className="admin-form-select"
                      value={editingUser.estado}
                      onChange={(e) => setEditingUser({...editingUser, estado: e.target.value as 'activo' | 'inactivo'})}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Nueva Contraseña
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 'normal', marginLeft: '8px' }}>
                      (dejar en blanco para no cambiar)
                    </span>
                  </label>
                  <input
                    type="password"
                    className="admin-form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                  {newPassword && newPassword.length < 6 && (
                    <span style={{ color: '#F59E0B', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                      La contraseña debe tener al menos 6 caracteres
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={() => {
                      setShowEditUserModal(false);
                      setEditingUser(null);
                      setNewPassword('');
                    }}
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary"
                    disabled={isLoading || (newPassword.length > 0 && newPassword.length < 6)}
                    style={{ flex: 1 }}
                  >
                    {isLoading ? (
                      <>
                        <div className="admin-spinner" style={{ width: '16px', height: '16px' }}></div>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <IonIcon icon={saveOutline} />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AdminInterface;
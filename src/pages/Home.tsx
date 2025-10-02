import React, { useMemo, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import ApiService from '../services/apiService';
import './Home.css';

import {
  IonButtons, IonContent, IonHeader, IonPage,
  IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonBadge, IonIcon, IonButton,
  IonToast, IonSpinner, IonModal, IonList, IonItem, IonLabel,
  IonRefresher, IonRefresherContent
} from '@ionic/react';

import {
  cartOutline, star, addOutline, removeOutline, closeOutline, trashOutline,
  logOutOutline, receiptOutline, menuOutline, timeOutline, checkmarkCircleOutline,
  alertCircleOutline, closeCircleOutline, locationOutline, callOutline, refreshOutline,
  logoFacebook, logoInstagram, logoWhatsapp, logoTiktok
} from 'ionicons/icons';

// Tipos TypeScript optimizados
type Producto = {
  id: number;
  nombre: string;
  precio: number;
  precioAntes?: number;
  descripcion: string;
  imagen: string;
  ventas?: string;
  rating?: number;
  reviews?: number;
  categoria?: string;
  stock?: number;
};

type CartItem = {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  qty: number;
  stock?: number;
};

type Pedido = {
  id: number;
  total: number;
  estado: string;
  direccion_entrega: string;
  telefono_contacto: string;
  notas?: string;
  fecha_pedido: string;
  fecha_entrega_estimada?: string;
  fecha_entrega_real?: string;
  vendedor_nombre?: string;
  items?: PedidoItem[];
};

type PedidoItem = {
  product_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  imagen?: string;
};

export default function Home() {
  const history = useHistory();
  
  // Estados principales
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Estados para efectos visuales
  const [showContent, setShowContent] = useState(false);

  // Estados para menú lateral de pedidos
  const [showSidebar, setShowSidebar] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoadingPedidos, setIsLoadingPedidos] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Datos del usuario (desde localStorage)
  const userData = JSON.parse(localStorage.getItem('aguapiatua_user') || '{}');
  const userName = userData.nombre || 'Usuario';

  // Cálculos optimizados con useMemo
  const totalItems = useMemo(() => 
    cart.reduce((total, item) => total + item.qty, 0), [cart]
  );
  
  const totalPrice = useMemo(() => 
    cart.reduce((total, item) => total + (item.qty * Number(item.precio)), 0), [cart]
  );

  const qtyById = useMemo(() => {
    const quantities: Record<number, number> = {};
    cart.forEach(item => {
      quantities[item.id] = item.qty;
    });
    return quantities;
  }, [cart]);

  // Efectos de inicialización
  useEffect(() => {
    // Verificar autenticación y tipo de usuario
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userType = localStorage.getItem('userType');

    if (!isAuthenticated) {
      history.push('/login');
      return;
    }

    // Solo clientes pueden acceder a esta página
    if (userType !== 'cliente') {
      showMessage('Acceso denegado. Solo clientes.');
      setTimeout(() => {
        if (userType === 'administrador') {
          history.push('/admin-dashboard');
        } else if (userType === 'vendedor') {
          history.push('/vendedor-dashboard');
        } else {
          history.push('/login');
        }
      }, 2000);
      return;
    }

    // Cargar carrito desde localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }

    // Cargar productos desde la API
    const loadProducts = async () => {
      try {
        console.log('Iniciando carga de productos...');
        const products = await ApiService.getProducts();
        console.log('Productos cargados:', products);

        if (!products || products.length === 0) {
          console.warn('No se encontraron productos');
          setProductos([]);
        } else {
          setProductos(products.map((p: any) => ({
            id: p.id,
            nombre: p.nombre,
            precio: Number(p.precio),
            descripcion: p.descripcion || '',
            imagen: p.imagen || '/agua.jpg',
            categoria: p.categoria,
            stock: p.stock,
            rating: 5,
            reviews: Math.floor(Math.random() * 100) + 10
          })));
        }
        setLoadError(false);
      } catch (error: any) {
        console.error('Error loading products:', error);
        setLoadError(true);
        showMessage('Error al cargar productos: ' + (error.message || 'Error desconocido'));
      } finally {
        console.log('Finalizando carga...');
        setIsLoading(false);
        setShowContent(true);
      }
    };

    loadProducts();
  }, [history]);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  // Función para mostrar mensajes
  const showMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // Función para obtener cantidad de un producto
  const getQty = (id: number): number => qtyById[id] ?? 0;

  // Función para renderizar estrellas
  const renderStars = (rating: number = 5) => {
    const fullStars = Math.round(rating);
    return (
      <span className="stars">
        {Array.from({ length: 5 }).map((_, index) => (
          <IonIcon 
            key={index} 
            icon={star} 
            className={index < fullStars ? 'star-full' : 'star-empty'} 
          />
        ))}
      </span>
    );
  };

  // Función para agregar al carrito
  const addToCart = (productIndex: number) => {
    const product = productos[productIndex];
    if (!product) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          imagen: product.imagen,
          qty: 1
        }];
      }
    });

    showMessage(`${product.nombre} agregado al carrito`);
  };

  // Función para incrementar cantidad
  const incrementQuantity = (id: number) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id 
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    );
  };

  // Función para decrementar cantidad
  const decrementQuantity = (id: number) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id 
          ? { ...item, qty: Math.max(0, item.qty - 1) }
          : item
      ).filter(item => item.qty > 0)
    );
  };

  // Función para limpiar carrito
  const clearCart = () => {
    setCart([]);
    showMessage('Carrito vaciado');
  };

  // Función para continuar comprando
  const continueShopping = () => {
    setShowCart(false);
  };

  // Función para ir al checkout
  const goToCheckout = () => {
    if (cart.length === 0) {
      showMessage('Tu carrito está vacío');
      return;
    }

    history.push({
      pathname: '/factura-final',
      state: { 
        cart, 
        totalPrice,
        address: localStorage.getItem('address') || '',
        payment: localStorage.getItem('payment') || ''
      }
    });
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.clear();
    showMessage('Sesión cerrada correctamente');
    setTimeout(() => {
      history.push('/bienvenida');
    }, 1000);
  };

  // Funciones para el menú lateral de pedidos
  const loadPedidos = async () => {
    try {
      setIsLoadingPedidos(true);
      const orders = await ApiService.getOrders();

      // Verificar que orders sea un array
      if (!Array.isArray(orders)) {
        console.warn('Orders no es un array:', orders);
        setPedidos([]);
        return;
      }

      const sortedOrders = orders.sort((a: Pedido, b: Pedido) =>
        new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime()
      );
      setPedidos(sortedOrders);
    } catch (error: any) {
      console.error('Error cargando pedidos:', error);
      showMessage('Error al cargar el historial de pedidos');
      setPedidos([]); // Asegurar que pedidos sea un array vacío en caso de error
    } finally {
      setIsLoadingPedidos(false);
    }
  };

  const handleOpenSidebar = () => {
    setShowSidebar(true);
    loadPedidos();
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'Confirmado': return 'secondary';
      case 'En_Preparacion': return 'tertiary';
      case 'En_Camino': return 'primary';
      case 'Entregado': return 'success';
      case 'Cancelado': return 'danger';
      default: return 'medium';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return timeOutline;
      case 'Confirmado': return checkmarkCircleOutline;
      case 'En_Preparacion': return cartOutline;
      case 'En_Camino': return locationOutline;
      case 'Entregado': return checkmarkCircleOutline;
      case 'Cancelado': return closeCircleOutline;
      default: return alertCircleOutline;
    }
  };

  const getEstadoText = (estado: string) => {
    return estado.replace(/_/g, ' ');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha no disponible';
    }
  };

  const handleViewDetails = async (pedido: Pedido) => {
    try {
      setIsLoadingDetails(true);
      setShowModal(true);
      const details = await ApiService.getOrder(pedido.id);

      if (!details) {
        throw new Error('No se recibieron detalles del pedido');
      }

      setSelectedPedido(details);
    } catch (error: any) {
      console.error('Error cargando detalles:', error);
      showMessage('Error al cargar los detalles del pedido');
      setShowModal(false);
      setSelectedPedido(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPedido(null);
  };

  // Generar efectos decorativos
  const generateBubbles = () => {
    return Array.from({ length: 4 }, (_, index) => (
      <div key={`home-bubble-${index}`} className="home-bubble"></div>
    ));
  };

  const generateSparkles = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <div key={`home-sparkle-${index}`} className="home-sparkle"></div>
    ));
  };

  // Mostrar pantalla de carga
  if (isLoading) {
    return (
      <IonPage>
        <IonContent className="ion-padding" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F172A, #1E293B, #0EA5E9, #38BDF8)'
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '16px',
              animation: 'sparkleFloat 2s ease-in-out infinite'
            }}>
              💧
            </div>
            <h2>Cargando Agua Piatua...</h2>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <>


      {/* Contenido principal */}
      <IonPage>
        {/* Header */}
        <IonHeader>
          <IonToolbar className="home-toolbar">
            <IonButtons slot="start">
              <IonButton fill="clear" onClick={handleOpenSidebar} color="light" title="Mis pedidos">
                <IonIcon icon={menuOutline} />
              </IonButton>
              <IonButton fill="clear" onClick={handleLogout} color="light" title="Cerrar sesión">
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </IonButtons>
            <IonTitle>💧 Agua Piatua</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={() => setShowCart(true)} aria-label="Abrir carrito">
                <IonIcon icon={cartOutline} />
                {totalItems > 0 && (
                  <IonBadge className="header-badge">{totalItems}</IonBadge>
                )}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        {/* Contenido principal */}
        <IonContent className="home-bg ion-padding" fullscreen>
          {/* Efectos decorativos de fondo */}
          {generateBubbles()}
          {generateSparkles()}

          {/* Grid de productos */}
          <div
            className="productos-grid"
            style={{
              opacity: showContent ? 1 : 0,
              transition: 'opacity 1s ease-out'
            }}
          >
            {loadError && (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px',
                color: 'white'
              }}>
                <h2>⚠️ Error al cargar productos</h2>
                <p>Por favor, verifica tu conexión e intenta nuevamente.</p>
              </div>
            )}

            {!loadError && productos.length === 0 && !isLoading && (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px',
                color: 'white'
              }}>
                <h2>📦 No hay productos disponibles</h2>
                <p>Pronto agregaremos productos al catálogo.</p>
              </div>
            )}

            {productos.map((producto, index) => (
              <IonCard key={producto.id} className="producto-card ecommerce">
                <div className="img-wrap">
                  <img 
                    src={producto.imagen} 
                    alt={producto.nombre} 
                    className="producto-imagen contain"
                    loading="lazy"
                  />
                </div>
                
                <IonCardHeader>
                  <IonCardTitle className="producto-nombre-principal" title={producto.nombre}>
                    {producto.nombre}
                  </IonCardTitle>
                </IonCardHeader>
                
                <IonCardContent>
                  <div className="precio-row">
                    <span className="precio">${producto.precio.toFixed(2)}</span>
                    {producto.precioAntes && (
                      <span style={{ 
                        textDecoration: 'line-through', 
                        color: '#94A3B8',
                        fontSize: '0.9rem'
                      }}>
                        ${producto.precioAntes.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="rating-row">
                    {renderStars(producto.rating)}
                    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                      ({producto.reviews})
                    </span>
                  </div>
                  
                  <p className="descripcion">{producto.descripcion}</p>
                  
                  {/* Botón carrito flotante con badge */}
                  <button 
                    className="btn-cart" 
                    onClick={() => addToCart(index)} 
                    aria-label={`Agregar ${producto.nombre} al carrito`}
                  >
                    <IonIcon icon={cartOutline} />
                    {getQty(producto.id) > 0 && (
                      <IonBadge className="cart-badge">
                        {getQty(producto.id)}
                      </IonBadge>
                    )}
                  </button>
                </IonCardContent>
              </IonCard>
            ))}
          </div>

          {/* Backdrop para cerrar carrito */}
          <div
            className={`cart-backdrop ${showCart ? 'open' : ''}`}
            onClick={() => setShowCart(false)}
          />

          {/* Backdrop para cerrar sidebar */}
          <div
            className={`sidebar-backdrop ${showSidebar ? 'open' : ''}`}
            onClick={handleCloseSidebar}
          />

          {/* Menú lateral de pedidos */}
          <div className={`sidebar-pedidos ${showSidebar ? 'open' : ''}`}>
            <div className="sidebar-header">
              <div className="sidebar-title">
                <IonIcon icon={receiptOutline} />
                <span>Mis Pedidos</span>
              </div>
              <div className="sidebar-actions">
                <IonButton
                  size="small"
                  fill="clear"
                  color="light"
                  onClick={loadPedidos}
                  title="Actualizar"
                >
                  <IonIcon icon={refreshOutline} />
                </IonButton>
                <IonButton
                  size="small"
                  fill="clear"
                  color="light"
                  onClick={handleCloseSidebar}
                  title="Cerrar"
                >
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </div>
            </div>

            <div className="sidebar-body">
              {isLoadingPedidos ? (
                <div className="sidebar-loading">
                  <IonSpinner name="crescent" />
                  <p>Cargando pedidos...</p>
                </div>
              ) : pedidos.length === 0 ? (
                <div className="sidebar-empty">
                  <IonIcon icon={receiptOutline} style={{ fontSize: '3rem', opacity: 0.3 }} />
                  <p>No tienes pedidos aún</p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                    Tus pedidos aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="pedidos-list">
                  {pedidos.map((pedido) => (
                    <div key={pedido.id} className="pedido-item">
                      <div className="pedido-item-header">
                        <div>
                          <strong>Pedido #{pedido.id}</strong>
                          <p className="pedido-fecha">
                            <IonIcon icon={timeOutline} />
                            {formatDate(pedido.fecha_pedido)}
                          </p>
                        </div>
                        <IonBadge color={getEstadoBadgeColor(pedido.estado)}>
                          <IonIcon icon={getEstadoIcon(pedido.estado)} />
                          {getEstadoText(pedido.estado)}
                        </IonBadge>
                      </div>

                      <div className="pedido-item-body">
                        <div className="pedido-info-row">
                          <IonIcon icon={locationOutline} />
                          <span>{pedido.direccion_entrega}</span>
                        </div>
                        {pedido.telefono_contacto && (
                          <div className="pedido-info-row">
                            <IonIcon icon={callOutline} />
                            <span>{pedido.telefono_contacto}</span>
                          </div>
                        )}
                      </div>

                      <div className="pedido-item-footer">
                        <div className="pedido-total">
                          <strong>Total: ${Number(pedido.total || 0).toFixed(2)}</strong>
                        </div>
                        <IonButton
                          size="small"
                          onClick={() => handleViewDetails(pedido)}
                          className="btn-ver-detalles"
                        >
                          Ver Detalles
                        </IonButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mini-carrito flotante */}
          <div className={`cart-float ${showCart ? 'open' : ''}`}>
            <div className="cart-float-header">
              <div className="cart-title">
                <IonIcon icon={cartOutline} />
                <span className="cart-title-text">Carrito de Compras</span>
                {totalItems > 0 && (
                  <IonBadge color="light" style={{ marginLeft: '8px' }}>
                    {totalItems}
                  </IonBadge>
                )}
              </div>
              
              <div className="cart-actions">
                {cart.length > 0 && (
                  <IonButton 
                    size="small" 
                    fill="clear" 
                    color="light" 
                    onClick={clearCart}
                    title="Vaciar carrito"
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                )}
                <IonButton 
                  size="small" 
                  fill="clear" 
                  color="light" 
                  onClick={() => setShowCart(false)}
                  title="Cerrar carrito"
                >
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </div>
            </div>

            <div className="cart-float-body">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <IonIcon 
                    icon={cartOutline} 
                    style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '16px' }} 
                  />
                  <p>Tu carrito está vacío</p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                    ¡Agrega algunos productos para comenzar!
                  </p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-row cart-float-horizontal">
                    <img 
                      src={item.imagen} 
                      alt={item.nombre} 
                      className="cart-thumb" 
                      style={{ flexShrink: 0, marginRight: '12px' }}
                    />
                    <span className="cart-name producto-nombre" style={{ fontWeight: 600, fontSize: '1rem', marginRight: '24px' }}>{item.nombre}</span>
                    <span className="cart-price producto-precio" style={{ fontWeight: 700, fontSize: '0.95rem', marginRight: '32px', marginLeft: '8px' }}>
                      ${(Number(item.precio) * item.qty).toFixed(2)}
                    </span>
                    <div className="cart-qty" style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                      <IonButton 
                        size="small" 
                        fill="outline" 
                        shape="round" 
                        className="qty-ion" 
                        onClick={() => decrementQuantity(item.id)}
                        aria-label="Disminuir cantidad"
                      >
                        <IonIcon icon={removeOutline} />
                      </IonButton>
                      <span className="qty producto-cantidad" style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
                      <IonButton 
                        size="small" 
                        fill="outline" 
                        shape="round" 
                        className="qty-ion" 
                        onClick={() => incrementQuantity(item.id)}
                        aria-label="Aumentar cantidad"
                      >
                        <IonIcon icon={addOutline} />
                      </IonButton>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="cart-float-footer">
                <div className="cart-total producto-total">
                Total: <strong>${totalPrice.toFixed(2)}</strong>
              </div>
              
              <IonButton 
                expand="block" 
                fill="outline" 
                className="btn-outline-sky" 
                onClick={continueShopping}
              >
                Seguir Comprando
              </IonButton>
              
              <IonButton
                expand="block"
                className="btn-primary-sky"
                disabled={cart.length === 0}
                onClick={goToCheckout}
              >
                Proceder al Pago
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonPage>

      {/* Toast para mensajes */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
        color="success"
      />

      {/* Modal de detalles del pedido */}
      <IonModal isOpen={showModal} onDidDismiss={handleCloseModal}>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Detalles del Pedido</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleCloseModal}>
                <IonIcon icon={closeCircleOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {isLoadingDetails ? (
            <div style={{ textAlign: 'center', marginTop: '50%' }}>
              <IonSpinner name="crescent" />
              <p>Cargando detalles...</p>
            </div>
          ) : selectedPedido ? (
            <div className="pedido-details">
              <div className="detail-section">
                <h3>Información del Pedido</h3>
                <IonCard>
                  <IonCardContent>
                    <p><strong>Número de Pedido:</strong> #{selectedPedido.id}</p>
                    <p>
                      <strong>Estado:</strong>{' '}
                      <IonBadge color={getEstadoBadgeColor(selectedPedido.estado)}>
                        {getEstadoText(selectedPedido.estado)}
                      </IonBadge>
                    </p>
                    <p><strong>Fecha de Pedido:</strong> {formatDate(selectedPedido.fecha_pedido)}</p>
                    {selectedPedido.fecha_entrega_real && (
                      <p><strong>Fecha de Entrega:</strong> {formatDate(selectedPedido.fecha_entrega_real)}</p>
                    )}
                  </IonCardContent>
                </IonCard>
              </div>

              <div className="detail-section">
                <h3>Dirección de Entrega</h3>
                <IonCard>
                  <IonCardContent>
                    <p><IonIcon icon={locationOutline} /> {selectedPedido.direccion_entrega}</p>
                    {selectedPedido.telefono_contacto && (
                      <p><IonIcon icon={callOutline} /> {selectedPedido.telefono_contacto}</p>
                    )}
                  </IonCardContent>
                </IonCard>
              </div>

              {selectedPedido.items && selectedPedido.items.length > 0 && (
                <div className="detail-section">
                  <h3>Productos</h3>
                  {selectedPedido.items.map((item, index) => (
                    <IonCard key={index} className="item-card">
                      <IonCardContent>
                        <div className="item-row">
                          {item.imagen && (
                            <img
                              src={item.imagen}
                              alt={item.nombre}
                              className="item-image"
                            />
                          )}
                          <div className="item-info">
                            <strong>{item.nombre || 'Producto'}</strong>
                            <p>Cantidad: {item.cantidad || 0}</p>
                            <p>Precio unitario: ${Number(item.precio_unitario || 0).toFixed(2)}</p>
                          </div>
                          <div className="item-subtotal">
                            ${Number(item.subtotal || 0).toFixed(2)}
                          </div>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  ))}
                </div>
              )}

              {selectedPedido.notas && (
                <div className="detail-section">
                  <h3>Notas</h3>
                  <IonCard>
                    <IonCardContent>
                      <p>{selectedPedido.notas}</p>
                    </IonCardContent>
                  </IonCard>
                </div>
              )}

              <div className="detail-section">
                <IonCard className="total-card" color="primary">
                  <IonCardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ margin: 0 }}>Total:</h2>
                      <h2 style={{ margin: 0 }}>${Number(selectedPedido.total || 0).toFixed(2)}</h2>
                    </div>
                  </IonCardContent>
                </IonCard>
              </div>
            </div>
          ) : null}
        </IonContent>
      </IonModal>
    </>
  );
}
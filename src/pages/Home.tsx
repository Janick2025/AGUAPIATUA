import React, { useMemo, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './Home.css';

import {
  IonButtons, IonContent, IonHeader, IonMenu, IonMenuButton, IonPage,
  IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonBadge, IonIcon, IonButton, IonList, IonItem,
  IonToast
} from '@ionic/react';

import {
  cartOutline, star, addOutline, removeOutline, closeOutline, trashOutline,
  personCircleOutline, briefcaseOutline, personOutline, homeOutline,
  logOutOutline, settingsOutline
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
};

type CartItem = { 
  id: number; 
  nombre: string; 
  precio: number; 
  imagen: string; 
  qty: number 
};

// Datos de productos optimizados
const productos: Producto[] = [
  { 
    id: 1, 
    nombre: 'Agua Piatua 500ml', 
    precio: 0.50, 
    descripcion: 'Pequeña, práctica y siempre contigo. Perfecta para llevar a cualquier lugar.', 
    imagen: 'agua.jpg',
    rating: 4.8,
    reviews: 124,
    categoria: 'individual'
  },
  { 
    id: 2, 
    nombre: 'Agua Piatua 1L', 
    precio: 1.00, 
    descripcion: 'Un litro de pureza, un litro de vida. Ideal para el hogar y oficina.', 
    imagen: 'litro.jpg',
    rating: 4.9,
    reviews: 89,
    categoria: 'individual'
  },
  { 
    id: 3, 
    nombre: 'Agua Piatua Six Pack', 
    precio: 2.50, 
   
    descripcion: 'Tu fuente de frescura en grande. Perfecto para familias.', 
    imagen: 'Six_Pag.jpg',
    rating: 4.7,
    reviews: 156,
    categoria: 'pack'
  },
  { 
    id: 4, 
    nombre: 'Agua Piatua 12 Unidades', 
    precio: 2.75, 
    descripcion: 'Abastecimiento completo para tu hogar u oficina.', 
    imagen: '12U.jpg',
    rating: 4.6,
    reviews: 67,
    categoria: 'pack'
  },
  { 
    id: 5, 
    nombre: 'Agua Piatua Hielo en Cubos', 
    precio: 1.80, 
    descripcion: 'Hielo puro para tus bebidas más refrescantes.', 
    imagen: 'hielo.jpg',
    rating: 4.5,
    reviews: 92,
    categoria: 'hielo'
  },
  { 
    id: 6, 
    nombre: 'Agua Piatua 20L', 
    precio: 2.50, 
    descripcion: 'La máxima capacidad para tu dispensador. Agua pura en cantidad.', 
    imagen: 'garrafa.jpg',
    rating: 4.9,
    reviews: 203,
    categoria: 'garrafa'
  },
];

export default function Home() {
  const history = useHistory();
  
  // Estados principales
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Estados para efectos visuales
  const [showContent, setShowContent] = useState(false);

  // Datos del usuario (desde localStorage)
  const userType = localStorage.getItem('userType') || 'cliente';
  const username = localStorage.getItem('username') || 'Usuario';

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
    // Verificar autenticación
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      history.push('/login');
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

    // Simular carga inicial
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, 800);

    return () => clearTimeout(loadTimer);
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
      {/* Menú lateral izquierdo */}
      <IonMenu contentId="main-content" menuId="main-menu" side="start">
        <IonHeader>
          <IonToolbar className="menu-toolbar">
            <IonTitle>Menú Principal</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            <IonItem button onClick={() => history.push('/home')}>
              <IonIcon icon={homeOutline} slot="start" />
              Inicio
            </IonItem>
            <IonItem button>
              <IonIcon icon={personCircleOutline} slot="start" />
              Perfil ({userType})
            </IonItem>
            <IonItem button>
              <IonIcon icon={briefcaseOutline} slot="start" />
              Mis Pedidos
            </IonItem>
            <IonItem button>
              <IonIcon icon={settingsOutline} slot="start" />
              Configuración
            </IonItem>
            <IonItem button onClick={handleLogout} color="danger">
              <IonIcon icon={logOutOutline} slot="start" />
              Cerrar Sesión
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>

      {/* Contenido principal */}
      <IonPage id="main-content">
        {/* Header */}
        <IonHeader>
          <IonToolbar className="home-toolbar">
            <IonButtons slot="start">
              <IonMenuButton menu="main-menu" />
            </IonButtons>

            <IonTitle>
              💧 Agua Piatua
              {totalItems > 0 && (
                <IonBadge color="primary" className="header-badge">
                  🛒 {totalItems}
                </IonBadge>
              )}
            </IonTitle>

            <IonButtons slot="end">
              <IonButton 
                fill="clear" 
                onClick={() => setShowCart(true)} 
                aria-label="Abrir carrito"
              >
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
                  <IonCardTitle className="titulo" title={producto.nombre}>
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

          {/* Mini-carrito flotante */}
          <div className={`cart-float ${showCart ? 'open' : ''}`}>
            <div className="cart-float-header">
              <div className="cart-title">
                <IonIcon icon={cartOutline} />
                Carrito de Compras
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
                  <div key={item.id} className="cart-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                    <img 
                      src={item.imagen} 
                      alt={item.nombre} 
                      className="cart-thumb" 
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div className="cart-name producto-nombre" style={{ fontWeight: 600, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nombre}</div>
                      <div className="cart-price producto-precio" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        ${(Number(item.precio) * item.qty).toFixed(2)}
                      </div>
                    </div>
                    <div className="cart-qty" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
    </>
  );
}
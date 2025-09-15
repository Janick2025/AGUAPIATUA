import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Home.css';

import {
  IonButtons, IonContent, IonHeader, IonMenu, IonMenuButton, IonPage,
  IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonBadge, IonIcon, IonButton, IonList, IonItem
} from '@ionic/react';

import {
  cartOutline, star, addOutline, removeOutline, closeOutline, trashOutline,
  personCircleOutline, briefcaseOutline, personOutline
} from 'ionicons/icons';

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
};

const productos: Producto[] = [
  { id: 1, nombre: 'Agua Piatua 500ml', precio: 0.50, descripcion: 'Pequeña, práctica y siempre contigo.', imagen: 'agua.jpg' },
  { id: 2, nombre: 'Agua Piatua 1L',    precio: 1.00, descripcion: 'Un litro de pureza, un litro de vida.', imagen: 'litro.jpg' },
   { id: 3, nombre: 'Agua Piatua Six Pack',   precio: 2.50, descripcion: 'Tu fuente de frescura en grande.',     imagen: 'Six_Pag.jpg' },
   { id: 4, nombre: 'Agua Piatua 12 Unidades',   precio: 2.75, descripcion: 'Tu fuente de frescura en grande.',     imagen: '12U.jpg' },
    { id: 5, nombre: 'Agua Piatua Hielo en Cubos',   precio: 1.80, descripcion: 'Tu fuente de frescura en grande.',     imagen: 'hielo.jpg' },
   { id: 6, nombre: 'Agua Piatua 20L',   precio: 2.50, descripcion: 'Tu fuente de frescura en grande.',     imagen: 'garrafa.jpg' },
  ];

type CartItem = { id: number; nombre: string; precio: number; imagen: string; qty: number };

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const history = useHistory();

  const totalItems = useMemo(() => cart.reduce((a, it) => a + it.qty, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((a, it) => a + it.qty * Number(it.precio), 0), [cart]);

  const qtyById = useMemo(() => {
    const m: Record<number, number> = {};
    for (const it of cart) m[it.id] = it.qty;
    return m;
  }, [cart]);

  const getQty = (id: number) => qtyById[id] ?? 0;

  const renderStars = (rating = 5) => {
    const full = Math.round(rating);
    return (
      <span className="stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <IonIcon key={i} icon={star} className={i < full ? 'star-full' : 'star-empty'} />
        ))}
      </span>
    );
  };

  const addToCart = (idx: number) => {
    const p = productos[idx];
    setCart(prev => {
      const exists = prev.find(it => it.id === p.id);
      if (exists) return prev.map(it => it.id === p.id ? { ...it, qty: it.qty + 1 } : it);
      return [...prev, { id: p.id, nombre: p.nombre, precio: p.precio, imagen: p.imagen, qty: 1 }];
    });
    // El mini carrito flotante ya no se muestra automáticamente
    // setShowCart(true);
  };

  const inc = (id: number) =>
    setCart(prev => prev.map(it => it.id === id ? { ...it, qty: it.qty + 1 } : it));

  const dec = (id: number) =>
    setCart(prev =>
      prev.map(it => it.id === id ? { ...it, qty: Math.max(0, it.qty - 1) } : it)
         .filter(it => it.qty > 0)
    );

  // ✅ faltantes
  const clearCart = () => setCart([]);
  const seguirComprando = () => setShowCart(false);

  return (
    <>



      {/* Contenido principal único */}
      <IonPage id="main-content">
        {/* Header */}
        <IonHeader>
          <IonToolbar className="home-toolbar">
            {/* ...existing code... */}

            <IonTitle>
              Agua Piatua
              {totalItems > 0 && (
                <IonBadge color="primary" className="header-badge">🛒 {totalItems}</IonBadge>
              )}
            </IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setShowCart(true)} aria-label="Abrir carrito">
              <IonIcon icon={cartOutline} className="header-cart-icon" />
            </IonButton>

            {/* ...existing code... */}
          </IonToolbar>
        </IonHeader>

        {/* Contenido */}
        <IonContent className="home-bg ion-padding">
          <div id="productos-grid" className="productos-grid">
            {productos.map((p, idx) => (
              <IonCard key={p.id} className="producto-card ecommerce">
                <div className="img-wrap">
                  <img src={p.imagen} alt={p.nombre} className="producto-imagen contain" />
                </div>
                <IonCardHeader>
                  <IonCardTitle className="titulo" title={p.nombre}>{p.nombre}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="precio-row">
                    <span className="precio">${p.precio.toFixed(2)}</span>
                  </div>
                  <div className="rating-row">
                    {renderStars(4.7)}
                  </div>
                  <p className="descripcion">{p.descripcion}</p>
                  {/* Botón carrito flotante con badge derivado del cart */}
                  <button className="btn-cart" onClick={() => addToCart(idx)} aria-label="Agregar al carrito">
                    <IonIcon icon={cartOutline} />
                    {getQty(p.id) > 0 && (
                      <IonBadge className="cart-badge" color="primary">{getQty(p.id)}</IonBadge>
                    )}
                  </button>
                </IonCardContent>
              </IonCard>
            ))}
          </div>

          {/* Backdrop para cerrar tocando fuera */}
          <div
            className={`cart-backdrop ${showCart ? 'open' : ''}`}
            onClick={() => setShowCart(false)}
          />

          {/* Mini-carrito flotante */}
          <div className={`cart-float ${showCart ? 'open' : ''}`}>
            <div className="cart-float-header">
              <div className="cart-title">
                <IonIcon icon={cartOutline} /> &nbsp; Carrito
                {totalItems > 0 && <IonBadge color="primary" className="header-badge">{totalItems}</IonBadge>}
              </div>
              <div className="cart-actions">
                {cart.length > 0 && (
                  <IonButton size="small" fill="clear" color="danger" onClick={clearCart}>
                    <IonIcon icon={trashOutline} slot="start" /> Vaciar
                  </IonButton>
                )}
                <IonButton size="small" fill="clear" onClick={() => setShowCart(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </div>
            </div>

            <div className="cart-float-body">
              {cart.length === 0 ? (
                <div className="cart-empty">Tu carrito está vacío</div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-row">
                    <img src={item.imagen} alt={item.nombre} className="cart-thumb" />
                    <div className="cart-info">
                      <div className="cart-name">{item.nombre}</div>
                      <div className="cart-price">${item.precio.toFixed(2)}</div>
                    </div>
                    <div className="cart-qty">
                      <IonButton size="small" fill="outline" shape="round" className="qty-ion" onClick={() => dec(item.id)} aria-label="Disminuir">
                        <IonIcon icon={removeOutline} />
                      </IonButton>
                      <span className="qty">{item.qty}</span>
                      <IonButton size="small" fill="outline" shape="round" className="qty-ion" onClick={() => inc(item.id)} aria-label="Aumentar">
                        <IonIcon icon={addOutline} />
                      </IonButton>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="cart-float-footer">
              <div className="cart-total">
                Total: <strong>${totalPrice.toFixed(2)}</strong>
              </div>
              <IonButton expand="block" fill="outline" className="btn-outline-sky" onClick={seguirComprando}>
                Seguir comprando
              </IonButton>
              <IonButton
                expand="block"
                className="btn-primary-sky"
                disabled={cart.length === 0}
                onClick={() => history.push({ pathname: '/factura-final', state: { cart, totalPrice } })}
              >
                LISTO
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonPage>
    </>
  );
}

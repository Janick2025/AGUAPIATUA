import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './ComprobantePedido.css';

type CartItem = { id: number; nombre: string; precio: number; imagen: string; qty: number };

interface ComprobantePedidoProps {
  address: string;
  payment: string; // 'efectivo' | 'transferencia' | ...
  cart: CartItem[];
  totalPrice: number;
  comprobanteUrl?: string;
  onBack: () => void;
}

export default function ComprobantePedido({ address, payment, cart, totalPrice, comprobanteUrl, onBack }: ComprobantePedidoProps) {
  const paymentLabel =
    payment === 'efectivo' ? 'Efectivo' :
    payment === 'transferencia' ? 'Transferencia' :
    payment || '—';
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Comprobante de pedido</IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* Fondo claro y padding controlado */}
         <IonContent className="ion-padding comprobante-bg">
        <div className="comprobante-wrap">
          <h2 className="comprobante-title">¡Pedido realizado con éxito!</h2>

          <div className="panel">
            <h4 className="panel-title">Productos comprados</h4>
            {cart.map(item => (
              <div key={item.id} className="item">
                <img src={item.imagen} alt={item.nombre} className="item-thumb" />
                <div className="item-main">
                  <div className="item-name">{item.nombre}</div>
                  <div className="item-meta">Cantidad: {item.qty}</div>
                  <div className="item-meta">Subtotal: ${ (item.precio * item.qty).toFixed(2) }</div>
                </div>
              </div>
            ))}
          </div>

          <div className="panel">
            <h4 className="panel-title">Dirección de entrega</h4>
            <div className="item-meta">{address}</div>
          </div>

          <div className="panel">
            <h4 className="panel-title">Método de pago</h4>
            <div className="item-meta">{paymentLabel}</div>
          </div>

          {payment === 'transferencia' && comprobanteUrl && (
            <div style={{ marginTop: 18, padding: 12, border: '2px solid #4caf50', borderRadius: 12, background: '#f6fff6', textAlign: 'center' }}>
              <h4 style={{ color: '#388e3c', marginBottom: 10 }}>Comprobante de transferencia</h4>
              <img src={comprobanteUrl} alt="Comprobante de transferencia" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, border: '1.5px solid #4caf50', boxShadow: '0 2px 8px #c8e6c9' }} />
              <div style={{ fontSize: '0.9rem', color: '#388e3c', marginTop: 8 }}>Verifica que la imagen corresponda a tu pago.</div>
            </div>
          )}

          <div className="total-pill">Total pagado: ${ totalPrice.toFixed(2) }</div>
             <div style={{ fontSize: '0.75rem', color: '#607d8b', textAlign: 'center', margin: '18px 0 0 0' }}>
               * Realice la captura de pantalla para su respaldo de pedido
             </div>

          <IonButton
            expand="block"
            className="btn-primary"
            onClick={() => {
              localStorage.removeItem('cart');
              localStorage.removeItem('address');
              localStorage.removeItem('payment');
              // Navega a home y fuerza recarga para limpiar el estado
              history.replace('/home');
              window.location.reload();
            }}
            style={{ marginTop: 12 }}
          >
            GRACIAS
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}

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
  onBack: () => void;
}

export default function ComprobantePedido({ address, payment, cart, totalPrice, onBack }: ComprobantePedidoProps) {
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

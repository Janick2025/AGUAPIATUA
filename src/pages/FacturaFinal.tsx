
import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './FacturaFinal.css';

type CartItem = { id: number; nombre: string; precio: number; imagen: string; qty: number };
interface FacturaFinalProps {
  address: string;
  payment: string;
  cart: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

export default function FacturaFinal(props: FacturaFinalProps) {
  const { address: initialAddress, payment: initialPayment, cart, totalPrice, onBack } = props;
  const [address, setAddress] = useState(initialAddress || '');
  const [payment, setPayment] = useState(initialPayment || '');
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Factura Final</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding factura-final-bg watermark">
        <h2 style={{ textAlign: 'center', marginBottom: 18 }}>Detalle de productos</h2>
        <div style={{ marginBottom: 18 }}>
          {cart.length === 0 ? (
            <div>No hay productos en el pedido.</div>
          ) : (
            <div>
              {cart.map((item: CartItem) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                  <img src={item.imagen} alt={item.nombre} style={{ width: 54, height: 54, objectFit: 'contain', background: '#fafafa', borderRadius: 8, marginRight: 12 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.nombre}</div>
                    <div style={{ color: '#444', fontSize: '0.95rem' }}>Cantidad: {item.qty}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>${(Number(item.precio) * item.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ marginBottom: 18, fontWeight: 600, fontSize: '1.1rem', textAlign: 'right' }}>
          Total: ${Number(totalPrice).toFixed(2)}
        </div>
        <h3 style={{ fontWeight: 600, marginBottom: 10 }}>Dirección de entrega</h3>
        <input
          type="text"
          placeholder="Dirección de entrega"
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <h3 style={{ fontWeight: 600, marginBottom: 10 }}>Método de pago</h3>
        <select
          value={payment}
          onChange={e => setPayment(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="">Selecciona una opción</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
        </select>
        <IonButton
          expand="block"
          color="success"
          disabled={!address || !payment}
          style={{ marginBottom: 8 }}
          onClick={() => {
            history.push({
              pathname: '/comprobante-pedido',
              state: { address, payment, cart, totalPrice }
            });
          }}
        >
          Confirmar pedido
        </IonButton>
        <IonButton expand="block" fill="outline" onClick={onBack}>
          Volver
        </IonButton>
      </IonContent>
    </IonPage>
  );
}

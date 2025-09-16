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

const FacturaFinal: React.FC<FacturaFinalProps> = (props) => {
  const { address: initialAddress, payment: initialPayment, cart, totalPrice, onBack } = props;
  const [address, setAddress] = useState(initialAddress || '');
  const [payment, setPayment] = useState(initialPayment || '');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Factura Final</IonTitle>
        </IonToolbar>
      </IonHeader>
  <IonContent className="ion-padding factura-final-bg watermark" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 20%, #0EA5E9 60%, #38BDF8 100%)', backgroundSize: '200% 200%' }}>
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
        {payment === 'transferencia' && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Sube tu comprobante de pago:</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setComprobante(e.target.files?.[0] || null)}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
        )}
        {payment === 'transferencia' && comprobante && (
          <div style={{ marginTop: 12 }}>
            <h4 className="panel-title">Comprobante de pago</h4>
            <img src={URL.createObjectURL(comprobante)} alt="Comprobante" style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, border: '1px solid #eee' }} />
          </div>
        )}
        <IonButton
          expand="block"
          color="success"
          disabled={!address || !payment || (payment === 'transferencia' && !comprobante)}
          style={{ marginBottom: 8 }}
          onClick={() => {
            let comprobanteUrl = null;
            if (payment === 'transferencia' && comprobante) {
              comprobanteUrl = URL.createObjectURL(comprobante);
            }
            history.push({
              pathname: '/comprobante-pedido',
              state: { address, payment, cart, totalPrice, comprobanteUrl }
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

export default FacturaFinal;

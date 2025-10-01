import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton,
  IonSpinner,
  IonToast,
  IonIcon
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  checkmarkCircleOutline,
  cardOutline,
  cashOutline,
  homeOutline,
  documentTextOutline,
  cloudUploadOutline,
  arrowBackOutline
} from 'ionicons/icons';
import ApiService from '../services/apiService';
import './FacturaFinal.css';

// Tipos TypeScript
type CartItem = { 
  id: number; 
  nombre: string; 
  precio: number; 
  imagen: string; 
  qty: number 
};

interface FacturaFinalProps {
  address?: string;
  payment?: string;
  cart?: CartItem[];
  totalPrice?: number;
  onBack?: () => void;
}

// Componente principal
const FacturaFinal: React.FC<FacturaFinalProps> = (props) => {
  const history = useHistory();
  
  // Estados principales
  const [address, setAddress] = useState(props.address || '');
  const [payment, setPayment] = useState(props.payment || '');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [cart] = useState<CartItem[]>(props.cart || []);
  const [totalPrice] = useState(props.totalPrice || 0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados de UI
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showContent, setShowContent] = useState(false);
  
  // Efecto de entrada
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Función para manejar archivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setToastMessage('Por favor selecciona una imagen válida');
        setShowToast(true);
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToastMessage('La imagen no debe superar los 5MB');
        setShowToast(true);
        return;
      }
      
      setComprobante(file);
      setToastMessage('Comprobante cargado correctamente');
      setShowToast(true);
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    if (!address.trim()) {
      setToastMessage('Por favor ingresa la dirección de entrega');
      setShowToast(true);
      return false;
    }

    if (!payment) {
      setToastMessage('Por favor selecciona un método de pago');
      setShowToast(true);
      return false;
    }

    if (payment === 'transferencia' && !comprobante) {
      setToastMessage('Por favor sube el comprobante de transferencia');
      setShowToast(true);
      return false;
    }

    if (cart.length === 0) {
      setToastMessage('No hay productos en el carrito');
      setShowToast(true);
      return false;
    }

    return true;
  };

  // Confirmar pedido
  const handleConfirmarPedido = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Obtener información del usuario
      const userData = JSON.parse(localStorage.getItem('aguapiatua_user') || '{}');
      const telefono = userData.telefono || '';

      // Preparar items del pedido
      const items = cart.map(item => ({
        product_id: item.id,
        cantidad: item.qty,
        precio_unitario: Number(item.precio)
      }));

      // Preparar notas con información del pago
      let notas = `Método de pago: ${payment === 'efectivo' ? 'Efectivo' : 'Transferencia'}`;

      // Crear pedido en la API
      const orderData = {
        items,
        direccion_entrega: address,
        telefono_contacto: telefono,
        notas,
        metodo_pago: payment
      };

      console.log('Enviando pedido:', orderData);
      const response = await ApiService.createOrder(orderData);
      console.log('Pedido creado:', response);

      // Si hay comprobante de transferencia, subirlo a la API
      let comprobanteUrl = null;
      if (payment === 'transferencia' && comprobante) {
        try {
          console.log('Subiendo comprobante de pago...');
          const uploadResponse = await ApiService.uploadComprobante(comprobante, response.order.id);
          console.log('Comprobante subido:', uploadResponse);
          comprobanteUrl = `${ApiService['baseURL']}${uploadResponse.file.path}`;
          setToastMessage('Pedido y comprobante enviados correctamente');
        } catch (uploadError: any) {
          console.error('Error al subir comprobante:', uploadError);
          setToastMessage('Pedido creado, pero hubo un error al subir el comprobante');
        }
      }

      // Limpiar carrito
      localStorage.removeItem('cart');

      // Navegar al comprobante
      history.push({
        pathname: '/comprobante-pedido',
        state: {
          address,
          payment,
          cart,
          totalPrice,
          comprobanteUrl,
          orderId: response.order.id
        }
      });

    } catch (error: any) {
      console.error('Error al crear pedido:', error);
      setToastMessage(error.message || 'Error al procesar el pedido. Intenta nuevamente.');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Volver atrás
  const handleVolver = () => {
    if (props.onBack) {
      props.onBack();
    } else {
      history.goBack();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="factura-toolbar">
          <IonTitle>Finalizar Pedido</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="factura-content watermark">
        <div 
          className="factura-container"
          style={{ 
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease-out'
          }}
        >
          {/* Título principal */}
          <div className="factura-header">
            <IonIcon icon={documentTextOutline} className="header-icon" />
            <h1 className="header-title">Resumen del Pedido</h1>
            <p className="header-subtitle">Revisa los detalles antes de confirmar</p>
          </div>

          {/* Lista de productos */}
          <div className="productos-section">
            <h2 className="section-title">
              <span className="title-icon">🛒</span>
              Productos ({cart.length})
            </h2>
            
            <div className="productos-list">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <IonIcon icon={documentTextOutline} className="empty-icon" />
                  <p>No hay productos en el pedido</p>
                </div>
              ) : (
                cart.map((item: CartItem) => (
                  <div key={item.id} className="producto-item">
                    <img 
                      src={item.imagen} 
                      alt={item.nombre} 
                      className="factura-producto-imagen"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/images/default-product.jpg';
                      }}
                    />
                    <div className="producto-info">
                      <h3 className="producto-nombre">{item.nombre}</h3>
                      <div className="producto-detalles">
                        <span className="cantidad">Cantidad: {item.qty}</span>
                        <span className="precio-unitario">${item.precio.toFixed(2)} c/u</span>
                      </div>
                    </div>
                    <div className="producto-total">
                      ${(Number(item.precio) * item.qty).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total general */}
            {cart.length > 0 && (
              <div className="total-section">
                <div className="total-row">
                  <span className="total-label">Total a pagar:</span>
                  <span className="total-amount">${Number(totalPrice).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Dirección de entrega */}
          <div className="form-section">
            <h2 className="section-title">
              <IonIcon icon={homeOutline} className="title-icon" />
              Dirección de Entrega
            </h2>
            
            <div className="input-group">
              <input
                type="text"
                className="form-input"
                placeholder="Ingresa tu dirección completa"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <span className="input-helper">
                Incluye referencias y número de casa/departamento
              </span>
            </div>
          </div>

          {/* Método de pago */}
          <div className="form-section">
            <h2 className="section-title">
              <IonIcon icon={cardOutline} className="title-icon" />
              Método de Pago
            </h2>
            
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="efectivo"
                  checked={payment === 'efectivo'}
                  onChange={(e) => setPayment(e.target.value)}
                />
                <div className="option-content">
                  <IonIcon icon={cashOutline} className="option-icon" />
                  <div className="option-info">
                    <span className="option-title">Efectivo</span>
                    <span className="option-description">Pago contra entrega</span>
                  </div>
                </div>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="transferencia"
                  checked={payment === 'transferencia'}
                  onChange={(e) => setPayment(e.target.value)}
                />
                <div className="option-content">
                  <IonIcon icon={cardOutline} className="option-icon" />
                  <div className="option-info">
                    <span className="option-title">Transferencia</span>
                    <span className="option-description">Pago por adelantado</span>
                  </div>
                </div>
              </label>
            </div>

            {/* Datos bancarios para transferencia */}
            {payment === 'transferencia' && (
              <div className="bank-info">
                <h3 className="bank-title">Datos para Transferencia</h3>
                <div className="bank-details">
                  <div className="bank-item">
                    <strong>Banco:</strong> Banco Pichincha
                  </div>
                  <div className="bank-item">
                    <strong>Cuenta:</strong> 2100123456
                  </div>
                  <div className="bank-item">
                    <strong>Titular:</strong> Agua Piatua S.A.
                  </div>
                  <div className="bank-item">
                    <strong>Monto:</strong> ${Number(totalPrice).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Upload de comprobante */}
            {payment === 'transferencia' && (
              <div className="upload-section">
                <label className="upload-label">
                  <IonIcon icon={cloudUploadOutline} />
                  Subir Comprobante de Pago
                </label>
                
                <div className="upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="upload-input"
                    id="comprobante-upload"
                  />
                  <label htmlFor="comprobante-upload" className="upload-button">
                    {comprobante ? (
                      <div className="file-selected">
                        <IonIcon icon={checkmarkCircleOutline} />
                        <span>Archivo seleccionado: {comprobante.name}</span>
                      </div>
                    ) : (
                      <div className="file-placeholder">
                        <IonIcon icon={cloudUploadOutline} />
                        <span>Haz clic para seleccionar imagen</span>
                        <small>Máximo 5MB - JPG, PNG</small>
                      </div>
                    )}
                  </label>
                </div>

                {/* Preview del comprobante */}
                {comprobante && (
                  <div className="comprobante-preview">
                    <h4 className="preview-title">Vista Previa del Comprobante</h4>
                    <img 
                      src={URL.createObjectURL(comprobante)} 
                      alt="Comprobante de pago" 
                      className="preview-image"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="actions-section">
            <IonButton
              fill="outline"
              expand="block"
              className="btn-secondary"
              onClick={handleVolver}
              disabled={isLoading}
            >
              <IonIcon icon={arrowBackOutline} slot="start" />
              Volver al Carrito
            </IonButton>

            <IonButton
              expand="block"
              className="btn-primary"
              onClick={handleConfirmarPedido}
              disabled={!address || !payment || (payment === 'transferencia' && !comprobante) || isLoading}
            >
              {isLoading ? (
                <>
                  <IonSpinner name="crescent" />
                  <span style={{ marginLeft: '8px' }}>Procesando...</span>
                </>
              ) : (
                <>
                  <IonIcon icon={checkmarkCircleOutline} slot="start" />
                  Confirmar Pedido
                </>
              )}
            </IonButton>
          </div>
        </div>

        {/* Toast para mensajes */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="top"
          color="primary"
        />
      </IonContent>
    </IonPage>
  );
};

export default FacturaFinal;
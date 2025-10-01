import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import ApiService from '../services/apiService';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonBadge, IonSpinner,
  IonToast, IonModal, IonList, IonItem, IonLabel,
  IonRefresher, IonRefresherContent
} from '@ionic/react';
import {
  arrowBackOutline, receiptOutline, timeOutline,
  checkmarkCircleOutline, alertCircleOutline, closeCircleOutline,
  cartOutline, locationOutline, callOutline, refreshOutline
} from 'ionicons/icons';
import './HistorialPedidos.css';

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

export default function HistorialPedidos() {
  const history = useHistory();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      setIsLoading(true);
      const orders = await ApiService.getOrders();
      // Ordenar por fecha descendente (más reciente primero)
      const sortedOrders = orders.sort((a: Pedido, b: Pedido) =>
        new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime()
      );
      setPedidos(sortedOrders);
    } catch (error: any) {
      console.error('Error cargando pedidos:', error);
      showMessage('Error al cargar el historial de pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadPedidos();
    event.detail.complete();
  };

  const showMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = async (pedido: Pedido) => {
    try {
      setIsLoadingDetails(true);
      setShowModal(true);
      // Cargar detalles completos del pedido
      const details = await ApiService.getOrder(pedido.id);
      setSelectedPedido(details);
    } catch (error: any) {
      console.error('Error cargando detalles:', error);
      showMessage('Error al cargar los detalles del pedido');
      setShowModal(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPedido(null);
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => history.goBack()}>
                <IonIcon icon={arrowBackOutline} />
              </IonButton>
            </IonButtons>
            <IonTitle>Historial de Pedidos</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '50%' }}>
            <IonSpinner name="crescent" />
            <p>Cargando pedidos...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Mis Pedidos</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={loadPedidos}>
              <IonIcon icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="historial-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {pedidos.length === 0 ? (
          <div className="empty-state">
            <IonIcon icon={receiptOutline} style={{ fontSize: '4rem', opacity: 0.3 }} />
            <h2>No tienes pedidos aún</h2>
            <p>Tus pedidos aparecerán aquí</p>
            <IonButton onClick={() => history.push('/home')}>
              Ir a comprar
            </IonButton>
          </div>
        ) : (
          <div className="pedidos-list">
            {pedidos.map((pedido) => (
              <IonCard key={pedido.id} className="pedido-card">
                <IonCardHeader>
                  <div className="pedido-header">
                    <div>
                      <IonCardTitle>Pedido #{pedido.id}</IonCardTitle>
                      <p className="pedido-fecha">
                        <IonIcon icon={timeOutline} />
                        {formatDate(pedido.fecha_pedido)}
                      </p>
                    </div>
                    <IonBadge color={getEstadoBadgeColor(pedido.estado)} className="estado-badge">
                      <IonIcon icon={getEstadoIcon(pedido.estado)} />
                      {getEstadoText(pedido.estado)}
                    </IonBadge>
                  </div>
                </IonCardHeader>

                <IonCardContent>
                  <div className="pedido-info">
                    <div className="info-row">
                      <IonIcon icon={locationOutline} />
                      <span>{pedido.direccion_entrega}</span>
                    </div>
                    {pedido.telefono_contacto && (
                      <div className="info-row">
                        <IonIcon icon={callOutline} />
                        <span>{pedido.telefono_contacto}</span>
                      </div>
                    )}
                    {pedido.vendedor_nombre && (
                      <div className="info-row">
                        <IonIcon icon={checkmarkCircleOutline} />
                        <span>Vendedor: {pedido.vendedor_nombre}</span>
                      </div>
                    )}
                  </div>

                  <div className="pedido-footer">
                    <div className="total">
                      <strong>Total: ${pedido.total.toFixed(2)}</strong>
                    </div>
                    <IonButton
                      size="small"
                      fill="outline"
                      onClick={() => handleViewDetails(pedido)}
                    >
                      Ver Detalles
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}
      </IonContent>

      {/* Modal de detalles */}
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
                <IonList>
                  <IonItem>
                    <IonLabel>
                      <strong>Número de Pedido:</strong>
                      <p>#{selectedPedido.id}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <strong>Estado:</strong>
                      <p>
                        <IonBadge color={getEstadoBadgeColor(selectedPedido.estado)}>
                          {getEstadoText(selectedPedido.estado)}
                        </IonBadge>
                      </p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <strong>Fecha de Pedido:</strong>
                      <p>{formatDate(selectedPedido.fecha_pedido)}</p>
                    </IonLabel>
                  </IonItem>
                  {selectedPedido.fecha_entrega_real && (
                    <IonItem>
                      <IonLabel>
                        <strong>Fecha de Entrega:</strong>
                        <p>{formatDate(selectedPedido.fecha_entrega_real)}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>
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
                            <strong>{item.nombre}</strong>
                            <p>Cantidad: {item.cantidad}</p>
                            <p>Precio unitario: ${item.precio_unitario.toFixed(2)}</p>
                          </div>
                          <div className="item-subtotal">
                            ${item.subtotal.toFixed(2)}
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
                <IonCard className="total-card">
                  <IonCardContent>
                    <div className="total-row">
                      <h2>Total:</h2>
                      <h2>${selectedPedido.total.toFixed(2)}</h2>
                    </div>
                  </IonCardContent>
                </IonCard>
              </div>
            </div>
          ) : null}
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
      />
    </IonPage>
  );
}

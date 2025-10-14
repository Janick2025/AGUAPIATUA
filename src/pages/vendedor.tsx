import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './vendedor.css';
import notificationService from '../services/notificationService';
import ApiService from '../services/apiService';

import {
  IonButtons, IonContent, IonHeader, IonPage,
  IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonBadge, IonIcon, IonButton,
  IonToast, IonList, IonItem, IonLabel, IonAvatar,
  IonRefresher, IonRefresherContent, IonChip, IonGrid,
  IonRow, IonCol, IonProgressBar
} from '@ionic/react';

import {
  logOutOutline, mapOutline, checkmarkCircleOutline, timeOutline,
  carOutline, personOutline, locationOutline, callOutline,
  waterOutline, listOutline, navigateOutline
} from 'ionicons/icons';

// Tipos TypeScript para el repartidor
type EstadoEntrega = 'pendiente' | 'en_ruta' | 'entregado' | 'cancelado';

type Pedido = {
  id: number;
  cliente: string;
  telefono: string;
  direccion: string;
  productos: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  total: number;
  hora_asignacion: string;
  hora_estimada: string;
  estado: EstadoEntrega;
  prioridad: 'alta' | 'media' | 'baja';
  notas?: string;
  metodo_pago?: string;
  comprobante_pago?: string;
};

// Datos simulados de pedidos asignados
const pedidosAsignados: Pedido[] = [
  {
    id: 1001,
    cliente: 'María González',
    telefono: '+593 99 123 4567',
    direccion: 'Av. Principal 123, Centro, Quito',
    productos: [
      { nombre: 'AGUA CAMPOS 20L', cantidad: 2, precio: 2.50 },
      { nombre: 'AGUA CAMPOS 1L', cantidad: 6, precio: 1.00 }
    ],
    total: 11.00,
    hora_asignacion: '08:30',
    hora_estimada: '09:15',
    estado: 'pendiente',
    prioridad: 'alta',
    notas: 'Llamar antes de llegar'
  },
  {
    id: 1002,
    cliente: 'Carlos Rodríguez',
    telefono: '+593 98 765 4321',
    direccion: 'Calle Secundaria 456, Norte, Quito',
    productos: [
      { nombre: 'AGUA CAMPOS Six Pack', cantidad: 3, precio: 2.50 }
    ],
    total: 7.50,
    hora_asignacion: '09:00',
    hora_estimada: '10:00',
    estado: 'en_ruta',
    prioridad: 'media'
  },
  {
    id: 1003,
    cliente: 'Ana Morales',
    telefono: '+593 97 234 5678',
    direccion: 'Sector Los Pinos, Mz. 5, Casa 12',
    productos: [
      { nombre: 'AGUA CAMPOS 20L', cantidad: 1, precio: 2.50 },
      { nombre: 'Hielo en Cubos', cantidad: 2, precio: 1.80 }
    ],
    total: 6.10,
    hora_asignacion: '10:30',
    hora_estimada: '11:30',
    estado: 'pendiente',
    prioridad: 'baja'
  }
];

export default function VendedorRepartidor() {
  const history = useHistory();
  
  // Estados principales
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosAsignados);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'warning' | 'danger'>('success');
  const [isLoading, setIsLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  // Datos del repartidor
  const vendedorNombre = localStorage.getItem('username') || 'Repartidor';
  const fechaHoy = new Date().toLocaleDateString('es-EC', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Cálculos de estadísticas
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length;
  const pedidosEnRuta = pedidos.filter(p => p.estado === 'en_ruta').length;
  const pedidosEntregados = pedidos.filter(p => p.estado === 'entregado').length;
  const totalVentas = pedidos
    .filter(p => p.estado === 'entregado')
    .reduce((sum, p) => sum + p.total, 0);

  useEffect(() => {
    // Verificar autenticación
    const userType = localStorage.getItem('userType');
    if (userType !== 'vendedor') {
      history.push('/login');
      return;
    }

    // Cargar pedidos desde la API
    const loadPedidos = async () => {
      try {
        console.log('Cargando pedidos del vendedor...');
        console.log('Token:', localStorage.getItem('aguapiatua_token'));
        const ordersData = await ApiService.getOrders();
        console.log('✅ Pedidos del vendedor recibidos:', ordersData);

        // Obtener detalles completos de cada pedido (incluyendo productos)
        const detailedOrders = await Promise.all(
          ordersData.map(async (o: any) => {
            try {
              const orderDetails = await ApiService.getOrder(o.id);
              return orderDetails;
            } catch (error) {
              console.error(`Error obteniendo detalles del pedido ${o.id}:`, error);
              return o; // Devolver orden básica si falla
            }
          })
        );

        console.log('✅ Detalles completos de pedidos:', detailedOrders);

        // Mapear pedidos de la API al formato local
        const mappedPedidos = detailedOrders.map((o: any) => ({
          id: o.id,
          cliente: o.cliente_nombre,
          telefono: o.telefono_contacto || o.cliente_telefono,
          direccion: o.direccion_entrega,
          productos: o.items ? o.items.map((item: any) => ({
            nombre: item.producto_nombre,
            cantidad: item.cantidad,
            precio: Number(item.precio_unitario)
          })) : [],
          total: Number(o.total),
          hora_asignacion: new Date(o.fecha_pedido).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
          hora_estimada: '-',
          estado: o.estado === 'En_Camino' ? 'en_ruta' :
                 o.estado === 'Entregado' ? 'entregado' :
                 o.estado === 'Cancelado' ? 'cancelado' : 'pendiente' as EstadoEntrega,
          prioridad: 'media' as 'alta' | 'media' | 'baja',
          notas: o.notas,
          metodo_pago: o.metodo_pago,
          comprobante_pago: o.comprobante_pago
        }));

        setPedidos(mappedPedidos);
      } catch (error) {
        console.error('Error cargando pedidos:', error);
        showMessage('Error al cargar pedidos', 'danger');
      } finally {
        setIsLoading(false);
      }
    };

    loadPedidos();

    // Conectar Socket.IO para notificaciones
    const userId = localStorage.getItem('userId');
    if (userId) {
      notificationService.connect(parseInt(userId), 'Vendedor');

      // Escuchar pedidos asignados
      notificationService.onOrderAssigned(parseInt(userId), (data) => {
        console.log('🔔 Pedido asignado recibido:', data);
        setNotificationCount(prev => prev + 1);
        showMessage(`📦 Nuevo pedido asignado: Pedido #${data.orderId} - $${data.total}`, 'success');

        // Recargar pedidos
        loadPedidos();
      });
    }

    return () => {
      notificationService.disconnect();
    };
  }, [history]);

  // Función para mostrar mensajes
  const showMessage = (message: string, color: 'success' | 'warning' | 'danger' = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  // Función para cambiar estado de pedido
  const cambiarEstadoPedido = async (id: number, nuevoEstado: EstadoEntrega) => {
    try {
      // Mapear estados del frontend al backend
      const estadoBackend = nuevoEstado === 'en_ruta' ? 'En_Camino' :
                           nuevoEstado === 'entregado' ? 'Entregado' :
                           nuevoEstado === 'cancelado' ? 'Cancelado' : 'Pendiente';

      // Actualizar en la API
      await ApiService.updateOrderStatus(id, estadoBackend);

      // Actualizar estado local
      setPedidos(prev =>
        prev.map(pedido =>
          pedido.id === id
            ? { ...pedido, estado: nuevoEstado }
            : pedido
        )
      );

      const mensajes: Record<EstadoEntrega, string> = {
        'pendiente': 'Pedido en estado pendiente',
        'en_ruta': 'Pedido marcado como "En Ruta"',
        'entregado': '¡Entrega completada exitosamente!',
        'cancelado': 'Pedido cancelado'
      };

      showMessage(mensajes[nuevoEstado] || 'Estado actualizado');
    } catch (error: any) {
      console.error('Error actualizando estado:', error);
      showMessage(error.message || 'Error al actualizar estado', 'danger');
    }
  };

  // Función para abrir GPS/Mapa
  const abrirMapa = (direccion: string) => {
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(direccion)}`;
    window.open(url, '_blank');
    showMessage('Abriendo navegación GPS...', 'success');
  };

  // Función para llamar al cliente
  const llamarCliente = (telefono: string) => {
    window.open(`tel:${telefono}`);
  };

  // Función para refrescar datos
  const handleRefresh = (event: any) => {
    setTimeout(() => {
      // Simular actualización de datos
      showMessage('Datos actualizados', 'success');
      event.detail.complete();
    }, 2000);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.clear();
    showMessage('Sesión cerrada correctamente');
    setTimeout(() => {
      history.push('/login');
    }, 1000);
  };

  // Obtener color por prioridad
  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'danger';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'medium';
    }
  };

  // Obtener color por estado
  const getEstadoColor = (estado: EstadoEntrega) => {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en_ruta': return 'primary';
      case 'entregado': return 'success';
      case 'cancelado': return 'danger';
      default: return 'medium';
    }
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonContent className="ion-padding loading-content">
          <div className="loading-container">
            <IonIcon icon={carOutline} className="loading-icon" />
            <h2>Cargando Rutas de Entrega...</h2>
            <IonProgressBar type="indeterminate" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <>
      <IonPage>
        {/* Header */}
        <IonHeader>
          <IonToolbar className="vendedor-toolbar">
            <IonButtons slot="start">
              <IonButton fill="clear" onClick={handleLogout} color="light">
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </IonButtons>

            <IonTitle>
              🚚 Repartidor AGUA CAMPOS
            </IonTitle>

            <IonButtons slot="end">
              <IonBadge color="light">
                {pedidosPendientes} pendientes
              </IonBadge>
              {notificationCount > 0 && (
                <IonBadge color="danger" style={{ marginLeft: '8px' }}>
                  {notificationCount} nuevos
                </IonBadge>
              )}
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="vendedor-bg" fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          {/* Header de información del repartidor */}
          <div className="vendedor-header">
            <div className="vendedor-info">
              <IonAvatar className="vendedor-avatar">
                <IonIcon icon={personOutline} />
              </IonAvatar>
              <div>
                <h2>¡Hola {vendedorNombre}!</h2>
                <p>{fechaHoy}</p>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <IonGrid className="stats-grid">
            <IonRow>
              <IonCol size="3">
                <div className="stat-card pending">
                  <IonIcon icon={timeOutline} />
                  <div className="stat-number">{pedidosPendientes}</div>
                  <div className="stat-label">Pendientes</div>
                </div>
              </IonCol>
              <IonCol size="3">
                <div className="stat-card in-route">
                  <IonIcon icon={carOutline} />
                  <div className="stat-number">{pedidosEnRuta}</div>
                  <div className="stat-label">En Ruta</div>
                </div>
              </IonCol>
              <IonCol size="3">
                <div className="stat-card delivered">
                  <IonIcon icon={checkmarkCircleOutline} />
                  <div className="stat-number">{pedidosEntregados}</div>
                  <div className="stat-label">Entregados</div>
                </div>
              </IonCol>
              <IonCol size="3">
                <div className="stat-card sales">
                  <IonIcon icon={waterOutline} />
                  <div className="stat-number">${totalVentas.toFixed(2)}</div>
                  <div className="stat-label">Ventas</div>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Lista de pedidos asignados */}
          <div className="pedidos-section">
            <h3>
              <IonIcon icon={listOutline} /> 
              Entregas Asignadas
            </h3>

            {pedidos.map(pedido => (
              <IonCard key={pedido.id} className={`pedido-card ${pedido.estado}`}>
                <IonCardHeader>
                  <div className="pedido-header">
                    <div>
                      <IonCardTitle className="cliente-nombre">
                        {pedido.cliente}
                      </IonCardTitle>
                      <div className="pedido-id">Pedido #{pedido.id}</div>
                    </div>
                    <div className="pedido-badges">
                      <IonChip color={getPrioridadColor(pedido.prioridad)}>
                        {pedido.prioridad.toUpperCase()}
                      </IonChip>
                      <IonChip color={getEstadoColor(pedido.estado)}>
                        {pedido.estado.replace('_', ' ').toUpperCase()}
                      </IonChip>
                    </div>
                  </div>
                </IonCardHeader>

                <IonCardContent>
                  {/* Información de entrega */}
                  <div className="entrega-info">
                    <div className="info-row">
                      <IonIcon icon={locationOutline} />
                      <span>{pedido.direccion}</span>
                    </div>
                    <div className="info-row">
                      <IonIcon icon={callOutline} />
                      <span>{pedido.telefono}</span>
                    </div>
                    <div className="info-row">
                      <IonIcon icon={timeOutline} />
                      <span>Asignado: {pedido.hora_asignacion} | Estimado: {pedido.hora_estimada}</span>
                    </div>
                  </div>

                  {/* Productos */}
                  <div className="productos-resumen">
                    <h4>Productos:</h4>
                    {pedido.productos.map((producto, index) => (
                      <div key={index} className="producto-item">
                        <span>{producto.cantidad}x {producto.nombre}</span>
                        <span>${(producto.cantidad * producto.precio).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="total-pedido">
                      <strong>Total: ${pedido.total.toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* Método de pago */}
                  <div className="metodo-pago" style={{
                    padding: '12px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <strong>Método de Pago: </strong>
                    {pedido.metodo_pago === 'transferencia' ? (
                      <>
                        <span style={{ color: '#10B981', fontWeight: '600' }}>Transferencia Bancaria</span>
                        {pedido.comprobante_pago && (
                          <div style={{ marginTop: '8px' }}>
                            <a
                              href={`http://localhost:3001${pedido.comprobante_pago}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-block',
                                padding: '6px 12px',
                                background: '#38BDF8',
                                color: 'white',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                              }}
                            >
                              📥 Ver Comprobante de Transferencia
                            </a>
                          </div>
                        )}
                      </>
                    ) : (
                      <span style={{ color: '#F59E0B', fontWeight: '600' }}>Efectivo (Contra Entrega)</span>
                    )}
                  </div>

                  {/* Notas especiales */}
                  {pedido.notas && (
                    <div className="notas-especiales">
                      <strong>Notas:</strong> {pedido.notas}
                    </div>
                  )}

                  {/* Acciones del pedido */}
                  <div className="pedido-acciones">
                    <IonButton 
                      fill="outline" 
                      size="small"
                      onClick={() => abrirMapa(pedido.direccion)}
                    >
                      <IonIcon icon={navigateOutline} slot="start" />
                      GPS
                    </IonButton>
                    
                    <IonButton 
                      fill="outline" 
                      size="small"
                      onClick={() => llamarCliente(pedido.telefono)}
                    >
                      <IonIcon icon={callOutline} slot="start" />
                      Llamar
                    </IonButton>

                    {pedido.estado === 'pendiente' && (
                      <IonButton 
                        color="primary"
                        size="small"
                        onClick={() => cambiarEstadoPedido(pedido.id, 'en_ruta')}
                      >
                        <IonIcon icon={carOutline} slot="start" />
                        Iniciar Entrega
                      </IonButton>
                    )}

                    {pedido.estado === 'en_ruta' && (
                      <IonButton 
                        color="success"
                        size="small"
                        onClick={() => cambiarEstadoPedido(pedido.id, 'entregado')}
                      >
                        <IonIcon icon={checkmarkCircleOutline} slot="start" />
                        Marcar Entregado
                      </IonButton>
                    )}
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        </IonContent>
      </IonPage>

      {/* Toast para mensajes */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastColor}
        position="bottom"
      />
    </>
  );
}

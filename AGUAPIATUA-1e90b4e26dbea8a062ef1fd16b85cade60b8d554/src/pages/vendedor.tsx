import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonIcon, IonToast, IonAlert, IonPage, IonContent 
} from '@ionic/react';
import {
  bagOutline, checkmarkCircleOutline, timeOutline, carOutline,
  logOutOutline, refreshOutline, eyeOutline, callOutline, locationOutline,
  personOutline, cardOutline, chevronDownOutline,
  notificationsOutline, statsChartOutline, closeCircleOutline
} from 'ionicons/icons';
import './vendedor.css';

// Interfaces TypeScript
interface Pedido {
  id: number;
  cliente: string;
  telefono: string;
  direccion: string;
  productos: ProductoPedido[];
  total: number;
  estado: 'pendiente' | 'asignado' | 'en-proceso' | 'entregado' | 'cancelado';
  fechaPedido: string;
  horaEstimada?: string;
  vendedorAsignado?: string;
  comentarios?: string;
}

interface ProductoPedido {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

interface EstadisticasVendedor {
  pedidosHoy: number;
  pedidosCompletados: number;
  ventasTotal: number;
  calificacionPromedio: number;
}

const VendedorDashboard: React.FC = () => {
  const history = useHistory();
  
  // Estados del componente
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasVendedor>({
    pedidosHoy: 0,
    pedidosCompletados: 0,
    ventasTotal: 0,
    calificacionPromedio: 4.8
  });
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'warning' | 'danger'>('success');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<any>({});

  // Datos de ejemplo para pedidos
  const pedidosEjemplo: Pedido[] = [
    {
      id: 1001,
      cliente: "María González",
      telefono: "0987654321",
      direccion: "Av. Principal 123, Sector Norte",
      productos: [
        { id: 1, nombre: "Botellón 20L", cantidad: 2, precio: 5.50, subtotal: 11.00 },
        { id: 2, nombre: "Agua 1L (6 pack)", cantidad: 1, precio: 3.00, subtotal: 3.00 }
      ],
      total: 14.00,
      estado: 'asignado',
      fechaPedido: '2025-09-24',
      horaEstimada: '14:30',
      vendedorAsignado: 'vendedor',
      comentarios: 'Entregar en horario de almuerzo'
    },
    {
      id: 1002,
      cliente: "Carlos Rodríguez",
      telefono: "0998877665",
      direccion: "Calle Secundaria 456, Ciudadela El Agua",
      productos: [
        { id: 1, nombre: "Botellón 20L", cantidad: 4, precio: 5.50, subtotal: 22.00 }
      ],
      total: 22.00,
      estado: 'pendiente',
      fechaPedido: '2025-09-24',
      comentarios: 'Pago en efectivo'
    },
    {
      id: 1003,
      cliente: "Ana Martínez",
      telefono: "0987123456",
      direccion: "Urbanización Las Flores, Mz 15 Villa 8",
      productos: [
        { id: 2, nombre: "Agua 1L (6 pack)", cantidad: 3, precio: 3.00, subtotal: 9.00 },
        { id: 3, nombre: "Hielo 1kg", cantidad: 2, precio: 1.50, subtotal: 3.00 }
      ],
      total: 12.00,
      estado: 'en-proceso',
      fechaPedido: '2025-09-24',
      horaEstimada: '15:45',
      vendedorAsignado: 'vendedor'
    },
    {
      id: 1004,
      cliente: "Jorge López",
      telefono: "0996543210",
      direccion: "Sector Industrial, Calle 7ma #234",
      productos: [
        { id: 1, nombre: "Botellón 20L", cantidad: 6, precio: 5.50, subtotal: 33.00 }
      ],
      total: 33.00,
      estado: 'entregado',
      fechaPedido: '2025-09-24',
      vendedorAsignado: 'vendedor'
    }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    // Simular carga de pedidos del vendedor actual
    const vendedorActual = localStorage.getItem('userType');
    const pedidosVendedor = pedidosEjemplo.filter(pedido => 
      pedido.vendedorAsignado === vendedorActual || pedido.estado === 'pendiente'
    );
    
    setPedidos(pedidosVendedor);
    
    // Calcular estadísticas
    const hoy = new Date().toISOString().split('T')[0];
    const pedidosHoy = pedidosVendedor.filter(p => p.fechaPedido === hoy);
    const completados = pedidosVendedor.filter(p => p.estado === 'entregado');
    const ventasTotal = completados.reduce((sum, p) => sum + p.total, 0);
    
    setEstadisticas({
      pedidosHoy: pedidosHoy.length,
      pedidosCompletados: completados.length,
      ventasTotal,
      calificacionPromedio: 4.8
    });
  }, []);

  // Funciones de gestión de pedidos
  const tomarPedido = (pedidoId: number) => {
    setPedidos(prev => prev.map(pedido => 
      pedido.id === pedidoId 
        ? { ...pedido, estado: 'asignado', vendedorAsignado: 'vendedor' }
        : pedido
    ));
    showMessage('Pedido tomado exitosamente', 'success');
  };

  const cambiarEstadoPedido = (pedidoId: number, nuevoEstado: Pedido['estado']) => {
    setPedidos(prev => prev.map(pedido => 
      pedido.id === pedidoId 
        ? { ...pedido, estado: nuevoEstado }
        : pedido
    ));
    
    const mensajes: Record<Pedido['estado'], string> = {
      'pendiente': 'Pedido marcado como pendiente',
      'asignado': 'Pedido asignado correctamente',
      'en-proceso': 'Pedido marcado como en proceso',
      'entregado': 'Pedido marcado como entregado',
      'cancelado': 'Pedido cancelado'
    };
    
    showMessage(mensajes[nuevoEstado], 'success');
  };

  const handleLogout = () => {
    setAlertConfig({
      isOpen: true,
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar Sesión',
          handler: () => {
            localStorage.clear();
            showMessage('Sesión cerrada correctamente', 'success');
            setTimeout(() => history.push('/login'), 1000);
          }
        }
      ]
    });
    setShowAlert(true);
  };

  const showMessage = (message: string, color: 'success' | 'warning' | 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const getEstadoColor = (estado: Pedido['estado']) => {
    const colores = {
      'pendiente': 'vendedor-badge-warning',
      'asignado': 'vendedor-badge-info', 
      'en-proceso': 'vendedor-badge-primary',
      'entregado': 'vendedor-badge-success',
      'cancelado': 'vendedor-badge-danger'
    };
    return colores[estado];
  };

  const getEstadoTexto = (estado: Pedido['estado']) => {
    const textos = {
      'pendiente': 'Pendiente',
      'asignado': 'Asignado',
      'en-proceso': 'En Proceso', 
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return textos[estado];
  };

  const pedidosFiltrados = filtroEstado === 'todos' 
    ? pedidos 
    : pedidos.filter(pedido => pedido.estado === filtroEstado);

  return (
    <IonPage className="vendedor-page">
      <IonContent className="vendedor-content">
        <div className="vendedor-container">
          
          {/* Header del Dashboard */}
          <div className="vendedor-header">
            <div className="vendedor-header-content">
              <div className="vendedor-welcome">
                <h1>Panel de Vendedor</h1>
                <p>Gestiona tus pedidos asignados</p>
              </div>
              <div className="vendedor-header-actions">
                <button 
                  className="vendedor-btn vendedor-btn-refresh"
                  onClick={() => window.location.reload()}
                >
                  <IonIcon icon={refreshOutline} />
                  Actualizar
                </button>
                <button 
                  className="vendedor-btn vendedor-btn-logout"
                  onClick={handleLogout}
                >
                  <IonIcon icon={logOutOutline} />
                  Salir
                </button>
              </div>
            </div>
          </div>

          {/* Tarjetas de Estadísticas */}
          <div className="vendedor-stats-grid">
            <div className="vendedor-stat-card">
              <div className="vendedor-stat-icon pedidos-hoy">
                <IonIcon icon={bagOutline} />
              </div>
              <div className="vendedor-stat-info">
                <h3>Pedidos Hoy</h3>
                <div className="vendedor-stat-number">{estadisticas.pedidosHoy}</div>
              </div>
            </div>

            <div className="vendedor-stat-card">
              <div className="vendedor-stat-icon completados">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
              <div className="vendedor-stat-info">
                <h3>Completados</h3>
                <div className="vendedor-stat-number">{estadisticas.pedidosCompletados}</div>
              </div>
            </div>

            <div className="vendedor-stat-card">
              <div className="vendedor-stat-icon ventas">
                <IonIcon icon={statsChartOutline} />
              </div>
              <div className="vendedor-stat-info">
                <h3>Ventas Total</h3>
                <div className="vendedor-stat-number">${estadisticas.ventasTotal.toFixed(2)}</div>
              </div>
            </div>

            <div className="vendedor-stat-card">
              <div className="vendedor-stat-icon rating">
                <IonIcon icon={notificationsOutline} />
              </div>
              <div className="vendedor-stat-info">
                <h3>Nuevos</h3>
                <div className="vendedor-stat-number">{pedidos.filter(p => p.estado === 'pendiente').length}</div>
              </div>
            </div>
          </div>

          {/* Filtros de Pedidos */}
          <div className="vendedor-filters">
            <h2>Gestión de Pedidos</h2>
            <div className="vendedor-filter-buttons">
              <button 
                className={`vendedor-filter-btn ${filtroEstado === 'todos' ? 'active' : ''}`}
                onClick={() => setFiltroEstado('todos')}
              >
                Todos ({pedidos.length})
              </button>
              <button 
                className={`vendedor-filter-btn ${filtroEstado === 'pendiente' ? 'active' : ''}`}
                onClick={() => setFiltroEstado('pendiente')}
              >
                Pendientes ({pedidos.filter(p => p.estado === 'pendiente').length})
              </button>
              <button 
                className={`vendedor-filter-btn ${filtroEstado === 'asignado' ? 'active' : ''}`}
                onClick={() => setFiltroEstado('asignado')}
              >
                Asignados ({pedidos.filter(p => p.estado === 'asignado').length})
              </button>
              <button 
                className={`vendedor-filter-btn ${filtroEstado === 'en-proceso' ? 'active' : ''}`}
                onClick={() => setFiltroEstado('en-proceso')}
              >
                En Proceso ({pedidos.filter(p => p.estado === 'en-proceso').length})
              </button>
            </div>
          </div>

          {/* Lista de Pedidos */}
          <div className="vendedor-pedidos-grid">
            {pedidosFiltrados.map(pedido => (
              <div key={pedido.id} className="vendedor-pedido-card">
                
                {/* Header del pedido */}
                <div className="vendedor-pedido-header">
                  <div className="vendedor-pedido-id">
                    <strong>Pedido #{pedido.id}</strong>
                    <span className={`vendedor-badge ${getEstadoColor(pedido.estado)}`}>
                      {getEstadoTexto(pedido.estado)}
                    </span>
                  </div>
                  <div className="vendedor-pedido-fecha">
                    <IonIcon icon={timeOutline} />
                    {pedido.fechaPedido}
                    {pedido.horaEstimada && ` - ${pedido.horaEstimada}`}
                  </div>
                </div>

                {/* Información del cliente */}
                <div className="vendedor-cliente-info">
                  <div className="vendedor-cliente-item">
                    <IonIcon icon={personOutline} />
                    <span>{pedido.cliente}</span>
                  </div>
                  <div className="vendedor-cliente-item">
                    <IonIcon icon={callOutline} />
                    <span>{pedido.telefono}</span>
                  </div>
                  <div className="vendedor-cliente-item">
                    <IonIcon icon={locationOutline} />
                    <span>{pedido.direccion}</span>
                  </div>
                </div>

                {/* Productos del pedido */}
                <div className="vendedor-productos">
                  <h4>Productos:</h4>
                  {pedido.productos.map(producto => (
                    <div key={producto.id} className="vendedor-producto-item">
                      <span>{producto.cantidad}x {producto.nombre}</span>
                      <span>${producto.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="vendedor-total">
                    <strong>Total: ${pedido.total.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Comentarios */}
                {pedido.comentarios && (
                  <div className="vendedor-comentarios">
                    <strong>Comentarios:</strong> {pedido.comentarios}
                  </div>
                )}

                {/* Acciones disponibles */}
                <div className="vendedor-pedido-actions">
                  {pedido.estado === 'pendiente' && (
                    <button 
                      className="vendedor-btn vendedor-btn-tomar"
                      onClick={() => tomarPedido(pedido.id)}
                    >
                      <IonIcon icon={bagOutline} />
                      Tomar Pedido
                    </button>
                  )}
                  
                  {pedido.estado === 'asignado' && (
                    <button 
                      className="vendedor-btn vendedor-btn-proceso"
                      onClick={() => cambiarEstadoPedido(pedido.id, 'en-proceso')}
                    >
                      <IonIcon icon={carOutline} />
                      Iniciar Entrega
                    </button>
                  )}
                  
                  {pedido.estado === 'en-proceso' && (
                    <button 
                      className="vendedor-btn vendedor-btn-completar"
                      onClick={() => cambiarEstadoPedido(pedido.id, 'entregado')}
                    >
                      <IonIcon icon={checkmarkCircleOutline} />
                      Marcar Entregado
                    </button>
                  )}

                  {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
                    <button 
                      className="vendedor-btn vendedor-btn-cancelar"
                      onClick={() => {
                        setAlertConfig({
                          isOpen: true,
                          header: 'Cancelar Pedido',
                          message: '¿Estás seguro de cancelar este pedido?',
                          buttons: [
                            { text: 'No', role: 'cancel' },
                            {
                              text: 'Sí, Cancelar',
                              handler: () => cambiarEstadoPedido(pedido.id, 'cancelado')
                            }
                          ]
                        });
                        setShowAlert(true);
                      }}
                    >
                      <IonIcon icon={closeCircleOutline} />
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pedidosFiltrados.length === 0 && (
            <div className="vendedor-empty">
              <IonIcon icon={bagOutline} />
              <h3>No hay pedidos</h3>
              <p>No tienes pedidos {filtroEstado === 'todos' ? 'asignados' : `con estado "${filtroEstado}"`} en este momento.</p>
            </div>
          )}

        </div>

        {/* Toast Messages */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          position="top"
        />

        {/* Alert Dialog */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertConfig.header}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
        />

      </IonContent>
    </IonPage>
  );
};

export default VendedorDashboard;

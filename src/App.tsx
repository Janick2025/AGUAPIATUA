import { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Bienvenida from './pages/Bienvenida';
import Login from './pages/Login';
import FacturaFinal from './pages/FacturaFinal';
import ComprobantePedido from './pages/ComprobantePedido';
import AdminDashboard from './pages/AdminDashboard';
import VendedorRepartidor from './pages/vendedor';
import HistorialPedidos from './pages/HistorialPedidos';
import pushNotificationService from './services/pushNotificationService';

// Componente de ruta protegida mejorado
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedUserTypes?: string[];
  redirectTo?: string;
}> = ({ children, allowedUserTypes = [], redirectTo = '/login' }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const token = localStorage.getItem('aguapiatua_token');
  const userType = localStorage.getItem('userType') || '';

  // Si no hay autenticación básica, redirigir al login
  if (!isAuthenticated || !token) {
    return <Redirect to={redirectTo} />;
  }

  // Si hay restricción de roles y el usuario no está permitido
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    // Redirigir al dashboard correcto según su rol
    let correctRoute = '/login';

    if (userType === 'administrador') {
      correctRoute = '/admin-dashboard';
    } else if (userType === 'vendedor') {
      correctRoute = '/vendedor-dashboard';
    } else if (userType === 'cliente') {
      correctRoute = '/home';
    }

    return <Redirect to={correctRoute} />;
  }

  // Si todo está bien, renderizar los hijos
  return <>{children}</>;
};

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    // Inicializar notificaciones push cuando la app arranca
    const initPush = async () => {
      try {
        await pushNotificationService.initialize();
        console.log('✅ Push notifications inicializadas');
      } catch (error) {
        console.error('❌ Error inicializando push notifications:', error);
      }
    };

    // Solo inicializar si el usuario está autenticado
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      initPush();
    }
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
        <Route exact path="/bienvenida">
          <Bienvenida />
        </Route>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/home">
          <ProtectedRoute allowedUserTypes={['cliente']}>
            <Home />
          </ProtectedRoute>
        </Route>
        <Route exact path="/historial-pedidos">
          <ProtectedRoute allowedUserTypes={['cliente']}>
            <HistorialPedidos />
          </ProtectedRoute>
        </Route>
        <Route exact path="/admin-dashboard">
          <ProtectedRoute allowedUserTypes={['administrador']}>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route exact path="/vendedor-dashboard">
          <ProtectedRoute allowedUserTypes={['vendedor']}>
            <VendedorRepartidor />
          </ProtectedRoute>
        </Route>
        <Route exact path="/factura-final" render={({ location, history }) => {
          // Extraer datos del pedido desde location.state
          const state = location.state as any || {};
          return (
            <FacturaFinal
              address={state.address || ''}
              payment={state.payment || ''}
              cart={state.cart || []}
              totalPrice={state.totalPrice || 0}
              onBack={() => history.goBack()}
            />
          );
        }} />
        <Route exact path="/comprobante-pedido" render={({ location, history }) => {
          const state = location.state as any || {};
          return (
            <ComprobantePedido
              address={state.address || ''}
              payment={state.payment || ''}
              cart={state.cart || []}
              totalPrice={state.totalPrice || 0}
              onBack={() => history.push('/home')}
            />
          );
        }} />
        <Route exact path="/">
          <Redirect to="/bienvenida" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
  );
};

export default App;

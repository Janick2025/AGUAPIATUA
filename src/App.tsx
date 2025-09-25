import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Bienvenida from './pages/Bienvenida';
import Login from './pages/Login';
import FacturaFinal from './pages/FacturaFinal';
import ComprobantePedido from './pages/ComprobantePedido';
import AdminDashboard from './pages/AdminDashboard';
// Componente de ruta protegida
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedUserTypes?: string[];
  redirectTo?: string;
}> = ({ children, allowedUserTypes = [], redirectTo = '/login' }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userType = localStorage.getItem('userType') || '';
  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    if (userType === 'administrador') {
      return <Redirect to="/admin-dashboard" />;
    } else if (userType === 'vendedor') {
      return <Redirect to="/vendedor-dashboard" />;
    } else {
      return <Redirect to="/home" />;
    }
  }
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

const App: React.FC = () => (
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
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        </Route>
        <Route exact path="/admin-dashboard">
          <ProtectedRoute allowedUserTypes={['administrador']}>
            <AdminDashboard />
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

export default App;

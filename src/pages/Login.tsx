import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonInput, IonButton, IonIcon, IonToast
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
  personOutline, 
  lockClosedOutline, 
  personCircleOutline, 
  briefcaseOutline, 
  storefront,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';
import './Login.css';

// Definición de tipos de usuario con sus rutas correspondientes
const USER_TYPES = [
  { 
    value: 'cliente', 
    label: 'Cliente', 
    icon: '👤',
    route: '/home',
    description: 'Comprar productos'
  },
  { 
    value: 'administrador', 
    label: 'Admin', 
    icon: '⚙️',
    route: '/admin-dashboard', // Ruta futura para administradores
    description: 'Gestionar sistema'
  },
  { 
    value: 'vendedor', 
    label: 'Vendedor', 
    icon: '🛍️',
    route: '/vendedor-dashboard', // Ruta futura para vendedores
    description: 'Gestionar ventas'
  }
];

// Credenciales de demo (en producción esto vendría de una API)
const DEMO_CREDENTIALS = {
  cliente: { username: 'cliente', password: '123' },
  administrador: { username: 'admin', password: 'admin123' },
  vendedor: { username: 'vendedor', password: 'vend123' }
};

export default function Login() {
  const history = useHistory();
  
  // Estados del formulario
  const [userType, setUserType] = useState('cliente');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para mensajes
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');
  
  // Estados para efectos visuales
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Animación de entrada
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Generar burbujas dinámicamente
  const generateBubbles = () => {
    return Array.from({ length: 3 }, (_, index) => (
      <div key={`login-bubble-${index}`} className="login-bubble"></div>
    ));
  };

  // Generar partículas brillantes
  const generateSparkles = () => {
    return Array.from({ length: 3 }, (_, index) => (
      <div key={`login-sparkle-${index}`} className="login-sparkle"></div>
    ));
  };

  // Función para mostrar mensajes
  const showMessage = (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  // Función de validación
  const validateForm = () => {
    if (!username.trim()) {
      showMessage('Por favor ingresa tu usuario', 'warning');
      return false;
    }
    if (!password.trim()) {
      showMessage('Por favor ingresa tu contraseña', 'warning');
      return false;
    }
    return true;
  };

  // Función de autenticación
  const authenticateUser = () => {
    const credentials = DEMO_CREDENTIALS[userType as keyof typeof DEMO_CREDENTIALS];
    
    if (username === credentials.username && password === credentials.password) {
      return true;
    }
    return false;
  };

  // Función de login principal
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (authenticateUser()) {
      // Guardar datos de sesión
      localStorage.setItem('userType', userType);
      localStorage.setItem('username', username);
      localStorage.setItem('isAuthenticated', 'true');
      
      showMessage(`¡Bienvenido ${userType}!`, 'success');
      
      // Navegar según el tipo de usuario
      const selectedUserType = USER_TYPES.find(type => type.value === userType);
      const targetRoute = selectedUserType?.route || '/home';
      
      setTimeout(() => {
        if (userType === 'administrador') {
          history.push('/admin-dashboard');
        } else if (userType === 'vendedor') {
          history.push('/vendedor-dashboard');
        } else {
          history.push('/home');
        }
      }, 1000);
      
    } else {
      showMessage('Credenciales incorrectas', 'danger');
    }
    
    setIsLoading(false);
  };

  // Auto-rellenar credenciales para demo
  const autoFillCredentials = (selectedUserType: string) => {
    const credentials = DEMO_CREDENTIALS[selectedUserType as keyof typeof DEMO_CREDENTIALS];
    setUsername(credentials.username);
    setPassword(credentials.password);
    showMessage(`Credenciales auto-rellenadas para ${selectedUserType}`, 'success');
  };

  return (
    <IonPage>
      <IonHeader>
        
      </IonHeader>

      <IonContent className="login-bg" fullscreen>
        {/* Efectos visuales de fondo */}
        {generateBubbles()}
        {generateSparkles()}

        <div className="login-container" style={{ opacity: showContent ? 1 : 0, transition: 'opacity 0.8s ease' }}>
          <div className="login-card">
            {/* Header con logo */}
            <div className="login-header">
              <div className="login-logo">💧</div>
              <h1 className="login-title">Agua Piatua</h1>
              <p className="login-subtitle">Accede a tu cuenta</p>
            </div>

            {/* Selector de tipo de usuario */}
            <div className="user-type-selector">
              <label className="user-type-label">Tipo de Usuario</label>
              <div className="user-type-grid">
                {USER_TYPES.map(type => (
                  <div
                    key={type.value}
                    className={`user-type-option ${userType === type.value ? 'selected' : ''}`}
                    onClick={() => setUserType(type.value)}
                  >
                    <span className="user-type-icon">{type.icon}</span>
                    <span className="user-type-text">{type.label}</span>
                  </div>
                ))}
              </div>
              
              {/* Botón para auto-rellenar credenciales de demo */}
              <IonButton 
                fill="clear" 
                size="small" 
                onClick={() => autoFillCredentials(userType)}
                style={{ 
                  marginTop: '8px', 
                  fontSize: '0.8rem',
                  '--color': '#64748B'
                }}
              >
                🎯 Auto-rellenar para demo
              </IonButton>
            </div>

            {/* Campo de usuario */}
            <div className="input-group">
              <IonInput
                label="Usuario"
                labelPlacement="floating"
                fill="outline"
                value={username}
                onIonChange={e => setUsername(e.detail.value!)}
                placeholder={`Ingresa tu usuario de ${userType}`}
                clearInput={true}
              />
              <IonIcon icon={personOutline} className="input-icon" />
            </div>

            {/* Campo de contraseña */}
            <div className="input-group">
              <IonInput
                label="Contraseña"
                labelPlacement="floating"
                fill="outline"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onIonChange={e => setPassword(e.detail.value!)}
                placeholder="Ingresa tu contraseña"
                clearInput={true}
              />
              <IonIcon 
                icon={showPassword ? eyeOffOutline : eyeOutline} 
                className="input-icon"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer' }}
              />
            </div>

            {/* Información de credenciales de demo */}
            <div style={{ 
              background: 'rgba(56,189,248,0.1)', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              fontSize: '0.85rem',
              color: '#0EA5E9',
              textAlign: 'center'
            }}>
              <strong>Credenciales de Demo:</strong><br/>
              Cliente: cliente/123<br/>
              Admin: admin/admin123<br/>
              Vendedor: vendedor/vend123
            </div>

            {/* Botón de login */}
            <IonButton
              expand="block"
              className="login-button"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    border: '2px solid #ffffff', 
                    borderTop: '2px solid transparent', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <IonIcon icon={lockClosedOutline} slot="start" />
                  ENTRAR COMO {userType.toUpperCase()}
                </>
              )}
            </IonButton>

            {/* Footer */}
            <div className="login-footer">
              <a href="#" className="forgot-password" onClick={(e) => {
                e.preventDefault();
                showMessage('Funcionalidad en desarrollo', 'warning');
              }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
        </div>

        {/* Toast para mensajes */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          position="top"
          buttons={[
            {
              text: 'OK',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </IonPage>
  );
}
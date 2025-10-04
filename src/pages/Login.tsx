import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonInput, IonButton, IonIcon, IonToast
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { 
  personOutline, 
  lockClosedOutline, 
  personCircleOutline, 
  briefcaseOutline, 
  storefront,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';
import ApiService from '../services/apiService';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { isPlatform } from '@ionic/react';
import './Login.css';

// Definición de tipos de usuario con sus rutas correspondientes
const USER_TYPES = [
  {
    value: 'Cliente',
    label: 'Cliente',
    icon: '👤',
    route: '/home',
    description: 'Comprar productos'
  },
  {
    value: 'Admin',
    label: 'Admin',
    icon: '⚙️',
    route: '/admin-dashboard',
    description: 'Gestionar sistema'
  },
  {
    value: 'Vendedor',
    label: 'Vendedor',
    icon: '🛍️',
    route: '/vendedor-dashboard',
    description: 'Gestionar ventas'
  }
];

export default function Login() {
  const history = useHistory();
  const location = useLocation();

  // Estados del formulario
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [userType, setUserType] = useState('Cliente');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
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

    // Verificar si viene del callback de Google
    const params = new URLSearchParams(location.search);
    const googleToken = params.get('google_token');
    const userData = params.get('user');

    if (googleToken && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem('aguapiatua_token', googleToken);
        localStorage.setItem('aguapiatua_user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');

        // Normalizar tipo de usuario
        let normalizedUserType = 'cliente';
        if (user.tipo_usuario === 'Admin') {
          normalizedUserType = 'administrador';
        } else if (user.tipo_usuario === 'Vendedor') {
          normalizedUserType = 'vendedor';
        }
        localStorage.setItem('userType', normalizedUserType);

        showMessage(`¡Bienvenido ${user.nombre}!`, 'success');

        setTimeout(() => {
          if (user.tipo_usuario === 'Admin') {
            history.push('/admin-dashboard');
          } else if (user.tipo_usuario === 'Vendedor') {
            history.push('/vendedor-dashboard');
          } else {
            history.push('/home');
          }
        }, 1000);
      } catch (error) {
        console.error('Error procesando login de Google:', error);
        showMessage('Error al procesar login de Google', 'danger');
      }
    }

    return () => clearTimeout(timer);
  }, [location, history]);

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
    if (!email.trim()) {
      showMessage('Por favor ingresa tu email', 'warning');
      return false;
    }
    if (!email.includes('@')) {
      showMessage('Por favor ingresa un email válido', 'warning');
      return false;
    }
    if (!password.trim()) {
      showMessage('Por favor ingresa tu contraseña', 'warning');
      return false;
    }
    return true;
  };

  // Función de login principal usando API
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Llamar a la API para autenticar
      const response = await ApiService.login(email, password);
      
      // Guardar datos de sesión
      localStorage.setItem('aguapiatua_user', JSON.stringify(response.user));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', response.user.id.toString());
      localStorage.setItem('username', response.user.nombre);

      // Normalizar y guardar tipo de usuario
      let normalizedUserType = 'cliente';
      if (response.user.tipo_usuario === 'Admin') {
        normalizedUserType = 'administrador';
      } else if (response.user.tipo_usuario === 'Vendedor') {
        normalizedUserType = 'vendedor';
      }
      localStorage.setItem('userType', normalizedUserType);

      showMessage(`¡Bienvenido ${response.user.nombre}!`, 'success');

      // Navegar según el tipo de usuario
      setTimeout(() => {
        if (response.user.tipo_usuario === 'Admin') {
          history.push('/admin-dashboard');
        } else if (response.user.tipo_usuario === 'Vendedor') {
          history.push('/vendedor-dashboard');
        } else {
          history.push('/home');
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('Error en login:', error);
      showMessage(error.message || 'Error al iniciar sesión', 'danger');
    }
    
    setIsLoading(false);
  };

  // Registro de nuevo usuario
  const handleRegister = async () => {
    if (!nombre.trim()) {
      showMessage('Por favor ingresa tu nombre', 'warning');
      return;
    }
    if (!email.trim()) {
      showMessage('Por favor ingresa tu email', 'warning');
      return;
    }
    if (!password.trim()) {
      showMessage('Por favor ingresa tu contraseña', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showMessage('Las contraseñas no coinciden', 'warning');
      return;
    }
    if (password.length < 6) {
      showMessage('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      const response = await ApiService.register({
        nombre: nombre,
        email: email,
        password: password,
        tipo_usuario: userType as 'Cliente' | 'Vendedor' | 'Admin'
      });

      // Guardar datos de sesión
      localStorage.setItem('aguapiatua_user', JSON.stringify(response.user));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', response.user.id.toString());
      localStorage.setItem('username', response.user.nombre);

      // Normalizar y guardar tipo de usuario
      let normalizedUserType = 'cliente';
      if (response.user.tipo_usuario === 'Admin') {
        normalizedUserType = 'administrador';
      } else if (response.user.tipo_usuario === 'Vendedor') {
        normalizedUserType = 'vendedor';
      }
      localStorage.setItem('userType', normalizedUserType);

      showMessage(`¡Registro exitoso! Bienvenido ${response.user.nombre}!`, 'success');

      // Navegar según el tipo de usuario
      setTimeout(() => {
        if (response.user.tipo_usuario === 'Admin') {
          history.push('/admin-dashboard');
        } else if (response.user.tipo_usuario === 'Vendedor') {
          history.push('/vendedor-dashboard');
        } else {
          history.push('/home');
        }
      }, 1000);

    } catch (error: any) {
      console.error('Error en registro:', error);
      showMessage(error.message || 'Error al registrarse', 'danger');
    }

    setIsLoading(false);
  };

  // Login con Google
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Verificar si es móvil nativo o web
      if (isPlatform('capacitor')) {
        // Login nativo para móvil
        const result = await GoogleAuth.signIn();

        // Enviar al backend para crear/buscar usuario
        const response = await fetch('https://aca5eb15b5ac.ngrok-free.app/api/auth/google/mobile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: result.email,
            nombre: result.name,
            googleId: result.id
          })
        });

        const data = await response.json();

        if (data.token && data.user) {
          localStorage.setItem('aguapiatua_token', data.token);
          localStorage.setItem('aguapiatua_user', JSON.stringify(data.user));
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userId', data.user.id.toString());
          localStorage.setItem('username', data.user.nombre);

          let normalizedUserType = 'cliente';
          if (data.user.tipo_usuario === 'Admin') {
            normalizedUserType = 'administrador';
          } else if (data.user.tipo_usuario === 'Vendedor') {
            normalizedUserType = 'vendedor';
          }
          localStorage.setItem('userType', normalizedUserType);

          showMessage(`¡Bienvenido ${data.user.nombre}!`, 'success');

          setTimeout(() => {
            if (data.user.tipo_usuario === 'Admin') {
              history.push('/admin-dashboard');
            } else if (data.user.tipo_usuario === 'Vendedor') {
              history.push('/vendedor-dashboard');
            } else {
              history.push('/home');
            }
          }, 1000);
        }
      } else {
        // Login web (OAuth redirect)
        window.location.href = 'https://aca5eb15b5ac.ngrok-free.app/api/auth/google';
      }
    } catch (error: any) {
      console.error('Error en login de Google:', error);
      showMessage('Error al iniciar sesión con Google', 'danger');
    } finally {
      setIsLoading(false);
    }
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
            </div>

            {/* Campo de nombre (solo en registro) */}
            {isRegisterMode && (
              <div className="input-group">
                <IonInput
                  label="Nombre completo"
                  labelPlacement="floating"
                  fill="outline"
                  type="text"
                  value={nombre}
                  onIonChange={e => setNombre(e.detail.value!)}
                  placeholder="Ingresa tu nombre completo"
                  clearInput={true}
                />
                <IonIcon icon={personCircleOutline} className="input-icon" />
              </div>
            )}

            {/* Campo de email */}
            <div className="input-group">
              <IonInput
                label="Email"
                labelPlacement="floating"
                fill="outline"
                type="email"
                value={email}
                onIonChange={e => setEmail(e.detail.value!)}
                placeholder={`Ingresa tu email de ${userType}`}
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

            {/* Campo de confirmación de contraseña (solo en registro) */}
            {isRegisterMode && (
              <div className="input-group">
                <IonInput
                  label="Confirmar contraseña"
                  labelPlacement="floating"
                  fill="outline"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onIonChange={e => setConfirmPassword(e.detail.value!)}
                  placeholder="Confirma tu contraseña"
                  clearInput={true}
                />
                <IonIcon icon={lockClosedOutline} className="input-icon" />
              </div>
            )}

            {/* Botón de login o registro */}
            <IonButton
              expand="block"
              className="login-button"
              onClick={isRegisterMode ? handleRegister : handleLogin}
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
                  {isRegisterMode ? 'Registrando...' : 'Iniciando sesión...'}
                </>
              ) : (
                <>
                  <IonIcon icon={lockClosedOutline} slot="start" />
                  {isRegisterMode ? `REGISTRARSE COMO ${userType.toUpperCase()}` : `ENTRAR COMO ${userType.toUpperCase()}`}
                </>
              )}
            </IonButton>

            {/* Botón para cambiar entre login y registro */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setNombre('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38BDF8',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  textDecoration: 'underline'
                }}
              >
                {isRegisterMode ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>

            {/* Divisor */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '20px 0',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
              <span style={{ padding: '0 16px', fontSize: '0.9rem' }}>O continúa con</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
            </div>

            {/* Botón de Google */}
            <IonButton
              expand="block"
              fill="outline"
              onClick={handleGoogleLogin}
              style={{
                '--border-color': 'rgba(255, 255, 255, 0.3)',
                '--color': '#4285F4',
                height: '50px',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                style={{
                  width: '20px',
                  height: '20px',
                  marginRight: '12px'
                }}
              />
              Iniciar sesión con Google
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
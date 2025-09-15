import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonInput, IonButton, IonSegment, IonSegmentButton, IonLabel,
  IonText, useIonToast, IonIcon, IonLoading, IonCheckbox
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

const USER_TYPES = [
  { value: 'cliente',        label: 'Cliente' },
  { value: 'administrador',  label: 'Administrador' },
  { value: 'vendedor',       label: 'Vendedor' }
];

export default function Login() {
  const history = useHistory();
  const [present] = useIonToast();

  // Estado
  const [userType, setUserType] = useState<'cliente'|'administrador'|'vendedor'>('cliente');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  // Restaura preferencia guardada
  useEffect(() => {
    const raw = localStorage.getItem('login_prefs');
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      if (p.userType) setUserType(p.userType);
      if (p.username) setUsername(p.username);
      setRemember(true);
    } catch {}
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!username.trim()) e.username = 'Ingresa tu usuario';
    if (!password) e.password = 'Ingresa tu contraseña';
    else if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canSubmit = username.trim().length > 0 && password.length >= 6 && !isLoading;

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      present({ message: 'Revisa los campos', color: 'danger', duration: 1400 });
      return;
    }
    setIsLoading(true);

    // Guarda preferencias
    if (remember) {
      localStorage.setItem('login_prefs', JSON.stringify({ userType, username }));
    } else {
      localStorage.removeItem('login_prefs');
    }

    // Simula validación / request
    setTimeout(() => {
      present({ message: `Bienvenido (${userType})`, color: 'success', duration: 900 });
      if (userType === 'administrador') history.push('/administrador');
      else if (userType === 'vendedor')  history.push('/vendedor');
      else                               history.push('/home');
      setIsLoading(false);
    }, 600);
  };

  const onKeyUpCommon = (e: any) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(!!e.getModifierState('CapsLock'));
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="login-toolbar">
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding login-bg">
        <div className="login-container">
          <IonSegment value={userType} onIonChange={e => setUserType(String(e.detail.value) as any)}>
            {USER_TYPES.map(t => (
              <IonSegmentButton key={t.value} value={t.value}>
                <IonLabel className="mi-label-borde">{t.label}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>

          <form onSubmit={handleSubmit} noValidate>
            {/* Usuario */}
            <IonInput
              label="Usuario"
              labelPlacement="floating"
              fill="outline"
              value={username}
              onIonChange={e => setUsername(e.detail.value ?? '')}
              onKeyUp={onKeyUpCommon}
              className={`custom-login-input login-input-usuario ${errors.username ? 'has-error' : ''}`}
              clearInput
              autocomplete="username"
              enterkeyhint="next"
              aria-invalid={!!errors.username}
              aria-describedby="err-user"
            />
            {errors.username && (
              <IonText id="err-user" color="danger" className="err-text">{errors.username}</IonText>
            )}

            {/* Contraseña + ojo */}
            <div className="pwd-wrap">
              <IonInput
                label="Contraseña"
                labelPlacement="floating"
                fill="outline"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onIonChange={e => setPassword(e.detail.value ?? '')}
                onKeyUp={onKeyUpCommon}
                className={`custom-login-input login-input-password ${errors.password ? 'has-error' : ''}`}
                autocomplete="current-password"
                enterkeyhint="go"
                aria-invalid={!!errors.password}
                aria-describedby="err-pass"
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPwd(v => !v)}
                aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <IonIcon icon={showPwd ? eyeOffOutline : eyeOutline} />
              </button>
            </div>
            {errors.password && (
              <IonText id="err-pass" color="danger" className="err-text">{errors.password}</IonText>
            )}
            {capsLockOn && !showPwd && (
              <IonText color="warning" className="err-text">Bloq Mayús activado</IonText>
            )}

            {/* Recordarme + Recuperar */}
            <div className="login-actions">
              <label className="remember">
                <IonCheckbox
                  checked={remember}
                  onIonChange={e => setRemember(!!e.detail.checked)}
                />
                <span>Recordarme</span>
              </label>
              <IonButton routerLink="/recuperar" fill="clear" size="small">¿Olvidaste tu contraseña?</IonButton>
            </div>

            <IonButton
              type="submit"
              expand="block"
              className="login-btn"
              disabled={!canSubmit}
            >
              {isLoading ? 'Validando…' : 'Entrar'}
            </IonButton>
          </form>
        </div>

        {/* Loader */}
        <IonLoading isOpen={isLoading} message="Un momento…" translucent />
      </IonContent>
    </IonPage>
  );
}

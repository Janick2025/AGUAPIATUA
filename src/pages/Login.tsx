import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonInput, IonButton, IonSegment, IonSegmentButton, IonLabel
} from '@ionic/react';
import { Route, Redirect, useHistory } from 'react-router-dom';


const USER_TYPES = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'administrador', label: 'Administrador' },
  { value: 'vendedor', label: 'Vendedor' }
];

export default function Login() {
  const history = useHistory();
  // Siempre inicia como cliente
  const [userType, setUserType] = useState('cliente');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    history.push('/home');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: 340, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px #e0f2fe', padding: 24 }}>
          <IonSegment value={userType} onIonChange={e => setUserType(String(e.detail.value))}>
            {USER_TYPES.map(t => (
              <IonSegmentButton key={t.value} value={t.value}>
                <IonLabel>{t.label}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
          <IonInput
            label="Usuario"
            labelPlacement="floating"
            fill="outline"
            value={username}
            onIonChange={e => setUsername(e.detail.value!)}
            style={{ marginTop: 24 }}
          />
          <IonInput
            label="Contraseña"
            labelPlacement="floating"
            fill="outline"
            type="password"
            value={password}
            onIonChange={e => setPassword(e.detail.value!)}
            style={{ marginTop: 16 }}
          />
          <IonButton expand="block" style={{ marginTop: 28 }} onClick={() => history.push('/home')}>
            Entrar
          </IonButton>
        </div>
      </IonContent>
      <Route exact path="/">
        <Redirect to="/home" />
      </Route>
    </IonPage>
  );
}

import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const Test: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Test Page - Funciona!</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>¡La aplicación funciona!</h1>
          <p>Si ves esto, React e Ionic están funcionando correctamente.</p>
          <p>Fecha: {new Date().toLocaleDateString()}</p>
          <p>Hora: {new Date().toLocaleTimeString()}</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Test;
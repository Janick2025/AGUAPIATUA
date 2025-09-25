import React from 'react';
import { IonApp, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, setupIonicReact } from '@ionic/react';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

setupIonicReact();

const App: React.FC = () => {
  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Agua Piatua - Diagnóstico</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ 
            padding: '20px', 
            textAlign: 'center',
            backgroundColor: '#f0f8ff',
            minHeight: '100vh'
          }}>
            <h1 style={{ color: '#2563eb', fontSize: '2rem' }}>
              🎉 ¡FUNCIONA CORRECTAMENTE! 🎉
            </h1>
            <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
              Si puedes ver este mensaje, la aplicación está cargando perfectamente.
            </p>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '15px', 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              margin: '20px auto',
              maxWidth: '400px'
            }}>
              <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Hora:</strong> {new Date().toLocaleTimeString()}</p>
              <p><strong>Estado:</strong> ✅ Aplicación funcionando</p>
            </div>
            <button 
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: '20px'
              }}
              onClick={() => window.location.reload()}
            >
              🔄 Recargar Página
            </button>
          </div>
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default App;
  
import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import './Bienvenida.css';
import { useHistory } from 'react-router-dom';

const Bienvenida: React.FC = () => {
  const history = useHistory();
  const [showLoader, setShowLoader] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Simular tiempo de carga inicial
    const loaderTimer = setTimeout(() => {
      setShowLoader(false);
      setShowContent(true);
    }, 2000);

    return () => clearTimeout(loaderTimer);
  }, []);

  const irALogin = () => {
    // Pequeño delay para efecto visual
    setTimeout(() => {
      history.push('/login');
    }, 200);
  };

  // Generar burbujas dinámicamente
  const generateBubbles = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <div key={`bubble-${index}`} className="bubble"></div>
    ));
  };

  // Generar partículas brillantes
  const generateSparkles = () => {
    return Array.from({ length: 8 }, (_, index) => (
      <div key={`sparkle-${index}`} className="sparkle"></div>
    ));

  };

  return (
    <>
      {/* Loader inicial */}
      {showLoader && (
        <div className="initial-loader">
          <div className="loader-logo">
            💧 AGUA PIATUA
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <IonPage style={{ display: showContent ? 'block' : 'none' }}>
        <IonHeader className="bienvenida-header">
          <IonToolbar className="bienvenida-toolbar">
            <IonTitle />
          </IonToolbar>

        </IonHeader>

        <IonContent className="bienvenida-bg" fullscreen>
          {/* Burbujas flotantes */}
          {generateBubbles()}
          
          {/* Partículas brillantes */}
          {generateSparkles()}

          <div className="bienvenida-content">
            <h1 className="bienvenida-titulo">
              ¡Bienvenidos!
            </h1>
            
            <h2 className="bienvenida-subtitulo">
              AGUA PURIFICADA PIATUA
            </h2>
            
            <p className="bienvenida-descripcion">
              Agua de la mejor calidad 💧

            </p>

              <IonButton expand="block" 
              className="bienvenida-boton" 
              routerLink="/login">
               COMENZAR
              </IonButton>

          </div>
        </IonContent>
      </IonPage>

    </>
  );
};



export default Bienvenida;  
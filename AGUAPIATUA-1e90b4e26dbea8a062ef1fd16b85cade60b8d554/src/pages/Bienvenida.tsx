  
import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import './Bienvenida.css';

const Bienvenida: React.FC = () => {
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

  const handleNavigation = () => {
    console.log('¡BOTÓN CLICKEADO!');
    alert('¡Botón funciona! Navegando...');
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
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

          </div>

          {/* Botón COMPLETAMENTE fuera del contenedor problemático */}
          <div style={{
            position: 'fixed',
            bottom: '29%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999999,
            pointerEvents: 'auto'
          }}>
            <button 
              className="animated-button-entrance"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('¡CLICK DETECTADO!');
                handleNavigation();
              }}
              style={{
                padding: '16px 40px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: '#38bdf8',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                minWidth: '200px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                boxShadow: '0 8px 25px rgba(56, 189, 248, 0.4)',
                transition: 'all 0.3s ease',
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: 999999,
                opacity: 0
              }}
              onMouseEnter={(e) => {
                console.log('MOUSE ENTER!');
                e.currentTarget.style.backgroundColor = '#0ea5e9';
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(56, 189, 248, 0.6)';
              }}
              onMouseLeave={(e) => {
                console.log('MOUSE LEAVE!');
                e.currentTarget.style.backgroundColor = '#38bdf8';
                e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(56, 189, 248, 0.4)';
              }}
              onMouseDown={(e) => {
                console.log('MOUSE DOWN DETECTADO!');
                e.stopPropagation();
              }}
            >
              COMENZAR
            </button>
          </div>
        </IonContent>
      </IonPage>

    </>
  );
};



export default Bienvenida;  
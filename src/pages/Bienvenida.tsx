
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import './Bienvenida.css';
import { useHistory } from 'react-router-dom';

const Bienvenida: React.FC = () => {
  const history = useHistory();
  const irALogin = () => history.push('/login');

  return (
    <IonPage>
      <IonHeader className="bienvenida-header">
        <IonToolbar className="bienvenida-toolbar">
          <IonTitle />
        </IonToolbar>
      </IonHeader>

      <IonContent className="bienvenida-bg" fullscreen>
        <div className="bienvenida-content">
          <h1 className="bienvenida-titulo fade-in">¡Bienvenidos!</h1>
          <h2 className="bienvenida-subtitulo fade-in">AGUA PURIFICADA PIATUA</h2>
          <p className="bienvenida-descripcion fade-in">Agua de la mejor calidad</p>

          <IonButton expand="block" className="bienvenida-boton" onClick={irALogin}>
  COMENZAR
</IonButton>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Bienvenida;

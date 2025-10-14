import React, { useEffect } from 'react';
import './Bienvenida.css';
import { useHistory } from 'react-router-dom';

const Bienvenida: React.FC = () => {
  const history = useHistory();

  useEffect(() => {
    // Mostrar "AGUA CAMPOS" por 3 segundos y luego ir al login
    const timer = setTimeout(() => {
      history.push('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [history]);

  return (
    <div className="splash-screen">
      <div className="splash-logo">
        💧 AGUA CAMPOS
      </div>
    </div>
  );
};

export default Bienvenida;
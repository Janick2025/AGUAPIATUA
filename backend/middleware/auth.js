const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware para verificar autenticación
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario existe y está activo
    const user = await db.getUserById(decoded.id);
    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }

    // Agregar información del usuario a la request
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    console.error('Error en autenticación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Middleware para verificar rol de usuario
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    if (!roles.includes(req.user.tipo_usuario)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }
    
    next();
  };
};

// Middleware para verificar que el usuario accede a sus propios recursos
const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const userId = parseInt(req.params.userId || req.params.id);
  
  // Admin puede acceder a todo, o el usuario debe ser el propietario
  if (req.user.tipo_usuario === 'Admin' || req.user.id === userId) {
    next();
  } else {
    res.status(403).json({ 
      error: 'No tienes permisos para acceder a este recurso' 
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  authorizeOwnerOrAdmin
};
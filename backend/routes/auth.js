const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const db = require('../config/database');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const router = express.Router();

// Configurar Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const nombre = profile.displayName;

      // Buscar si el usuario ya existe
      let user = await db.getUserByEmail(email);

      if (!user) {
        // Crear nuevo usuario
        const userId = await db.createUser({
          nombre,
          email,
          password: await bcrypt.hash(Math.random().toString(36), 10), // Password random
          tipo_usuario: 'Cliente',
          telefono: null,
          direccion: null
        });
        user = await db.getUserById(userId);
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Esquemas de validación
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  tipo_usuario: Joi.string().valid('Cliente', 'Vendedor', 'Admin').required(),
  telefono: Joi.string().optional(),
  direccion: Joi.string().optional()
});

// Función para generar JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      tipo_usuario: user.tipo_usuario 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    // Validar entrada
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Buscar usuario
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.activo) {
      return res.status(401).json({ error: 'Usuario desactivado' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken(user);

    // Responder sin la contraseña
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    // Validar entrada
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nombre, email, password, tipo_usuario, telefono, direccion } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hashear contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const userId = await db.createUser({
      nombre,
      email,
      password: hashedPassword,
      tipo_usuario,
      telefono,
      direccion
    });

    // Obtener usuario creado
    const newUser = await db.getUserById(userId);
    
    // Generar token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: newUser
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/verify-token
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener información actualizada del usuario
    const user = await db.getUserById(decoded.id);
    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }

    res.json({ 
      valid: true, 
      user,
      decoded 
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    console.error('Error verificando token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/google - Iniciar autenticación con Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

// GET /api/auth/google/callback - Callback de Google
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: process.env.FRONTEND_URL + '/login' }),
  (req, res) => {
    try {
      // Generar token JWT
      const token = generateToken(req.user);

      // Redirigir al frontend con el token
      res.redirect(`${process.env.FRONTEND_URL}/login?google_token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    } catch (error) {
      console.error('Error en callback de Google:', error);
      res.redirect(process.env.FRONTEND_URL + '/login?error=google_auth_failed');
    }
  }
);

// POST /api/auth/google/mobile - Login de Google desde móvil
router.post('/google/mobile', async (req, res) => {
  try {
    const { email, nombre, googleId } = req.body;

    if (!email || !nombre) {
      return res.status(400).json({ error: 'Email y nombre son requeridos' });
    }

    // Buscar si el usuario ya existe
    let user = await db.getUserByEmail(email);

    if (!user) {
      // Crear nuevo usuario
      const userId = await db.createUser({
        nombre,
        email,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Password random
        tipo_usuario: 'Cliente',
        telefono: null,
        direccion: null
      });
      user = await db.getUserById(userId);
    }

    // Generar token
    const token = generateToken(user);

    // Responder sin la contraseña
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en login móvil de Google:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
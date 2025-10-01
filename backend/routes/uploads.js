const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/comprobantes');

    // Crear el directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp-usuarioId-nombreOriginal
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `comprobante-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  // Aceptar solo imágenes
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, GIF, WEBP)'), false);
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  }
});

// Endpoint para subir comprobante de pago
router.post('/comprobante', authenticate, upload.single('comprobante'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const { orderId } = req.body;

    if (!orderId) {
      // Si no hay orderId, solo retornar la información del archivo
      return res.json({
        message: 'Archivo subido exitosamente',
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          path: `/uploads/comprobantes/${req.file.filename}`,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    }

    // Si hay orderId, actualizar el pedido con la ruta del comprobante
    const updateQuery = `
      UPDATE orders
      SET comprobante_pago = ?
      WHERE id = ?
    `;

    const comprobantePath = `/uploads/comprobantes/${req.file.filename}`;
    await db.query(updateQuery, [comprobantePath, orderId]);

    res.json({
      message: 'Comprobante subido y asociado al pedido exitosamente',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: comprobantePath,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      orderId: orderId
    });

  } catch (error) {
    console.error('Error al subir comprobante:', error);

    // Eliminar el archivo si hubo error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'Error al subir el comprobante',
      details: error.message
    });
  }
});

// Endpoint para obtener un comprobante (servir el archivo)
router.get('/comprobante/:filename', authenticate, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/comprobantes', filename);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Enviar el archivo
    res.sendFile(filePath);

  } catch (error) {
    console.error('Error al obtener comprobante:', error);
    res.status(500).json({
      error: 'Error al obtener el comprobante',
      details: error.message
    });
  }
});

// Endpoint para eliminar un comprobante
router.delete('/comprobante/:filename', authenticate, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/comprobantes', filename);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Eliminar el archivo
    fs.unlinkSync(filePath);

    // Actualizar la base de datos para remover la referencia
    const updateQuery = `
      UPDATE orders
      SET comprobante_pago = NULL
      WHERE comprobante_pago LIKE ?
    `;

    await db.query(updateQuery, [`%${filename}%`]);

    res.json({ message: 'Comprobante eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar comprobante:', error);
    res.status(500).json({
      error: 'Error al eliminar el comprobante',
      details: error.message
    });
  }
});

module.exports = router;

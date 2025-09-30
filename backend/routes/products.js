const express = require('express');
const Joi = require('joi');
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Esquema de validación para productos
const productSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  descripcion: Joi.string().optional(),
  precio: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  imagen: Joi.string().optional(),
  categoria: Joi.string().optional()
});

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await db.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    const product = await db.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/products - Crear nuevo producto (Solo Admin)
router.post('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nombre, descripcion, precio, stock, imagen, categoria } = req.body;

    const sql = 'INSERT INTO products (nombre, descripcion, precio, stock, imagen, categoria) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await db.query(sql, [nombre, descripcion, precio, stock, imagen, categoria]);

    const newProduct = await db.getProductById(result.insertId);
    
    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: newProduct
    });

  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/products/:id - Actualizar producto (Solo Admin)
router.put('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nombre, descripcion, precio, stock, imagen, categoria } = req.body;

    // Verificar que el producto existe
    const existingProduct = await db.getProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const sql = 'UPDATE products SET nombre = ?, descripcion = ?, precio = ?, stock = ?, imagen = ?, categoria = ? WHERE id = ?';
    await db.query(sql, [nombre, descripcion, precio, stock, imagen, categoria, productId]);

    const updatedProduct = await db.getProductById(productId);
    
    res.json({
      message: 'Producto actualizado exitosamente',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/products/:id/stock - Actualizar solo stock (Admin y Vendedor)
router.patch('/:id/stock', authenticate, authorize('Admin', 'Vendedor'), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { stock } = req.body;

    if (isNaN(productId) || typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    // Verificar que el producto existe
    const existingProduct = await db.getProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await db.updateProductStock(productId, stock);

    // Registrar movimiento de inventario
    const movementSql = 'INSERT INTO inventory_movements (product_id, tipo_movimiento, cantidad, usuario_id, motivo) VALUES (?, ?, ?, ?, ?)';
    const difference = stock - existingProduct.stock;
    const tipoMovimiento = difference > 0 ? 'Entrada' : difference < 0 ? 'Salida' : 'Ajuste';
    
    await db.query(movementSql, [
      productId, 
      tipoMovimiento, 
      Math.abs(difference), 
      req.user.id, 
      'Ajuste manual de stock'
    ]);

    const updatedProduct = await db.getProductById(productId);
    
    res.json({
      message: 'Stock actualizado exitosamente',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error actualizando stock:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/products/:id - Desactivar producto (Solo Admin)
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    // Verificar que el producto existe
    const existingProduct = await db.getProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Desactivar en lugar de eliminar (soft delete)
    const sql = 'UPDATE products SET activo = 0 WHERE id = ?';
    await db.query(sql, [productId]);

    res.json({ message: 'Producto desactivado exitosamente' });

  } catch (error) {
    console.error('Error desactivando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
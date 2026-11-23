const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cartItems = await db.cart.find({ userId: req.user.id });
    const productIds = cartItems.map(i => i.productId);
    const products = await db.products.find({ _id: { $in: productIds } });
    const productMap = {};
    products.forEach(p => productMap[p._id] = p);

    const items = cartItems
      .filter(i => productMap[i.productId])
      .map(i => {
        const p = productMap[i.productId];
        return {
          id: i._id,
          product_id: p._id,
          name: p.name,
          price: p.price,
          image_url: p.image_url,
          stock: p.stock,
          quantity: i.quantity,
          subtotal: i.quantity * p.price
        };
      });

    const total = items.reduce((sum, i) => sum + i.subtotal, 0);
    res.json({ items, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cart - add item
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id is required' });

    const product = await db.products.findOne({ _id: product_id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Not enough stock' });

    const existing = await db.cart.findOne({ userId: req.user.id, productId: product_id });
    if (existing) {
      await db.cart.update({ _id: existing._id }, { $set: { quantity: existing.quantity + quantity } });
    } else {
      await db.cart.insert({ userId: req.user.id, productId: product_id, quantity });
    }

    res.json({ message: 'Added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/cart/:id - update quantity
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Quantity must be at least 1' });

    const item = await db.cart.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ error: 'Cart item not found' });

    await db.cart.update({ _id: req.params.id }, { $set: { quantity } });
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cart/:id - remove item
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.cart.remove({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cart - clear cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await db.cart.remove({ userId: req.user.id }, { multi: true });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

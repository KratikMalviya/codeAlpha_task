const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/orders - place order from cart
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { shipping_address } = req.body;
    if (!shipping_address) return res.status(400).json({ error: 'Shipping address is required' });

    const cartItems = await db.cart.find({ userId: req.user.id });
    if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

    const productIds = cartItems.map(i => i.productId);
    const products = await db.products.find({ _id: { $in: productIds } });
    const productMap = {};
    products.forEach(p => productMap[p._id] = p);

    // Check stock
    for (const item of cartItems) {
      const p = productMap[item.productId];
      if (!p || p.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${p ? p.name : 'a product'}` });
      }
    }

    const total = cartItems.reduce((sum, i) => sum + productMap[i.productId].price * i.quantity, 0);

    // Create order
    const order = await db.orders.insert({
      userId: req.user.id,
      total_amount: total,
      shipping_address,
      status: 'pending',
      created_at: new Date()
    });

    // Create order items & reduce stock
    const orderItemsData = cartItems.map(i => ({
      orderId: order._id,
      productId: i.productId,
      quantity: i.quantity,
      price: productMap[i.productId].price
    }));
    await db.orderItems.insert(orderItemsData);

    // Reduce stock
    for (const item of cartItems) {
      const p = productMap[item.productId];
      await db.products.update({ _id: item.productId }, { $set: { stock: p.stock - item.quantity } });
    }

    // Clear cart
    await db.cart.remove({ userId: req.user.id }, { multi: true });

    res.status(201).json({ message: 'Order placed successfully', order_id: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders - get user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await db.orders.find({ userId: req.user.id });
    // Get item counts
    const enriched = await Promise.all(orders.map(async o => {
      const count = await db.orderItems.count({ orderId: o._id });
      return { ...o, id: o._id, item_count: count };
    }));
    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders/:id - single order with items
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await db.orders.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = await db.orderItems.find({ orderId: order._id });
    const productIds = items.map(i => i.productId);
    const products = await db.products.find({ _id: { $in: productIds } });
    const productMap = {};
    products.forEach(p => productMap[p._id] = p);

    const enrichedItems = items.map(i => ({
      ...i,
      name: productMap[i.productId]?.name || 'Unknown',
      image_url: productMap[i.productId]?.image_url || ''
    }));

    res.json({ ...order, id: order._id, items: enrichedItems });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

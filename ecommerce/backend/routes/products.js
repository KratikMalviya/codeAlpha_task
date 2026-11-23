const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/products - list all with optional search & category filter
router.get('/', async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = {};

    if (category && category !== 'All') query.category = category;

    let products = await db.products.find(query);

    // Filter by search
    if (search) {
      const s = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s))
      );
    }

    // Sort
    if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
    else products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Map _id to id for frontend compatibility
    res.json(products.map(p => ({ ...p, id: p._id })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const products = await db.products.find({});
    const categories = [...new Set(products.map(p => p.category))].sort();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await db.products.findOne({ _id: req.params.id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ ...product, id: product._id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

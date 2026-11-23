const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../database/db');
const { JWT_SECRET } = require('../middleware/auth');

const sign = (user) => jwt.sign(
  { id: user._id, name: user.name, username: user.username },
  JWT_SECRET, { expiresIn: '7d' }
);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
      return res.status(400).json({ error: 'Username: 3-20 chars, letters/numbers/underscore only' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await db.users.insert({
      name, username: username.toLowerCase(), email: email.toLowerCase(),
      password: hashed, bio: '', createdAt: new Date()
    });

    res.status(201).json({ token: sign(user), user: safe(user) });
  } catch (e) {
    if (e.errorType === 'uniqueViolated')
      return res.status(409).json({ error: 'Email or username already taken' });
    console.error(e); res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;          // login = email OR username
    if (!login || !password)
      return res.status(400).json({ error: 'Login and password required' });

    const q = login.includes('@')
      ? { email: login.toLowerCase() }
      : { username: login.toLowerCase() };
    const user = await db.users.findOne(q);

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: sign(user), user: safe(user) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

const safe = (u) => ({
  id: u._id, name: u.name, username: u.username,
  email: u.email, bio: u.bio, createdAt: u.createdAt
});

module.exports = router;

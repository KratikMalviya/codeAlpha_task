const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db     = require('../database/db');
const { auth } = require('../middleware/auth');

const safe = (u, extra = {}) => ({
  id: u._id, name: u.name, username: u.username,
  bio: u.bio || '', createdAt: u.createdAt, ...extra
});

// GET /api/users/search?q=
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase().trim();
    if (!q) return res.json([]);
    const users = await db.users.find({});
    const results = users
      .filter(u => u.username.includes(q) || u.name.toLowerCase().includes(q))
      .slice(0, 10)
      .map(u => safe(u));
    res.json(results);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/users/me  — own full profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await db.users.findOne({ _id: req.user.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const [followers, following, posts] = await Promise.all([
      db.follows.count({ followingId: user._id }),
      db.follows.count({ followerId:  user._id }),
      db.posts.count({ userId: user._id }),
    ]);
    res.json(safe(user, { followers, following, posts }));
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/users/profile — edit own profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim().slice(0, 200);
    await db.users.update({ _id: req.user.id }, { $set: updates });
    const user = await db.users.findOne({ _id: req.user.id });
    res.json(safe(user));
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/users/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await db.users.findOne({ _id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const [followers, following, posts, isFollowing] = await Promise.all([
      db.follows.count({ followingId: user._id }),
      db.follows.count({ followerId:  user._id }),
      db.posts.count({ userId: user._id }),
      db.follows.findOne({ followerId: req.user.id, followingId: user._id }),
    ]);
    res.json(safe(user, { followers, following, posts, isFollowing: !!isFollowing }));
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/users/:id/follow
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ error: "Can't follow yourself" });
    const target = await db.users.findOne({ _id: req.params.id });
    if (!target) return res.status(404).json({ error: 'User not found' });
    const existing = await db.follows.findOne({ followerId: req.user.id, followingId: req.params.id });
    if (existing) return res.status(409).json({ error: 'Already following' });
    await db.follows.insert({ followerId: req.user.id, followingId: req.params.id, createdAt: new Date() });
    res.json({ message: 'Followed' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/users/:id/follow
router.delete('/:id/follow', auth, async (req, res) => {
  try {
    await db.follows.remove({ followerId: req.user.id, followingId: req.params.id });
    res.json({ message: 'Unfollowed' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/users/:id/followers
router.get('/:id/followers', auth, async (req, res) => {
  try {
    const follows = await db.follows.find({ followingId: req.params.id });
    const ids = follows.map(f => f.followerId);
    const users = await db.users.find({ _id: { $in: ids } });
    res.json(users.map(u => safe(u)));
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/users/:id/following
router.get('/:id/following', auth, async (req, res) => {
  try {
    const follows = await db.follows.find({ followerId: req.params.id });
    const ids = follows.map(f => f.followingId);
    const users = await db.users.find({ _id: { $in: ids } });
    res.json(users.map(u => safe(u)));
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;

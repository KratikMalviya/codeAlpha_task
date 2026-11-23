const router = require('express').Router();
const db     = require('../database/db');
const { auth, optionalAuth } = require('../middleware/auth');

// helper: enrich posts with author + like info
async function enrich(posts, viewerId) {
  if (!posts.length) return [];
  const userIds = [...new Set(posts.map(p => p.userId))];
  const authors = await db.users.find({ _id: { $in: userIds } });
  const authorMap = {};
  authors.forEach(a => authorMap[a._id] = { id: a._id, name: a.name, username: a.username });

  // liked by viewer?
  const postIds = posts.map(p => p._id);
  const likedDocs = viewerId
    ? await db.likes.find({ userId: viewerId, postId: { $in: postIds } })
    : [];
  const likedSet = new Set(likedDocs.map(l => l.postId));

  return posts.map(p => ({
    id: p._id, content: p.content, imageUrl: p.imageUrl || null,
    likesCount: p.likesCount || 0, commentsCount: p.commentsCount || 0,
    createdAt: p.createdAt,
    author: authorMap[p.userId] || { id: p.userId, name: 'Unknown', username: '?' },
    likedByMe: likedSet.has(p._id),
  }));
}

// GET /api/posts/feed  — posts from followed users + own
router.get('/feed', auth, async (req, res) => {
  try {
    const follows = await db.follows.find({ followerId: req.user.id });
    const ids = [req.user.id, ...follows.map(f => f.followingId)];
    let posts = await db.posts.find({ userId: { $in: ids } });
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    posts = posts.slice(0, 50);
    res.json(await enrich(posts, req.user.id));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/posts/explore  — newest posts from all users
router.get('/explore', optionalAuth, async (req, res) => {
  try {
    let posts = await db.posts.find({});
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    posts = posts.slice(0, 60);
    res.json(await enrich(posts, req.user?.id));
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/posts/user/:userId  — posts by a user
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    let posts = await db.posts.find({ userId: req.params.userId });
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(await enrich(posts, req.user?.id));
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/posts/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await db.posts.findOne({ _id: req.params.id });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const [enriched] = await enrich([post], req.user?.id);
    res.json(enriched);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/posts  — create
router.post('/', auth, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });
    if (content.length > 500) return res.status(400).json({ error: 'Post too long (max 500 chars)' });
    const post = await db.posts.insert({
      userId: req.user.id, content: content.trim(),
      imageUrl: imageUrl?.trim() || null,
      likesCount: 0, commentsCount: 0, createdAt: new Date()
    });
    const [enriched] = await enrich([post], req.user.id);
    res.status(201).json(enriched);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/posts/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await db.posts.findOne({ _id: req.params.id });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId !== req.user.id) return res.status(403).json({ error: 'Not your post' });
    await Promise.all([
      db.posts.remove({ _id: req.params.id }),
      db.comments.remove({ postId: req.params.id }, { multi: true }),
      db.likes.remove({ postId: req.params.id }, { multi: true }),
    ]);
    res.json({ message: 'Post deleted' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/posts/:id/like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await db.posts.findOne({ _id: req.params.id });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const existing = await db.likes.findOne({ userId: req.user.id, postId: req.params.id });
    if (existing) return res.status(409).json({ error: 'Already liked' });
    await db.likes.insert({ userId: req.user.id, postId: req.params.id });
    const updated = await db.posts.update(
      { _id: req.params.id }, { $inc: { likesCount: 1 } }, { returnUpdatedDocs: true }
    );
    res.json({ likesCount: updated.likesCount });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/posts/:id/like
router.delete('/:id/like', auth, async (req, res) => {
  try {
    const removed = await db.likes.remove({ userId: req.user.id, postId: req.params.id });
    if (!removed) return res.status(404).json({ error: 'Not liked' });
    const updated = await db.posts.update(
      { _id: req.params.id }, { $inc: { likesCount: -1 } }, { returnUpdatedDocs: true }
    );
    res.json({ likesCount: Math.max(0, updated.likesCount || 0) });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;

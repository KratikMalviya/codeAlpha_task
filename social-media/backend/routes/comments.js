const router = require('express').Router();
const db     = require('../database/db');
const { auth } = require('../middleware/auth');

// GET /api/comments/post/:postId
router.get('/post/:postId', auth, async (req, res) => {
  try {
    let comments = await db.comments.find({ postId: req.params.postId });
    comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const userIds = [...new Set(comments.map(c => c.userId))];
    const authors = await db.users.find({ _id: { $in: userIds } });
    const authorMap = {};
    authors.forEach(a => authorMap[a._id] = { id: a._id, name: a.name, username: a.username });
    res.json(comments.map(c => ({
      id: c._id, content: c.content, createdAt: c.createdAt,
      author: authorMap[c.userId] || { name: 'Unknown', username: '?' },
      isOwn: c.userId === req.user.id,
    })));
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/comments/post/:postId
router.post('/post/:postId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });
    if (content.length > 300) return res.status(400).json({ error: 'Comment too long (max 300 chars)' });

    const post = await db.posts.findOne({ _id: req.params.postId });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await db.comments.insert({
      postId: req.params.postId, userId: req.user.id,
      content: content.trim(), createdAt: new Date()
    });
    await db.posts.update({ _id: req.params.postId }, { $inc: { commentsCount: 1 } });

    const author = await db.users.findOne({ _id: req.user.id });
    res.status(201).json({
      id: comment._id, content: comment.content, createdAt: comment.createdAt,
      author: { id: author._id, name: author.name, username: author.username },
      isOwn: true,
    });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/comments/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await db.comments.findOne({ _id: req.params.id });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== req.user.id) return res.status(403).json({ error: 'Not your comment' });
    await db.comments.remove({ _id: req.params.id });
    await db.posts.update({ _id: comment.postId }, { $inc: { commentsCount: -1 } });
    res.json({ message: 'Comment deleted' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// expose db.users for comment route
const db2 = require('../database/db');
module.exports = router;

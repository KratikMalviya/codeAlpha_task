const Datastore = require('nedb-promises');
const path = require('path');

const dbPath = __dirname;

const db = {
  users:    Datastore.create({ filename: path.join(dbPath, 'users.db'),    autoload: true }),
  posts:    Datastore.create({ filename: path.join(dbPath, 'posts.db'),    autoload: true }),
  comments: Datastore.create({ filename: path.join(dbPath, 'comments.db'), autoload: true }),
  likes:    Datastore.create({ filename: path.join(dbPath, 'likes.db'),    autoload: true }),
  follows:  Datastore.create({ filename: path.join(dbPath, 'follows.db'),  autoload: true }),
};

// Ensure unique indexes
db.users.ensureIndex({ fieldName: 'email',    unique: true });
db.users.ensureIndex({ fieldName: 'username', unique: true });
db.likes.ensureIndex({ fieldName: 'userId_postId', unique: false });

module.exports = db;

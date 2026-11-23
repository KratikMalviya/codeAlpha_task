const Datastore = require('nedb-promises');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname);

// Create datastores (persistent JSON files)
const db = {
  users: Datastore.create({ filename: path.join(dbPath, 'users.db'), autoload: true }),
  products: Datastore.create({ filename: path.join(dbPath, 'products.db'), autoload: true }),
  cart: Datastore.create({ filename: path.join(dbPath, 'cart.db'), autoload: true }),
  orders: Datastore.create({ filename: path.join(dbPath, 'orders.db'), autoload: true }),
  orderItems: Datastore.create({ filename: path.join(dbPath, 'orderItems.db'), autoload: true }),
};

// Seed sample products
async function seedProducts() {
  const count = await db.products.count({});
  if (count > 0) return;

  const products = [
    { name: 'Wireless Headphones', description: 'Premium noise-cancelling wireless headphones with 30hr battery life.', price: 2999, stock: 50, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', createdAt: new Date() },
    { name: 'Running Shoes', description: 'Lightweight and breathable shoes perfect for everyday running.', price: 1499, stock: 100, category: 'Sports', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', createdAt: new Date() },
    { name: 'Backpack', description: 'Durable 30L backpack with laptop compartment and water-resistant finish.', price: 999, stock: 75, category: 'Bags', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', createdAt: new Date() },
    { name: 'Smartwatch', description: 'Feature-rich smartwatch with health tracking, GPS and 7-day battery.', price: 4999, stock: 30, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', createdAt: new Date() },
    { name: 'Sunglasses', description: 'UV400 polarized sunglasses with classic aviator frame.', price: 599, stock: 120, category: 'Accessories', image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', createdAt: new Date() },
    { name: 'Bluetooth Speaker', description: 'Portable waterproof speaker with 360° sound and 12hr playback.', price: 1899, stock: 60, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', createdAt: new Date() },
    { name: 'Coffee Maker', description: 'Programmable 12-cup coffee maker with built-in grinder.', price: 3499, stock: 25, category: 'Kitchen', image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', createdAt: new Date() },
    { name: 'Yoga Mat', description: 'Non-slip 6mm thick premium yoga mat with carrying strap.', price: 799, stock: 90, category: 'Sports', image_url: 'https://images.unsplash.com/photo-1601925228008-c5ed2b5c4875?w=400', createdAt: new Date() },
    { name: 'Laptop Stand', description: 'Adjustable aluminium laptop stand for ergonomic desk setup.', price: 1299, stock: 45, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400', createdAt: new Date() },
    { name: 'Water Bottle', description: 'Insulated stainless steel bottle, keeps cold 24h / hot 12h.', price: 449, stock: 200, category: 'Sports', image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', createdAt: new Date() },
    { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness and USB charging port.', price: 849, stock: 55, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', createdAt: new Date() },
    { name: 'Notebook Set', description: 'Set of 3 premium hardcover notebooks with dotted pages.', price: 349, stock: 150, category: 'Stationery', image_url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', createdAt: new Date() },
  ];

  await db.products.insert(products);
  console.log('✅ Sample products seeded.');
}

seedProducts().catch(console.error);

module.exports = db;

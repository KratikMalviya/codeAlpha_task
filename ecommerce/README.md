# 🛍️ ShopZone — Full Stack E-commerce Store

A complete full-stack e-commerce web application built with **Express.js**, **SQLite**, and vanilla **HTML/CSS/JavaScript**.

## 📋 Features

- 🔐 **User Authentication** — Register, Login with JWT tokens
- 🛒 **Shopping Cart** — Add, update quantity, remove items
- 📦 **Product Catalog** — 12 seeded products with search, category filter & sort
- 🧾 **Product Detail Page** — Full product info with quantity selector
- 📬 **Order Processing** — Checkout with shipping address, order history
- 📱 **Responsive Design** — Works on mobile, tablet & desktop

## 🏗️ Tech Stack

| Layer       | Technology                    |
|-------------|-------------------------------|
| Frontend    | HTML5, CSS3, Vanilla JS       |
| Backend     | Node.js + Express.js          |
| Database    | SQLite (via better-sqlite3)   |
| Auth        | JWT (jsonwebtoken) + bcryptjs |

## 📁 Project Structure

```
ecommerce/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── package.json
│   ├── .env                   # Environment variables
│   ├── database/
│   │   └── db.js              # SQLite setup + seed data
│   ├── routes/
│   │   ├── auth.js            # /api/auth (login, register, me)
│   │   ├── products.js        # /api/products
│   │   ├── cart.js            # /api/cart
│   │   └── orders.js          # /api/orders
│   └── middleware/
│       └── auth.js            # JWT middleware
└── frontend/
    ├── index.html             # Home / Product listing
    ├── login.html             # Login page
    ├── register.html          # Registration page
    ├── product.html           # Product detail page
    ├── cart.html              # Shopping cart
    ├── orders.html            # Order history
    ├── css/
    │   └── style.css          # All styles
    └── js/
        ├── auth.js            # Shared auth utilities
        └── main.js            # Shared helpers
```

## 🚀 Getting Started

### 1. Install dependencies

```bash
cd ecommerce/backend
npm install
```

### 2. Start the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

### 3. Open in browser

```
http://localhost:5000
```

> The backend serves both the API **and** the frontend static files. No separate frontend server needed!

## 🔌 API Endpoints

### Auth
| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| POST   | `/api/auth/register` | Register new user    |
| POST   | `/api/auth/login`    | Login & get token    |
| GET    | `/api/auth/me`       | Get current user     |

### Products
| Method | Endpoint                   | Description                     |
|--------|----------------------------|---------------------------------|
| GET    | `/api/products`            | List all (search, filter, sort) |
| GET    | `/api/products/categories` | List all categories             |
| GET    | `/api/products/:id`        | Get single product              |

### Cart (requires auth)
| Method | Endpoint        | Description            |
|--------|-----------------|------------------------|
| GET    | `/api/cart`     | Get cart items         |
| POST   | `/api/cart`     | Add item to cart       |
| PUT    | `/api/cart/:id` | Update item quantity   |
| DELETE | `/api/cart/:id` | Remove item            |
| DELETE | `/api/cart`     | Clear entire cart      |

### Orders (requires auth)
| Method | Endpoint           | Description            |
|--------|--------------------|------------------------|
| POST   | `/api/orders`      | Place order from cart  |
| GET    | `/api/orders`      | Get all user orders    |
| GET    | `/api/orders/:id`  | Get single order       |

## 🌱 Sample Data

12 products are automatically seeded on first run across categories:
- Electronics, Sports, Bags, Accessories, Kitchen, Stationery

## 🛠️ Development Tips

- Database file: `backend/database/ecommerce.db` (auto-created)
- To reset data: delete `ecommerce.db` and restart server
- JWT expires in 7 days
- For production: change `JWT_SECRET` in `.env`

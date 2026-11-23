# CodeAlpha Internship Projects

A collection of full-stack web applications built during the **CodeAlpha Internship**.

---

## 📁 Projects

### 🛍️ Task 1 — ShopZone (E-commerce Store)
> **Path:** `ecommerce/`

A complete full-stack e-commerce web application.

**Features:**
- 🔐 User Registration & Login (JWT auth)
- 🛒 Shopping Cart (add, update, remove items)
- 📦 Product Listings with Search, Category Filter & Sort
- 🧾 Product Detail Page with quantity selector
- 📬 Order Placement with shipping address
- 📋 Order History

**Tech Stack:** HTML · CSS · Vanilla JS · Express.js · NeDB · JWT

**Run:**
```bash
cd ecommerce/backend
npm install
node server.js
# Open http://localhost:5000
```

---

### ⚡ Task 2 — Vibe (Social Media Platform)
> **Path:** `social-media/`

A mini social media platform with real-time interactions.

**Features:**
- 🔐 User Registration & Login (Email or Username)
- 👤 User Profiles with bio, follow/following counts
- 📝 Create Posts (text + optional image)
- ❤️ Like / Unlike Posts
- 💬 Comments on Posts
- 👥 Follow / Unfollow Users
- 📰 Personalised Feed (following only)
- 🔍 Explore Page (all posts + people search)

**Tech Stack:** HTML · CSS · Vanilla JS · Express.js · NeDB · JWT

**Run:**
```bash
cd social-media/backend
npm install
node server.js
# Open http://localhost:4000
```

---

## 🛠️ Tech Stack (Common)

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js + Express.js |
| Database | NeDB (embedded, no setup needed) |
| Auth | JWT + bcryptjs |

---

## 🚀 Getting Started

Both projects are independent. Run them simultaneously on different ports:

```bash
# Terminal 1 — E-commerce (port 5000)
cd ecommerce/backend && npm install && node server.js

# Terminal 2 — Social Media (port 4000)
cd social-media/backend && npm install && node server.js
```

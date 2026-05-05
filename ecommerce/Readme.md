# ◈ Terroir — Full-Stack E-Commerce Platform

> *Objects made well, for living well.*

A production-ready e-commerce web application built with **React**, **Node.js/Express**, and **MongoDB**. Features user authentication, product browsing/filtering, shopping cart, Stripe payment integration, and order management.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Seed the Database](#seed-the-database)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
  - [Frontend → Netlify](#frontend--netlify)
  - [Backend → Render](#backend--render)
- [Stripe Integration](#stripe-integration)
- [Design System](#design-system)
- [Security Features](#security-features)
- [Contributing](#contributing)

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | Deploy to Netlify (see below) |
| Backend API | Deploy to Render (see below) |

**Demo credentials (after seeding):**
- User: `jane@example.com` / `user123`
- Admin: `admin@shop.com` / `admin123`

---

## Features

### Customer Features
- Browse products with search, category, and price range filtering
- Product detail pages with image gallery and reviews
- Shopping cart with quantity management (persistent per user)
- User registration and login with JWT authentication
- 3-step checkout: Shipping → Payment → Review
- Stripe payment integration (test mode included)
- Order history and order cancellation
- Profile management and password change
- Wishlist functionality
- Product reviews and ratings

### Technical Features
- JWT-based auth with Bearer token
- Role-based access control (user / admin)
- Rate limiting (100 req/15min per IP)
- Helmet security headers
- Input validation with express-validator
- Mongoose schema validation
- Auto-generated order numbers (ORD-000001)
- Full-text search indexing on products
- Automatic stock management on order placement/cancellation
- Stripe webhook support

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| React Toastify | Notifications |
| Lucide React | Icons |
| CSS Modules | Scoped styling |
| Cormorant Garamond + DM Sans | Typography |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database + ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| Stripe | Payment processing |
| express-validator | Input validation |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| Morgan | HTTP request logging |

---

## Project Structure

```
ecommerce/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── seed.js            # Database seeder
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   ├── cartController.js  # Cart CRUD
│   │   ├── orderController.js # Order management
│   │   ├── paymentController.js # Stripe integration
│   │   └── productController.js # Product CRUD + search
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + authorize + token gen
│   │   ├── errorHandler.js    # Global error handler
│   │   └── notFound.js        # 404 handler
│   ├── models/
│   │   ├── Cart.js            # Cart schema
│   │   ├── Order.js           # Order schema (auto order number)
│   │   ├── Product.js         # Product schema (reviews, ratings)
│   │   └── User.js            # User schema (addresses, wishlist)
│   ├── routes/
│   │   ├── auth.js            # /api/auth/*
│   │   ├── cart.js            # /api/cart/*
│   │   ├── orders.js          # /api/orders/*
│   │   ├── payment.js         # /api/payment/*
│   │   ├── products.js        # /api/products/*
│   │   └── users.js           # /api/users/* (admin)
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx + .module.css
│   │   │   │   └── Footer.jsx + .module.css
│   │   │   └── product/
│   │   │       └── ProductCard.jsx + .module.css
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Global auth state
│   │   │   └── CartContext.jsx  # Global cart state
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Hero + categories + featured
│   │   │   ├── Shop.jsx         # Filterable product grid
│   │   │   ├── ProductDetail.jsx # PDP with reviews
│   │   │   ├── Cart.jsx         # Cart management
│   │   │   ├── Checkout.jsx     # 3-step checkout
│   │   │   ├── OrderSuccess.jsx # Post-purchase confirmation
│   │   │   ├── Orders.jsx       # Order history
│   │   │   ├── Profile.jsx      # Account settings
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── NotFound.jsx
│   │   ├── utils/
│   │   │   └── api.js           # Axios instance + interceptors
│   │   ├── App.jsx              # Router + providers
│   │   ├── index.css            # Global design tokens
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── netlify.toml               # Frontend deploy config
├── render.yaml                # Backend deploy config
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **MongoDB** v6+ (local or [MongoDB Atlas](https://cloud.mongodb.com))
- **Stripe account** for payment keys ([stripe.com](https://stripe.com))

---

### Backend Setup

```bash
# 1. Navigate to backend folder
cd ecommerce/backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env with your values (see Environment Variables section)
nano .env

# 5. Start development server
npm run dev
# → API running at http://localhost:5000
```

---

### Frontend Setup

```bash
# 1. Navigate to frontend folder
cd ecommerce/frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx

# 5. Start development server
npm start
# → App running at http://localhost:3000
```

---

### Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- 8 sample products across 5 categories
- 1 admin user: `admin@shop.com` / `admin123`
- 1 test user: `jane@example.com` / `user123`

---

## API Reference

### Auth Routes `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login + receive JWT |
| GET | `/me` | Private | Get current user profile |
| PUT | `/profile` | Private | Update name/phone/addresses |
| PUT | `/change-password` | Private | Update password |
| POST | `/wishlist/:productId` | Private | Toggle product in wishlist |

### Product Routes `/api/products`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List products (filter/sort/paginate) |
| GET | `/featured` | Public | Featured products |
| GET | `/categories` | Public | Available categories |
| GET | `/:slug` | Public | Single product |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Soft-delete product |
| POST | `/:id/reviews` | Private | Add review |

**Query params for GET `/`:**
- `search` — full-text search
- `category` — lighting / kitchen / textiles / home-decor / stationery
- `minPrice`, `maxPrice` — price range
- `sort` — field to sort by (prefix `-` for desc), e.g. `-price`
- `featured` — `true` to filter featured only
- `page`, `limit` — pagination

### Cart Routes `/api/cart`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Private | Get cart |
| POST | `/` | Private | Add/update item `{ productId, quantity }` |
| DELETE | `/:productId` | Private | Remove item |
| DELETE | `/` | Private | Clear entire cart |

### Order Routes `/api/orders`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Private | Place new order |
| GET | `/my` | Private | My order history |
| GET | `/:id` | Private | Single order |
| PUT | `/:id/pay` | Private | Mark order as paid |
| PUT | `/:id/cancel` | Private | Cancel order (pending/processing only) |
| GET | `/` | Admin | All orders |
| PUT | `/:id/status` | Admin | Update order status |

### Payment Routes `/api/payment`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/intent` | Private | Create Stripe PaymentIntent |
| POST | `/webhook` | Public (Stripe) | Stripe event webhook |

### User Routes `/api/users` (Admin only)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | List all users |
| GET | `/:id` | Admin | Get single user |
| PUT | `/:id` | Admin | Update role/status |

---

## Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Deployment

### Frontend → Netlify

1. Push project to GitHub/GitLab
2. Go to [netlify.com](https://netlify.com) → New site → Import from Git
3. Set build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
4. Add environment variables in Netlify dashboard:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx
   ```
5. The `netlify.toml` already handles SPA routing redirects.

### Backend → Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `node server.js`
4. Add all environment variables from your `.env` file
5. Set `NODE_ENV=production` and update `CLIENT_URL` to your Netlify URL

### Alternative: Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy backend
cd backend && railway up
```

---

## Stripe Integration

This app uses **Stripe** for payment processing.

### Test Mode Setup
1. Get your keys at [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. Use `pk_test_...` for frontend and `sk_test_...` for backend
3. Test card: `4242 4242 4242 4242`, any future date, any CVV

### Webhook Setup (optional, for production)
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:5000/api/payment/webhook
```
Copy the webhook secret (`whsec_...`) to `STRIPE_WEBHOOK_SECRET` in your `.env`.

### Payment Flow
1. Frontend calls `POST /api/payment/intent` → receives `clientSecret`
2. Stripe.js confirms payment on client side
3. On success, frontend calls `PUT /api/orders/:id/pay`
4. (Optional) Stripe sends webhook to `/api/payment/webhook` for server-side confirmation

> **Note:** In the current demo implementation, payment is simulated locally (no real card charge). To enable real Stripe payments, integrate `@stripe/react-stripe-js` in the Checkout component and use the `clientSecret` from the payment intent.

---

## Design System

The UI follows a **warm dim editorial** aesthetic:

| Token | Value | Usage |
|---|---|---|
| `--cream` | `#F5F0E8` | Page backgrounds |
| `--charcoal` | `#2C2520` | Primary text, buttons |
| `--ember` | `#C4622D` | Accent, CTAs, badges |
| `--bark` | `#8C7355` | Secondary accent |
| `--ash` | `#7A6E66` | Muted text |
| `--sand` | `#C8B89A` | Borders, dividers |

**Fonts:**
- Display: `Cormorant Garamond` (headings, hero, product names)
- Body: `DM Sans` (UI, labels, body text)

---

## Security Features

- **JWT tokens** — signed with HS256, 7-day expiry
- **bcryptjs** — passwords hashed with salt factor 12
- **Helmet** — sets 11 security HTTP headers
- **CORS** — restricted to `CLIENT_URL` origin
- **Rate limiting** — 100 requests per 15 minutes per IP
- **Input validation** — express-validator on all auth routes
- **Role-based access** — `protect` + `authorize('admin')` middleware
- **Mongoose validation** — schema-level constraints on all models
- **Soft deletes** — products/users flagged `isActive: false`, not destroyed

---

## Scripts

### Backend
```bash
npm run dev      # Start with nodemon (hot reload)
npm start        # Start production server
npm run seed     # Seed database with sample data
```

### Frontend
```bash
npm start        # Development server (localhost:3000)
npm run build    # Production build
npm test         # Run tests
```

---

## Checklist Before Going Live

- [ ] Change `JWT_SECRET` to a strong random string (32+ chars)
- [ ] Switch Stripe keys from `test` to `live`
- [ ] Set `NODE_ENV=production`
- [ ] Update `CLIENT_URL` to your production frontend URL
- [ ] Set up MongoDB Atlas with IP allowlist
- [ ] Enable Stripe webhook endpoint in Stripe dashboard
- [ ] Set up custom domain on Netlify
- [ ] Enable HTTPS (automatic on Netlify + Render)

---

## License

MIT © Terroir Shop. Built for educational purposes.

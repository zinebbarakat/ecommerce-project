# Zaza's Tech House - E-commerce Platform

A full-stack e-commerce web application for browsing and purchasing tech products (phones, laptops, headphones, and tablets). The platform features user authentication, role-based access control, shopping cart management, and order processing.

## TABLE OF CONTENTS

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [How It Works](#how-it-works)
- [API Usage](#api-usage)
- [User Roles](#user-roles)
- [Database Schema](#database-schema)

## FEATURES

### User Features
- **Browse Products**: View and filter products by category (Phones, Laptops, Headphones, Tablets)
- **Product Details**: View detailed information about each product
- **User Authentication**: Register and login with secure password hashing
- **Shopping Cart**: Add products to cart, update quantities, and remove items
- **Checkout**: Convert cart to order for admin review
- **Order History**: View past orders and their status
- **Order Details**: View itemized details of each order

### Admin Features
- **Product Management**: Create, update, and delete products
- **Order Management**: View all orders and update their status
- **Dashboard**: Overview of all system orders

### General Features
- **Role-Based Access Control**: Separate permissions for admin and regular users
- **Responsive Design**: Works on desktop and mobile devices
- **Persistent Sessions**: User sessions stored in localStorage
- **Real-time Stock Management**: Product stock updates on purchase

## TECH STACK

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **SQLite3** - Lightweight database
- **bcryptjs** - Password hashing and security
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development auto-restart

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with modern features
- **JavaScript** - No framework dependencies
- **APIs** - HTTP requests to backend

## PROJECT STRUCTURE

```
ecommerce-project/
├── backend/
│   ├── server.js                 # Express server entry point
│   ├── package.json              # Backend dependencies
│   ├── database.db               # SQLite database file
│   ├── controllers/              # Business logic
│   │   ├── auth.controller.js    # Authentication (login/register)
│   │   ├── products.controller.js # Product CRUD operations
│   │   └── orders.controller.js  # Cart & order management
│   ├── middlewares/
│   │   └── auth.js               # Authentication & authorization
│   ├── models/
│   │   └── db.js                 # Database connection & schema
│   ├── routes/                   # API route definitions
│   │   ├── auth.routes.js
│   │   ├── products.routes.js
│   │   └── orders.routes.js
│   └── public/
│       └── images/               # Product images
│
├── frontend/
│   ├── index.html                # Home page with product catalog
│   ├── about.html                # About page
│   ├── contact.html              # Contact page
│   ├── login.html                # Login page
│   ├── register.html             # Registration page
│   ├── cart.html                 # Shopping cart
│   ├── orders.html               # User order history
│   ├── order-details.html        # Individual order details
│   ├── product.html              # Single product details
│   ├── admin.html                # Admin dashboard
│   ├── css/
│   │   └── style.css             # Application styles
│   ├── img/
│   │   └── logo.jpeg             # Brand logo
│   └── js/                       # Frontend JavaScript modules
│       ├── api.js                # API client & authentication helpers
│       ├── auth.js               # Session management
│       ├── nav.js                # Navigation & role-based UI
│       ├── products.js           # Product listing & filtering
│       ├── product.js            # Single product page logic
│       ├── cart.js               # Shopping cart functionality
│       ├── orders.js             # Order history
│       ├── order-details.js      # Order detail view
│       ├── login.js              # Login form handler
│       ├── register.js           # Registration form handler
│       ├── admin.js              # Admin product management
│       └── admin-orders.js       # Admin order management
│
└── README.md                     # This file
```

## PREREQUISITES

Before running this project, make sure you have:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A code editor (optional, for viewing/editing code)

## INSTALLATION & SETUP

### 1. Clone or Download the Project

```bash
cd C:\Users\Pablo\PhpStormProjects\ecommerce-project
```

### 2. Install Backend Dependencies

Navigate to the backend folder and install required packages:

```powershell
cd backend
npm install
```

This will install:
- `express` - Web framework
- `sqlite3` - Database driver
- `bcryptjs` - Password hashing
- `cors` - CORS middleware
- `nodemon` - Development tool (dev dependency)

### 3. Database Initialization

The database (`database.db`) will be automatically created when you first run the server. The schema includes:
- **users** table - User accounts with roles
- **products** table - Product catalog
- **orders** table - Shopping carts and orders
- **order_items** table - Items within orders

**Note**: You'll need to manually add products via the admin interface or database tools after creating an admin account.

## RUNNING THE APPLICATION

### Start the Backend Server

From the `backend` folder:

```powershell
# Development mode (auto-restart on changes)
npm run dev

# OR Production mode
npm start
```

The server will start on **http://localhost:3000**

You should see:
```
Connected to SQLite database: C:\Users\Pablo\PhpStormProjects\ecommerce-project\backend\database.db
Server listening on port 3000
```

### Start the Frontend

The frontend is a static website. You can open it using:

1. **Live Server Extension** (VS Code/PhpStorm):
   - Right-click on `frontend/index.html`
   - Select "Open with Live Server"

2. **Direct File Opening**:
   - Navigate to `frontend` folder
   - Double-click `index.html`
   - It will open in your default browser

3. **Simple HTTP Server**:
   ```powershell
   cd frontend
   npx http-server -p 8080
   ```
   Then visit **http://localhost:8080**

## HOW IT WORKS

### Authentication Flow

1. **Registration**:
   - User fills registration form (`register.html`)
   - Password is hashed with bcrypt on the backend
   - User account created with role ('user' or 'admin')
   - Session stored in localStorage

2. **Login**:
   - User enters credentials (`login.html`)
   - Backend verifies password hash
   - Session data returned and stored locally
   - UI updates based on user role

3. **Authorization**:
   - Frontend sends `x-user-id` and `x-user-role` headers
   - Backend middleware validates these headers
   - Protected routes check user role (admin/user)

### Shopping Flow

1. **Browse Products**:
   - Products loaded from `/api/products`
   - Filter by category (Phones, Laptops, etc.)
   - Click product for details

2. **Add to Cart**:
   - Click "Add to Cart" on product page
   - Creates/updates CART order for user
   - Cart persists in database (not localStorage)

3. **Cart Management**:
   - View cart items at `cart.html`
   - Update quantities or remove items
   - See real-time total calculation

4. **Checkout**:
   - Click "Checkout" button
   - Cart status changes from 'CART' to 'ORDER'
   - Product stock decremented
   - Order appears in admin dashboard

5. **Order History**:
   - Users view their orders at `orders.html`
   - Click order to see details
   - Track order status (pending/confirmed)

### Admin Workflow

1. **Product Management** (`admin.html`):
   - Create new products with details
   - Update existing product information
   - Delete products from catalog
   - Manage stock levels

2. **Order Management**:
   - View all customer orders
   - Update order status
   - Review order details

## API USAGE

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user

### Products (`/api/products`)
- `GET /` - Get all products (with optional category filter)
- `GET /:id` - Get single product
- `POST /` - Create product (admin only)
- `PUT /:id` - Update product (admin only)
- `DELETE /:id` - Delete product (admin only)

### Orders (`/api/orders`)
- `GET /cart` - Get user's active cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/:productId` - Update cart item quantity
- `DELETE /cart/items/:productId` - Remove item from cart
- `POST /checkout` - Convert cart to order
- `GET /` - Get user's orders (or all orders for admin)
- `GET /:id` - Get order details
- `PUT /:id/status` - Update order status (admin only)

### Static Files
- `GET /images/:filename` - Product images

## USER ROLES

### Regular User (`role: 'user'`)
- Browse and search products
- Add products to cart
- Checkout and place orders
- View own order history
- Access: Home, About, Contact, Cart, Orders, Product details

### Administrator (`role: 'admin'`)
- All user permissions, plus:
- Create, update, delete products
- View all orders from all users
- Update order status
- Access: Admin Dashboard

## DATABASE SCHEMA

### users
```sql
id              INTEGER PRIMARY KEY
username        TEXT UNIQUE NOT NULL
password_hash   TEXT NOT NULL
role            TEXT NOT NULL CHECK(role IN ('admin','user'))
name            TEXT
address         TEXT
phone           TEXT
created_at      TEXT DEFAULT CURRENT_TIMESTAMP
```

### products
```sql
id          INTEGER PRIMARY KEY
name        TEXT NOT NULL
category    TEXT NOT NULL
price       REAL NOT NULL
stock       INTEGER NOT NULL
image_url   TEXT NOT NULL
short_desc  TEXT
long_desc   TEXT
created_at  TEXT DEFAULT CURRENT_TIMESTAMP
```

### orders
```sql
id          INTEGER PRIMARY KEY
user_id     INTEGER NOT NULL
status      TEXT NOT NULL CHECK(status IN ('CART','ORDER'))
created_at  TEXT DEFAULT CURRENT_TIMESTAMP
FOREIGN KEY(user_id) REFERENCES users(id)
```

### order_items
```sql
id          INTEGER PRIMARY KEY
order_id    INTEGER NOT NULL
product_id  INTEGER NOT NULL
quantity    INTEGER NOT NULL
unit_price  REAL NOT NULL
FOREIGN KEY(order_id) REFERENCES orders(id)
FOREIGN KEY(product_id) REFERENCES products(id)
UNIQUE(order_id, product_id)
```

## SECURITY FEATURES

- Password hashing with bcryptjs (10 rounds)
- SQL injection prevention via parameterized queries
- Role-based access control
- CORS configuration for API security
- Input validation on backend
- Foreign key constraints in database

## DESIGN FEATURES

- Clean, modern UI with consistent styling
- Responsive layout for mobile and desktop
- Accessible HTML with ARIA labels
- Loading states and error messages
- Grid layout for product display
- Card-based component design

## LICENSE

This project is for educational purposes.

## AUTHORS

Zaza's Tech House - E-Commerce Site

Created by: Zineb Barakat, Stella Segalini & Pablo Canales

Date: December 2025 / January 2026


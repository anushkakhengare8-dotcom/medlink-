# MedLink

A B2B pharmacy ordering platform connecting pharmacy owners with medicine distributors — real-time catalog search, order tracking, and automatic invoicing, replacing phone calls and paper orders.

## Live Demo
[Add your live link here once deployed]

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript (no framework)
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (hosted on Neon), Prisma ORM
- **Auth:** JWT + bcrypt

## Features
- Two account types — Pharmacy Owner and Distributor — each with a role-specific dashboard and sidebar
- Real-time medicine search with live suggestions, and bulk catalog upload for distributors
- Cart, checkout, and order placement with real stock validation (prevents overselling via database transactions)
- Order status tracking (Pending → Confirmed → Shipped → Delivered)
- Automatic invoice generation the moment an order is delivered
- Real-time in-app notifications for both roles
- Saved payment methods — only the last 4 digits of a card are ever stored, never the full number
- Star-rating feedback system
- Light and dark mode

## Getting Started

```bash
# Clone the repo
git clone <your-repo-url>
cd medlink/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# then fill in your own DATABASE_URL, DIRECT_URL, and JWT_SECRET

# Sync the database schema
npx prisma db push

# Start the backend
npm run dev
```

Then open `index.html` in your browser (the frontend needs no build step).

## Project Structure
```
medlink/
├── backend/          Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   └── prisma/        Database schema
├── js/                 Frontend logic
├── css/                 Stylesheets
└── *.html               Pages
```

---
Built as a capstone/internship project.

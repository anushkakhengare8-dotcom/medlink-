# MedLink backend — setup

## 1. Install dependencies
```
cd backend
npm install
```

## 2. Set up your environment file
```
cp .env.example .env
```
Then open `.env` and paste your Neon (or other Postgres) connection string into `DATABASE_URL`. The JWT secret is already filled in — leave it as is.

## 3. Create the database tables
```
npx prisma migrate dev --name init
```
This reads `prisma/schema.prisma` and creates the actual tables (users, medicines, orders, order_items, addresses) in your database. You only need to re-run this when the schema changes.

## 4. Start the server
```
npm run dev
```
You should see: `MedLink backend running on http://localhost:4000`

## 5. Confirm it's working
Open `http://localhost:4000/api/health` in a browser — you should see `{"status":"ok"}`.

## API endpoints built so far

| Method | Route | Who | What |
|---|---|---|---|
| POST | /api/auth/signup | Anyone | Create an account (pharmacy owner or distributor) |
| POST | /api/auth/login | Anyone | Log in, get a token |
| GET | /api/medicines | Logged in | Search/list the medicine catalog |
| POST | /api/medicines | Distributor | Add a medicine to your catalog |
| PATCH | /api/medicines/:id | Distributor | Edit your own listing |
| POST | /api/orders | Pharmacy owner | Place an order (validates stock, decrements it) |
| GET | /api/orders | Logged in | See your own orders (buyer or fulfiller view) |
| PATCH | /api/orders/:id/status | Distributor | Update an order's status |
| GET | /api/addresses | Logged in | List your saved addresses |
| POST | /api/addresses | Logged in | Add an address |
| DELETE | /api/addresses/:id | Logged in | Remove an address |

All routes except signup/login require a header: `Authorization: Bearer <token>` — the token you get back from signup or login.

## Not built yet
- Payments/Razorpay route — waiting on your test API keys
- Prescription file upload — currently the frontend just picks a file locally

## Useful commands
- `npx prisma studio` — opens a browser UI to view/edit your database directly
- `npm test` — runs the health-check test

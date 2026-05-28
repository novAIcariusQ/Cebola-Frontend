# Cebola Frontend

React/Vite frontend for the Cebola MVP. The current implementation covers the public customer storefront and the merchant-facing flow from the project board: customer shop search, product catalogue/detail, basket, checkout redirect, merchant auth, merchant shop/product/order management, settings, upload hooks, AI describe hooks, and EN/PT localization.

## Stack

- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios with `baseURL: /api`
- i18next + react-i18next
- lucide-react icons

## Requirements

- Node.js 20+ recommended
- npm

The project was last checked with Node `24.14.1`.

## Install

```bash
npm install
```

If npm optional dependencies break on Windows, clean the install and run it again:

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

## Run Locally

```bash
npm run dev
```

Default local URL:

```text
http://localhost:3000
```

Vite proxies `/api` to:

```text
http://localhost:3001
```

The proxy is configured in `vite.config.ts`.

## Run via docker compose

```bash
docker compose up
```

## Build

```bash
npm run build
```

This runs TypeScript checks and then `vite build`.

## Demo Access

Backend auth is not required for merchant frontend development. Open `/login/sign-in` and click `Use local demo access`; this stores a local frontend token and redirects to `/merchant/shops`.

The customer storefront is public and starts at `/`. It can use backend public endpoints or local demo data derived from merchant demo storage.

## Customer Routes

```text
/
/shops/:shopId/products
/shops/:shopId/products/:productId
/basket
/checkout
```

`/`, `/shops/:shopId/products`, `/shops/:shopId/products/:productId`, and `/basket` use the customer layout with home, basket, and language switch actions. `/checkout` intentionally has no customer header because it creates the order and redirects to the backend-provided Stripe/payment URL.

## Merchant Routes

```text
/login/sign-in
/login/sign-up

/merchant/shops
/merchant/shops/new
/merchant/shops/:shopId
/merchant/shops/:shopId/products
/merchant/shops/:shopId/products/new
/merchant/shops/:shopId/products/:productId
/merchant/shops/:shopId/orders
/merchant/shops/:shopId/orders/:orderId
/merchant/settings
```

`/merchant` redirects to `/merchant/shops`. Unknown routes redirect to the public customer landing page `/`.

## Implemented Customer Scope

- Customer header: home button, basket button with quantity badge, language switcher.
- Customer landing: shop search, merchant sign in/sign up links, public shop cards, pagination.
- Product catalogue: shop title/description, product search, product cards, prices, add-to-basket, pagination.
- Product page: product image, name, shop title, price, available quantity, description, add-to-basket, buy-now.
- Basket page: item list, image/name/price/current quantity, increase/decrease, remove, clear basket, total cost, checkout link.
- Checkout page: creates an order from the basket and redirects to a backend-provided Stripe/payment link. It does not collect card data in this frontend.

## Implemented Merchant Scope

- Sign in page: switch to sign up, email, password, sign in.
- Sign up page: switch to sign in, name, email, password, password confirmation, sign up.
- Merchant header: home button, settings button, language switcher.
- Merchant landing: shop search, create shop button, shop cards, pagination.
- Shop creation: logo drop/upload, name, description, create/cancel.
- Shop page: editable logo, name, description, links to products and orders.
- Product catalogue: JSON/XLSX import controls, create product, product cards, price, quantity, search, pagination.
- Product creation: image drop/upload, title, cost, quantity, description, AI describe, create more, create/cancel.
- Product page: editable image, title, cost, quantity, description, remove product.
- Order catalogue: order cards with id/code, created date, total quantity, total amount, status, search, pagination.
- Order page: ordered products, quantities, final price, status actions, customer contact info.
- Settings page: editable merchant name, change password form, logout.
- Language switch: Portuguese and English, persisted in `localStorage`.

## API Contracts Used

Customer storefront:

```text
GET  /api/shops?page&limit&q
GET  /api/shops/:shopId
GET  /api/shops/:shopId/products?page&limit&q
GET  /api/shops/:shopId/products/:productId
POST /api/orders
GET  /api/orders/:orderId
```

The customer API client normalizes common backend field variants such as `cost`, `amount`, `logo`, `photo_url`, `shop_id`, `shop_title`, `is_avalible`, `payment_url`, `stripe_url`, and `checkout_url`.

Auth:

```text
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
PUT  /api/auth/me
POST /api/auth/change-password
```

Merchant shops:

```text
GET  /api/merchant/shops?page&limit&q
POST /api/merchant/shop
GET  /api/merchant/shops/:shopId
PUT  /api/merchant/shops/:shopId
```

Merchant products:

```text
GET    /api/merchant/shops/:shopId/products?page&limit&q
POST   /api/merchant/shops/:shopId/products
GET    /api/merchant/shops/:shopId/products/:productId
PUT    /api/merchant/shops/:shopId/products/:productId
DELETE /api/merchant/shops/:shopId/products/:productId
```

Merchant orders:

```text
GET /api/merchant/shops/:shopId/orders?page&limit&q
GET /api/merchant/shops/:shopId/orders/:orderId
PUT /api/merchant/shops/:shopId/orders/:orderId
```

Uploads and AI:

```text
POST /api/upload
POST /api/ai
```

## Backend Fallbacks

The frontend is API-first, but customer and merchant pages have local fallback data so UI work can continue before backend endpoints are available.

Fallbacks live in:

```text
src/shared/lib/customer-demo-storage.ts
src/shared/lib/customer-basket-storage.ts
src/shared/lib/merchant-demo-storage.ts
src/shared/lib/merchant-product-demo-storage.ts
src/shared/lib/merchant-order-demo-storage.ts
src/shared/lib/user-demo-storage.ts
```

They use `localStorage` and should be replaced by real backend responses once the server is connected. Customer basket storage is intentionally client-side and scoped to one `shopId` at a time, because the order payload is created for one shop.

## Architecture

The app follows a lightweight FSD-style structure:

```text
src/app        app root, router, route guards
src/pages      route-level screens
src/features   reusable feature UI blocks
src/widgets    app/page layout widgets
src/entities   domain types
src/shared     API clients, i18n, utilities, small UI primitives
```

Merchant route pages live in:

```text
src/pages/merchant
```

Customer route pages live in:

```text
src/pages/customer
```

Shared merchant layout:

```text
src/widgets/merchant-layout
```

Shared customer layout:

```text
src/widgets/customer-layout
```

API clients:

```text
src/shared/api
```

i18n:

```text
src/shared/i18n/locales/en.ts
src/shared/i18n/locales/pt.ts
```

## Domain Separation

Merchant and customer responsibilities are separate:

- Merchant creates and manages shops, products, and orders.
- Customer reads public shop/product data, manages a local basket, and creates orders.
- Merchant sees and processes orders created by customers.

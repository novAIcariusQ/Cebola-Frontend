# Cebola Frontend

React/Vite frontend for the Cebola MVP. The current implementation covers the merchant-facing flow from the project board: auth pages, merchant header, shops landing, shop creation/detail, product catalogue/create/detail, order catalogue/detail, settings, upload hooks, AI describe hooks, and EN/PT localization.

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

## Build

```bash
npm run build
```

This runs TypeScript checks and then `vite build`.

## Demo Access

Backend auth is not required for frontend development. Open `/login/sign-in` and click `Use local demo access`; this stores a local frontend token and redirects to `/merchant/shops`.

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

`/merchant` redirects to `/merchant/shops`. Unknown routes redirect to the merchant landing page.

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

The frontend is API-first, but most merchant pages have local fallback data so UI work can continue before backend endpoints are available.

Fallbacks live in:

```text
src/shared/lib/merchant-demo-storage.ts
src/shared/lib/merchant-product-demo-storage.ts
src/shared/lib/merchant-order-demo-storage.ts
src/shared/lib/user-demo-storage.ts
```

They use `localStorage` and should be replaced by real backend responses once the server is connected.

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

Shared merchant layout:

```text
src/widgets/merchant-layout
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

## Customer Storefront Integration

Customer pages are a separate public flow and should not be implemented inside the merchant pages.

Recommended future structure:

```text
src/pages/home/
src/pages/shop/
src/pages/cart/
src/pages/order-confirmation/

src/features/customer/shop-search/
src/features/customer/shop-list/
src/features/customer/product-catalog/
src/features/customer/cart/
src/features/customer/checkout/

src/shared/api/public.api.ts
src/shared/api/orders.api.ts
```

Expected customer flow:

1. `HomePage` loads active shops from `GET /api/shops?page&limit&q`.
2. `ShopPage` loads shop details and available products.
3. `ProductCatalog` adds products to a cart.
4. Cart state is stored in a customer cart feature, preferably with `localStorage` persistence.
5. `CheckoutForm` submits `POST /api/orders`.
6. `OrderConfirmationPage` shows `guest_order_id` or `qr_code_data`.

Merchant and customer responsibilities remain separate:

- Merchant creates and manages shops, products, and orders.
- Customer reads public shop/product data and creates orders.
- Merchant sees and processes orders created by customers.

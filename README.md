# Cebola Frontend

React/Vite frontend for the Cebola MVP. The current implementation focuses on the merchant console: shop settings, product management, order visibility, inventory imports, image upload hooks, and i18n.

## Stack

- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios with `baseURL: /api`
- i18next + react-i18next

## Requirements

- Node.js 20+ recommended
- npm

The project was checked with Node `24.14.1`.

## Install

```bash
npm install
```

If npm optional dependencies break on Windows, clean the install and run it again:

```bash
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

## Run Locally

```bash
npm run dev
```

Default local URL:

```text
http://127.0.0.1:3000/
```

Vite proxies `/api` to:

```text
http://localhost:3001
```

This is configured in `vite.config.ts`.

## Build

```bash
npm run build
```

The command runs TypeScript build checks and then `vite build`.

## How To Open The Merchant Console

1. Start the dev server with `npm run dev`.
2. Open `http://127.0.0.1:3000/`.
3. Use the login form.
4. If backend auth is not running yet, click `Use local demo access`.
5. You will be redirected to `/merchant`.

The demo access stores a local frontend token only. It exists so the merchant UI can be developed before backend auth is available.

## Current Features

- Merchant authentication screen with login/register API calls prepared.
- Merchant console layout based on the reference console structure.
- Shop settings form with public visibility toggle.
- Logo upload prepared for `POST /api/upload`, with local preview fallback.
- Product list with add, edit, delete, availability, price, photo URL, and photo upload.
- Orders table with pickup QR/code preview and local status change.
- Inventory import UI for JSON, XLSX, and image/AI flows.
- JSON import can create local products immediately for frontend testing.
- i18n support for Portuguese and English.
- Language selection persisted in `localStorage`.

## API Contracts Prepared

Auth:

```text
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

Merchant:

```text
GET    /api/merchant/shop
POST   /api/merchant/shop
PUT    /api/merchant/shop/:id
GET    /api/merchant/products
POST   /api/merchant/products
PUT    /api/merchant/products/:id
DELETE /api/merchant/products/:id
GET    /api/merchant/orders
```

Uploads and AI:

```text
POST /api/upload
POST /api/ai
```

## Architecture

The app follows a lightweight FSD-style structure:

```text
src/app        app root, router, route guards
src/pages      route-level screens
src/features   business UI blocks
src/widgets    page shell and reusable page-level UI
src/entities   domain types
src/shared     API clients, i18n, utilities, small UI primitives
```

Merchant code is split like this:

```text
src/pages/merchant
src/features/merchant/overview
src/features/merchant/shop-settings
src/features/merchant/products
src/features/merchant/orders
src/features/merchant/imports
src/widgets/merchant-shell
```

The page owns orchestration and state. Feature components receive data and callbacks. API clients stay in `src/shared/api`.

## Customer Pages Integration Guide

The customer storefront must be separate from the merchant console. Do not add customer flows as sections inside `/merchant`.

Recommended structure:

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

Recommended routes:

```tsx
<Route path="/" element={<HomePage />} />
<Route path="/shops/:shopId" element={<ShopPage />} />
<Route path="/cart" element={<CartPage />} />
<Route path="/orders/:orderId" element={<OrderConfirmationPage />} />
<Route path="/merchant" element={<ProtectedRoute><MerchantPage /></ProtectedRoute>} />
```

Customer API client:

```ts
export const publicApi = {
  getShops(params?: { page?: number; limit?: number; q?: string }) {
    return apiClient.get('/shops', { params }).then(response => response.data)
  },
  getShop(shopId: string) {
    return apiClient.get(`/shops/${shopId}`).then(response => response.data)
  },
  getShopProducts(shopId: string) {
    return apiClient.get(`/shops/${shopId}/products`).then(response => response.data)
  },
}
```

Orders API client:

```ts
export const ordersApi = {
  createOrder(payload: {
    shopId: string
    items: Array<{ productId: string; quantity: number }>
    customerName?: string
    customerEmail?: string
    customerPhone?: string
  }) {
    return apiClient.post('/orders', payload).then(response => response.data)
  },
  getOrder(id: string) {
    return apiClient.get(`/orders/${id}`).then(response => response.data)
  },
}
```

Expected customer flow:

1. `HomePage` loads active shops from `GET /api/shops?page&limit&q`.
2. `ShopPage` loads shop details and available products.
3. `ProductCatalog` adds products to a cart.
4. Cart state is stored in a customer cart feature, preferably with `localStorage` persistence.
5. `CheckoutForm` submits `POST /api/orders`.
6. `OrderConfirmationPage` shows `guest_order_id` or `qr_code_data`.

Merchant and customer responsibilities are intentionally separate:

- Merchant creates public shop data and products.
- Customer reads public shop/product data and creates orders.
- Merchant sees orders created by customers.

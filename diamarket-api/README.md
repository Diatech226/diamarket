# Diamarket API

## Setup

```bash
npm install
npm run dev
```

## Environment

See `.env.example`.

## Endpoints (Iteration 2)

### Products
- `GET /api/products` (pagination: `page`, `limit`; filtres: `category`, `vendor`, `status`, `isFeatured`; recherche: `search`)
- `GET /api/products/:slug`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Categories
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Vendor Requests
- `POST /api/vendor-requests`
- `GET /api/vendor-requests`
- `PUT /api/vendor-requests/:id/approve`
- `PUT /api/vendor-requests/:id/reject`

### Orders
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/status`

## Status

### Order status
`pending`, `confirmed`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`

### Shipment status
`not_created`, `estimated`, `created`, `in_transit`, `delivered`, `failed`

## Auth headers (temporary Clerk bridge)
- `x-user-id`
- `x-user-role`

## JSON examples

### Create Product
```json
{
  "name": "Chaussures artisanales",
  "slug": "chaussures-artisanales",
  "description": "Fabriquées à Douala",
  "price": 25000,
  "currency": "FCFA",
  "images": ["https://cdn.example.com/p1.jpg"],
  "category": "665f0cfecfdd2a4f2d6d12aa",
  "vendor": "665f0cfecfdd2a4f2d6d12ab",
  "stock": 18,
  "weight": 0.9,
  "length": 30,
  "width": 20,
  "height": 12,
  "originCountry": "CM",
  "originCity": "Douala",
  "status": "active",
  "isFeatured": true,
  "isPromoted": false
}
```

### Create Order
```json
{
  "customer": "665f0cfecfdd2a4f2d6d12ac",
  "vendor": "665f0cfecfdd2a4f2d6d12ab",
  "items": [
    {
      "product": "665f0cfecfdd2a4f2d6d12ad",
      "name": "Chaussures artisanales",
      "quantity": 2,
      "unitPrice": 25000,
      "totalPrice": 50000
    }
  ],
  "totalAmount": 50000,
  "currency": "FCFA",
  "totalWeight": 1.8,
  "distanceKm": 35
}
```

## Iteration 7 Security
See ../SECURITY.md and API permissions middlewares for roles, permissions, and vendor workflow.

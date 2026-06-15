# Frontend Integration Guide

Handoff reference for the Customer, Rider, Merchant, and Admin Flutter apps.

---

## 1. Base URL

| Environment | Base URL |
|-------------|----------|
| Dev (local) | `http://localhost:3000/api/v1` |
| Dev (Docker) | `http://localhost:3000/api/v1` |
| Staging | `https://staging-api.wertee.com/api/v1` |
| Production | `https://api.wertee.com/api/v1` |

---

## 2. Interactive API Docs (Swagger UI)

The live Swagger UI is served at `/docs` when the server is running:

```
http://localhost:3000/docs
```

- Click **Authorize** (top right) and paste a JWT to test protected endpoints directly.
- Every endpoint, request body, and response shape is documented there.

To export the spec as a static file for tooling (Postman, Insomnia, code-gen):

```bash
cd food-delivery-backend
npm run docs:export        # → openapi.json
npm run docs:export:yaml   # → openapi.yaml (requires: npm i -D js-yaml)
```

---

## 3. Authentication

### Login

```
POST /auth/login
Content-Type: application/json

{ "phone": "+959xxxxxxxxx", "password": "secret" }
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": "...", "role": "CUSTOMER", ... }
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

### Token Refresh

```
POST /auth/refresh
Authorization: Bearer <refreshToken>
```

### Logout

```
POST /auth/logout
Authorization: Bearer <accessToken>
```

### Push Token Registration

```
POST /auth/push-token
Authorization: Bearer <accessToken>

{ "token": "fcm_device_token", "platform": "ANDROID" }
```

### Auth Rules

- All protected endpoints require `Authorization: Bearer <accessToken>`.
- Access token TTL: **15 minutes**. Refresh token TTL: **7 days**.
- On `401`, call `/auth/refresh` then retry once. On second `401`, redirect to login.

---

## 4. Response Envelope

Every response uses the same wrapper:

**Success:**

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_01hwz3k2x8f9g",
    "timestamp": "2026-06-01T10:00:00.000Z"
  }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { ... }
  },
  "meta": { "requestId": "req_...", "timestamp": "..." }
}
```

---

## 5. Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Request body / param failed validation |
| `UNAUTHORIZED` | 401 | Missing or expired token |
| `FORBIDDEN` | 403 | Token valid but role not allowed |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate or state conflict |
| `UNPROCESSABLE` | 422 | Business rule violation |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 6. Endpoint Surface by App

### Customer App

| Area | Endpoint prefix |
|------|----------------|
| Auth | `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh` |
| Profile | `GET/PATCH /customer/profile` |
| Addresses | `GET/POST/PATCH/DELETE /customer/addresses` |
| Store discovery | `GET /customer/stores`, `GET /customer/stores/:storeTypeId/branches` |
| Catalog | `GET /customer/branches/:branchId/catalog` |
| Cart | `GET/POST/PATCH/DELETE /customer/cart` |
| Checkout preview | `POST /customer/checkout/preview` |
| Place order | `POST /customer/orders` |
| Order history | `GET /customer/orders`, `GET /customer/orders/:id` |
| Cancel order | `POST /customer/orders/:id/cancel` |
| Payments | `GET /customer/payments`, `POST /customer/orders/:id/pay` |
| Refunds | `GET /customer/refunds`, `POST /customer/orders/:id/refund` |
| Messaging | `GET/POST /customer/conversations`, `GET/POST /customer/conversations/:id/messages` |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read` |

### Rider App

| Area | Endpoint prefix |
|------|----------------|
| Auth | Same as above |
| Profile | `GET/PATCH /rider/profile` |
| Availability | `POST /rider/availability/online`, `POST /rider/availability/offline` |
| Location | `POST /rider/location` |
| Orders | `GET /rider/orders`, `GET /rider/orders/:id` |
| Deliveries | `GET /rider/deliveries`, `PATCH /rider/deliveries/:id/status` |
| Messaging | `GET/POST /rider/conversations/:id/messages` |

### Merchant App

| Area | Endpoint prefix |
|------|----------------|
| Auth | Same as above |
| Profile | `GET/PATCH /merchant/profile` |
| Branches | `GET/POST/PATCH /merchant/branches` |
| Menu categories | `GET/POST/PATCH/DELETE /merchant/branches/:id/menu/categories` |
| Menu items | `GET/POST/PATCH/DELETE /merchant/branches/:id/menu/items` |
| Options / variants | `…/menu/items/:id/option-groups`, `…/options`, `…/variants` |
| Variant combos | `GET/POST/PATCH/DELETE …/menu/items/:id/variant-combinations` |
| Inventory | `GET/PATCH …/menu/items/:id/inventory`, `…/inventory-lots` |
| Promotions | `GET/POST/PATCH /merchant/branches/:id/promotions` |
| Orders | `GET /merchant/orders`, `PATCH /merchant/orders/:id/status` |
| Messaging | `GET/POST /merchant/conversations/:id/messages` |

### Admin App

| Area | Endpoint prefix |
|------|----------------|
| Auth | Same as above |
| Orders | `GET /admin/orders`, `PATCH /admin/orders/:id` |
| Dispatch | `GET/POST /admin/dispatch` |
| Payments | `GET /admin/payments`, `GET /admin/order-payments` |
| Refunds | `GET /admin/refunds`, `POST /admin/orders/:id/refunds` |
| Store types | `GET/POST/PATCH /admin/store-types`, `PATCH /admin/branch-store-types/:id` |
| Zones | `GET/POST/PATCH/DELETE /admin/zones` |
| Reports | `GET /admin/reports/inventory-alerts/overview`, `GET /admin/reports/inventory-alerts/trends` |
| Audit | `GET /admin/audit` |
| Messaging | `GET /admin/conversations`, `GET/POST /admin/conversations/:id/messages` |

---

## 7. Ordering Flow (Customer)

```
1. GET  /customer/branches/:branchId/catalog         ← browse menu
2. POST /customer/cart                               ← add items
3. POST /customer/checkout/preview                   ← price breakdown (pass promotionCode if any)
4. POST /customer/orders                             ← place order (returns orderId)
5. POST /customer/orders/:id/pay                     ← initiate payment
6. GET  /customer/orders/:id                         ← poll status OR use WebSocket
```

---

## 8. Real-time (WebSocket)

The server exposes a Socket.io gateway at the same port.

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: accessToken },
});

socket.on('order:status_updated', (payload) => { ... });
socket.on('message:new', (payload) => { ... });
socket.on('delivery:location_updated', (payload) => { ... });
```

Join an order room after placing an order:

```js
socket.emit('order:join', { orderId });
```

---

## 9. Support Tickets (Customer + Agent)

### Customer App

| Action | Endpoint |
|--------|----------|
| Open ticket | `POST /customer/support/tickets` |
| List my tickets | `GET /customer/support/tickets?status=OPEN&page=1&limit=20` |
| Get ticket + messages | `GET /customer/support/tickets/:ticketId` |
| Reply to ticket | `POST /customer/support/tickets/:ticketId/messages` |

**Open ticket request body:**
```json
{
  "category": "ORDER_ISSUE",
  "subject": "Order #ORD-001 not delivered",
  "body": "I placed an order 2 hours ago but it has not arrived.",
  "orderId": "order_abc123",
  "priority": "NORMAL"
}
```

**Ticket categories:** `ORDER_ISSUE` · `PAYMENT_ISSUE` · `DELIVERY_ISSUE` · `ACCOUNT_ISSUE` · `MERCHANT_ISSUE` · `APP_BUG` · `OTHER`

**Ticket statuses:** `OPEN` → `IN_PROGRESS` → `PENDING_CUSTOMER` → `RESOLVED` → `CLOSED`

When an agent sets status to `PENDING_CUSTOMER`, they are waiting for the customer to reply.
When the customer replies, the ticket automatically moves back to `IN_PROGRESS`.

### Support Agent / Admin App

| Action | Endpoint |
|--------|----------|
| List all tickets | `GET /support/tickets?status=OPEN&priority=HIGH` |
| Get ticket + messages | `GET /support/tickets/:ticketId` |
| Update status/priority/assignment | `PATCH /support/tickets/:ticketId` |
| Reply (or internal note) | `POST /support/tickets/:ticketId/messages` |

**Update ticket request body:**
```json
{
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "assignedAgentId": "user_agent_1",
  "note": "Escalating to billing team."
}
```

**Internal notes:** Set `"isInternal": true` in a reply — visible only to SUPPORT/ADMIN roles, hidden from customer.

---

## 10. File Uploads

| Endpoint | Role | Purpose |
|----------|------|---------|
| `POST /uploads/menu-items/:branchId` | MERCHANT | Menu item images |
| `POST /uploads/branch-banners/:branchId` | MERCHANT | Branch banner images |
| `POST /uploads/chat-attachments/:conversationId` | CUSTOMER · MERCHANT · RIDER · SUPPORT | Chat photo attachments |

All upload endpoints accept `multipart/form-data` with a `file` field.

**Response:**
```json
{ "key": "menu-items/branch_1/a3f8c2d1.jpg", "url": "https://cdn.example.com/menu-items/branch_1/a3f8c2d1.jpg" }
```

Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`. Max size: 10 MB.

---

## 11. Known Stubs (not production-ready)

| Feature | Status | Notes |
|---------|--------|-------|
| FCM Push Notifications | Real (graceful fallback) | Set `FCM_CLIENT_EMAIL` + `FCM_PRIVATE_KEY` in `.env`. Falls back to stub if not set. |
| S3 Image Upload | Real (graceful fallback) | Set `S3_ACCESS_KEY_ID` + `S3_SECRET_ACCESS_KEY` in `.env`. Falls back to stub if not set. |

---

## 12. Pagination

Paginated endpoints accept:

```
?page=1&limit=20
```

Response `meta` includes: `page`, `limit`, `total`, `totalPages`, `hasNext`, `hasPrev`.

---

## 13. Health Check

```
GET /health/ready   → 200 { status: "ok" }
GET /health/live    → 200 { status: "ok" }
```

Use `ready` for load-balancer health checks; use `live` for liveness probes.

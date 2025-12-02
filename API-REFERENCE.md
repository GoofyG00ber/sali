# API Endpoints Reference

Complete list of all API endpoints converted from Node.js to PHP.

## Authentication

### Verify Admin Password
- **Endpoint**: `POST /api/admin/verify`
- **File**: `api/admin.php`
- **Request**: `{ "password": "your-password" }`
- **Response**: `{ "valid": true|false }`

### Update Admin Password
- **Endpoint**: `PUT /api/admin/password`
- **File**: `api/admin.php`
- **Request**: `{ "oldPassword": "old", "newPassword": "new" }`
- **Response**: `{ "success": true }`

---

## Restaurant Status & Hours

### Get Restaurant Status
- **Endpoint**: `GET /api/restaurant-status`
- **File**: `api/restaurant-status.php`
- **Response**: 
```json
{
  "isOpen": true,
  "manualOpen": true,
  "isOpenBySchedule": true,
  "schedule": { "day": "Hétfő", "from": "10:00", "to": "21:00" },
  "message": "Nyitva vagyunk"
}
```

### Update Manual Status
- **Endpoint**: `POST /api/restaurant-status`
- **File**: `api/restaurant-status.php`
- **Request**: `{ "manualOpen": true|false }`
- **Response**: `{ "success": true, "manualOpen": true }`

### Get Opening Hours
- **Endpoint**: `GET /api/opening-hours`
- **File**: `api/opening-hours.php`
- **Response**: Array of opening hours for each day

### Update Opening Hours
- **Endpoint**: `PUT /api/opening-hours`
- **File**: `api/opening-hours.php`
- **Request**: 
```json
{
  "hours": [
    { "name_of_day": "Hétfő", "open_time": "10:00", "close_time": "21:00" },
    ...
  ]
}
```

---

## Categories

### Get All Categories
- **Endpoint**: `GET /api/categories`
- **File**: `api/categories.php`
- **Response**: Array of `{ id, title, image }`

### Get Single Category
- **Endpoint**: `GET /api/categories/:id`
- **File**: `api/categories.php`
- **Response**: `{ id, title, image }`

### Create Category
- **Endpoint**: `POST /api/categories`
- **File**: `api/categories.php`
- **Request**: `{ "title": "Pizza", "image": "/path.jpg" }`

### Update Category
- **Endpoint**: `PUT /api/categories/:id`
- **File**: `api/categories.php`
- **Request**: `{ "title": "Pizza", "image": "/path.jpg" }`

### Delete Category
- **Endpoint**: `DELETE /api/categories/:id`
- **File**: `api/categories.php`

---

## Foods (Menu Items)

### Get All Foods
- **Endpoint**: `GET /api/foods`
- **File**: `api/foods.php`
- **Response**: Array of food items with prices
```json
[
  {
    "id": 1,
    "title": "Margherita",
    "description": "...",
    "image": "/static_images/...",
    "categoryId": 1,
    "active": 1,
    "prices": [
      { "label": "32cm", "price": 2500 },
      { "label": "45cm", "price": 3500 }
    ],
    "badges": []
  }
]
```

### Get Single Food
- **Endpoint**: `GET /api/foods/:id`
- **File**: `api/foods.php`
- **Response**: Single food item with prices

### Create Food
- **Endpoint**: `POST /api/foods`
- **File**: `api/foods.php`
- **Content-Type**: `multipart/form-data` (for image upload)
- **Fields**: 
  - `title`: string
  - `description`: string
  - `categoryId`: number
  - `active`: 1|0
  - `prices`: JSON array
  - `image`: file upload

### Update Food
- **Endpoint**: `PUT /api/foods/:id`
- **File**: `api/foods.php`
- **Same as Create**

### Delete Food
- **Endpoint**: `DELETE /api/foods/:id`
- **File**: `api/foods.php`

### Toggle Active Status
- **Endpoint**: `PATCH /api/foods/:id/toggle-active`
- **File**: `api/foods.php`
- **Response**: `{ "success": true }`

---

## Top Pizzas

### Get Top Pizzas
- **Endpoint**: `GET /api/top-pizzas`
- **File**: `api/top-pizzas.php`
- **Response**: Array of featured pizza items

### Add Top Pizza
- **Endpoint**: `POST /api/top-pizzas`
- **File**: `api/top-pizzas.php`
- **Request**: `{ "itemId": 5 }`
- **Response**: `{ "id": 1, "itemId": 5 }`

### Remove Top Pizza
- **Endpoint**: `DELETE /api/top-pizzas/:id`
- **File**: `api/top-pizzas.php`

---

## Orders

### Get All Orders (Admin)
- **Endpoint**: `GET /api/orders`
- **File**: `api/orders.php`
- **Response**: Array of orders (excludes pending Barion payments)

### Get Single Order
- **Endpoint**: `GET /api/orders/:id`
- **File**: `api/orders.php`
- **Response**: 
```json
{
  "id": "123",
  "items": [
    {
      "itemId": 1,
      "foodTitle": "Margherita",
      "priceLabel": "32cm",
      "price": 2500,
      "quantity": 2,
      "extras": []
    }
  ],
  "deliveryType": "delivery",
  "deliveryInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+36301234567",
    "address": "Main St 1",
    "city": "Budapest",
    "zip": "1234",
    "note": ""
  },
  "totalPrice": 5000,
  "status": "pending",
  "paymentStatus": "pending",
  "paymentMethod": "cash",
  "createdAt": "2024-01-01 10:00:00",
  "updatedAt": "2024-01-01 10:00:00"
}
```

### Create Order
- **Endpoint**: `POST /api/orders`
- **File**: `api/orders.php`
- **Request**: Same structure as response above
- **Notes**: 
  - Checks if restaurant is open
  - Creates order with pending status
  - Auto-prints cash orders (if printer configured)

### Update Order Status
- **Endpoint**: `PUT /api/orders/:id/status`
- **File**: `api/orders.php`
- **Request**: `{ "status": "confirmed" }`
- **Valid statuses**: pending, confirmed, preparing, ready, delivered, cancelled

### Update Order (Generic)
- **Endpoint**: `PATCH /api/orders/:id`
- **File**: `api/orders.php`
- **Request**: `{ "status": "...", "paymentStatus": "..." }`

### Print Order (Admin)
- **Endpoint**: `POST /api/orders/:id/print`
- **File**: `api/orders.php`
- **Response**: `{ "success": true, "message": "Print command sent" }`
- **Note**: Only works if printer is configured on server

---

## Policies

### Get All Policies
- **Endpoint**: `GET /api/policies`
- **File**: `api/policies.php`
- **Response**: Array of policies

### Get Policy by ID
- **Endpoint**: `GET /api/policies/:id`
- **File**: `api/policies.php`
- **IDs**: `aszf`, `privacy`
- **Response**: 
```json
{
  "id": "aszf",
  "title": "Általános Szerződési Feltételek",
  "content": "...",
  "lastUpdated": "2024-01-01 10:00:00"
}
```

### Update Policy
- **Endpoint**: `PUT /api/policies/:id`
- **File**: `api/policies.php`
- **Request**: `{ "content": "new content..." }`

---

## Barion Payments

### Check Payment Status
- **Endpoint**: `POST /api/barion/check-payment`
- **File**: `api/barion.php`
- **Request**: `{ "paymentId": "barion-payment-id" }`
- **Response**: Barion API response
- **Notes**:
  - Queries Barion API for payment status
  - If status is "Succeeded", updates order to confirmed
  - Auto-prints confirmed Barion orders

### Barion Callback
- **Endpoint**: `POST /api/barion/callback`
- **File**: `api/barion.php`
- **Request**: Barion sends this automatically
- **Notes**:
  - Called by Barion when payment status changes
  - Updates order status based on payment result
  - Succeeded → confirmed
  - Failed/Canceled → cancelled

---

## Utilities

### Test Database Connection
- **Endpoint**: `GET /api/test`
- **File**: `api/test.php`
- **Response**: 
```json
{
  "status": "success",
  "message": "Database connection successful",
  "database": "c64634db",
  "tables": ["categories", "menu_items", "orders", ...],
  "php_version": "8.0.0",
  "pdo_available": true,
  "pdo_mysql_available": true
}
```
- **Use**: Test if server setup is correct

### Send Email (Contact Form)
- **Endpoint**: `POST /send-email`
- **File**: `send-email.php`
- **Request**: 
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here"
}
```
- **Response**: `{ "ok": true, "message": "Üzenet elküldve" }`

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (validation error)
- `403` - Forbidden (auth error, restaurant closed)
- `404` - Not found
- `500` - Server error

---

## CORS Headers

All endpoints include CORS headers via `.htaccess`:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Request/Response Format

- **Request Content-Type**: `application/json` (except file uploads)
- **Response Content-Type**: `application/json`
- **Character Encoding**: UTF-8
- **Date Format**: `YYYY-MM-DD HH:MM:SS` (MySQL DATETIME)

---

## Security Notes

1. All database queries use **prepared statements** (PDO)
2. Admin password is stored in `config.php` (change in production!)
3. File uploads are validated and sanitized
4. Input validation on all endpoints
5. HTTPS recommended for production

---

## Testing Endpoints

Use curl, Postman, or browser:

```bash
# Test database connection
curl https://yourdomain.com/api/test

# Get all foods
curl https://yourdomain.com/api/foods

# Get restaurant status
curl https://yourdomain.com/api/restaurant-status

# Create order (example)
curl -X POST https://yourdomain.com/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[...],"deliveryInfo":{...},"totalPrice":5000}'
```

---

For implementation details, see the PHP files in `public/api/`.

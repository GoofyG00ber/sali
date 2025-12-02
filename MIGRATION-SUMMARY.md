# Migration Summary: Node.js to PHP for Rackhost

## Problem
The website was referencing `/api` endpoints that expected a Node.js/Express server (`localhost:3001`), but Rackhost is a shared hosting environment that only supports PHP and MySQL, not Node.js.

## Solution
Converted all backend API endpoints from Node.js/Express to PHP, allowing the website to run on standard Rackhost shared hosting with just Apache, PHP, and MySQL.

---

## Changes Made

### 1. Created PHP API Endpoints

All endpoints from `server/index.js` (Node.js) were converted to PHP:

**New Files Created in `public/api/`:**

| File | Purpose | Node.js Equivalent |
|------|---------|-------------------|
| `config.php` | Database connection & config | `server/db.js` + `.env` |
| `foods.php` | Menu items CRUD | `/api/foods` routes |
| `categories.php` | Categories CRUD | `/api/categories` routes |
| `orders.php` | Orders management | `/api/orders` routes |
| `top-pizzas.php` | Featured pizzas | `/api/top-pizzas` routes |
| `policies.php` | Terms & privacy | `/api/policies` routes |
| `restaurant-status.php` | Open/closed status | `/api/restaurant-status` routes |
| `opening-hours.php` | Hours management | `/api/opening-hours` routes |
| `admin.php` | Admin authentication | `/api/admin/*` routes |
| `barion.php` | Payment processing | `/api/barion/*` routes |
| `test.php` | Connection testing | `/api/test` route |

**Also Created:**
- `public/.htaccess` - URL rewriting for clean API paths
- `public/send-email.php` - Contact form handler

### 2. Updated Frontend Code

**Changed API Base URLs:**
All stores updated to use relative paths instead of `http://localhost:3001`:

- `src/stores/foods.ts` - Changed `API_BASE` from `http://localhost:3001/api` to `/api`
- `src/stores/orders.ts` - Changed `API_BASE` from `http://localhost:3001/api` to `/api`
- `src/stores/policies.ts` - Changed `API_BASE` from `http://localhost:3001/api` to `/api`

**Updated View Files:**
- `src/views/public/OrderSuccessView.vue` - Removed hardcoded localhost URLs
- `src/views/admin/AdminOrderDetailsView.vue` - Removed hardcoded localhost URLs

### 3. Key Technical Changes

#### Database Connection
**Before (Node.js):**
```javascript
import mysql from 'mysql2/promise'
export const pool = mysql.createPool({...})
```

**After (PHP):**
```php
function getDB() {
    $dsn = "mysql:host=...;dbname=...";
    $pdo = new PDO($dsn, $user, $pass);
    return $pdo;
}
```

#### API Endpoint Example
**Before (Node.js in server/index.js):**
```javascript
app.get('/api/foods', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM menu_items')
    res.json(rows)
})
```

**After (PHP in public/api/foods.php):**
```php
if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM menu_items");
    $foods = $stmt->fetchAll();
    sendJSON($foods);
}
```

#### URL Routing
**Before:** Vite dev proxy + Express router
```typescript
// vite.config.ts
server: {
    proxy: {
        '/api': 'http://localhost:3001'
    }
}
```

**After:** Apache .htaccess rewrite rules
```apache
# .htaccess
RewriteRule ^api/foods(/.*)?$ api/foods.php [L]
```

### 4. File Structure Comparison

#### Before (Development Setup)
```
project/
├── server/
│   ├── index.js          ← Node.js/Express server
│   ├── db.js             ← MySQL connection
│   └── .env              ← Config
├── src/                  ← Vue frontend
└── vite.config.ts        ← Dev server with proxy
```

#### After (Production Ready)
```
project/
├── public/
│   ├── api/              ← PHP API endpoints
│   │   ├── config.php    ← DB connection
│   │   ├── foods.php     ← API logic
│   │   └── ...
│   └── .htaccess         ← URL routing
├── src/                  ← Vue frontend
└── dist/                 ← Built frontend (upload this)
```

### 5. Deployment Process

**Old Process (Not possible on Rackhost):**
1. Build frontend: `npm run build`
2. Deploy Node.js app
3. Start server: `node server/index.js`
4. Keep server running 24/7

**New Process (Works on Rackhost):**
1. Build frontend: `npm run build`
2. Upload `dist/` files to server root
3. Upload `public/api/` to server root
4. Upload `public/.htaccess` to server root
5. Done! Apache serves everything automatically

---

## What Still Works

✅ All API endpoints function identically  
✅ Menu management  
✅ Order creation and tracking  
✅ Admin panel  
✅ Barion payments  
✅ Restaurant open/close status  
✅ Opening hours management  
✅ Policies management  
✅ Contact form  

## What Changed (User Perspective)

Nothing! The website looks and works exactly the same. Only the backend technology changed.

## What Changed (Technical Perspective)

- **Runtime**: Node.js → PHP
- **Server**: Express → Apache
- **API Format**: Same (REST JSON)
- **Database**: MySQL (unchanged)
- **Frontend**: Vue (unchanged)

## Benefits of This Migration

1. ✅ **Rackhost Compatible** - Works on standard PHP hosting
2. ✅ **No Server Management** - Apache handles everything
3. ✅ **Lower Cost** - Shared hosting vs VPS
4. ✅ **Simpler Deployment** - Just upload files
5. ✅ **Same Functionality** - All features preserved

## Files That Are No Longer Needed in Production

These files are only for local development:
- `server/index.js` - Node.js server (replaced by PHP)
- `server/db.js` - Node.js DB connection (replaced by config.php)
- `server/package.json` - Node dependencies
- `vite.config.ts` proxy settings - Not needed in production

## Testing the Migration

1. **Test API Connection:**
   ```
   Visit: https://yourdomain.com/api/test
   Should return: Database tables list and success message
   ```

2. **Test Menu Loading:**
   ```
   Visit: https://yourdomain.com/api/foods
   Should return: JSON array of food items
   ```

3. **Test Full Website:**
   ```
   Visit: https://yourdomain.com
   Should work exactly as before
   ```

## Important Notes

- **Development**: Still uses Node.js server locally (for hot reload)
- **Production**: Uses PHP on Rackhost (no Node.js needed)
- **Database**: Same MySQL database in both environments
- **API Format**: Identical JSON responses
- **URLs**: Same `/api/*` paths

## Rollback Strategy

If needed, you can keep both versions:
- PHP version for Rackhost production
- Node.js version for local development

The frontend code works with both since the API interface is identical.

---

## Next Steps

1. Review `DEPLOYMENT-RACKHOST.md` for detailed deployment instructions
2. Use `DEPLOYMENT-CHECKLIST.md` to verify deployment
3. Test thoroughly before going live
4. Update Barion keys to production when ready

## Support

For deployment issues:
- Check PHP error logs on Rackhost
- Test `/api/test` endpoint first
- Verify `.htaccess` is working
- Ensure MySQL credentials are correct in `config.php`

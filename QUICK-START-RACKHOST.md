# Quick Start - Deploying to Rackhost

## 1. Build the Site
```bash
npm run build
```
This creates a `dist/` folder with your production files.

## 2. Upload These Files to Rackhost

### From `dist/` folder → Upload to `public_html/`:
- `index.html`
- `assets/` (entire folder)

### From `public/` folder → Upload to `public_html/`:
- `.htaccess`
- `api/` (entire folder with all 11 PHP files)
- `send-email.php`

### If you have product images:
- `static_images/` folder

## 3. Your Server Structure Should Look Like This:
```
public_html/
├── index.html          ← from dist/
├── .htaccess           ← from public/
├── assets/             ← from dist/
├── api/                ← from public/
│   ├── config.php
│   ├── foods.php
│   ├── categories.php
│   ├── orders.php
│   ├── top-pizzas.php
│   ├── policies.php
│   ├── restaurant-status.php
│   ├── opening-hours.php
│   ├── admin.php
│   ├── barion.php
│   └── test.php
├── send-email.php      ← from public/
└── static_images/      ← your images
```

## 4. Test It

Visit: `https://yourdomain.com/api/test`

You should see:
```json
{
  "status": "success",
  "message": "Database connection successful",
  "tables": ["categories", "menu_items", "orders", ...]
}
```

## 5. Visit Your Site

Go to: `https://yourdomain.com`

Your website should load with all menu items from the database!

---

## Important Files

### `public/api/config.php`
Contains your database credentials:
```php
define('DB_HOST', 'mysql.rackhost.hu');
define('DB_USER', 'c64634sali');
define('DB_PASS', 'asdfasmc123');
define('DB_NAME', 'c64634db');
define('ADMIN_PASSWORD', 'NagyonPizza123');
```

⚠️ **Change the admin password before going live!**

---

## Troubleshooting

### "Cannot connect to database"
- Check credentials in `api/config.php`
- Verify MySQL is running
- Test with phpMyAdmin

### "404 Not Found" on API calls
- Make sure `.htaccess` is uploaded
- Check if it's in the root (`public_html/`)
- Verify mod_rewrite is enabled

### Images not showing
- Upload `static_images/` folder
- Check folder permissions (755)
- Verify image paths in database

### Website is blank
- Check browser console for errors
- Verify all files from `dist/assets/` are uploaded
- Check `index.html` is in root

---

## That's It!

Your site now runs on Rackhost with:
- ✅ PHP backend (no Node.js needed)
- ✅ MySQL database
- ✅ Apache serving everything
- ✅ All features working

For detailed information, see:
- `DEPLOYMENT-RACKHOST.md` - Full deployment guide
- `DEPLOYMENT-CHECKLIST.md` - Step-by-step checklist
- `MIGRATION-SUMMARY.md` - What changed and why

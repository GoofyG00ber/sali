# Deployment Guide for Rackhost

This guide explains how to deploy the Sali Pizza website to Rackhost shared hosting with PHP and MySQL.

## Overview

The application has been converted from a Node.js/Express backend to PHP to work on Rackhost shared hosting. All API endpoints are now PHP files that directly query the MySQL database.

## Prerequisites

- Rackhost hosting account with:
  - PHP 7.4+ support
  - MySQL database access
  - `.htaccess` support (mod_rewrite enabled)
- MySQL database credentials (already in `server/.env`)

## Database Setup

Your MySQL database is already configured:
- Host: `mysql.rackhost.hu`
- Database: `c64634db`
- User: `c64634sali`
- Password: `asdfasmc123`

Make sure all required tables exist:
- `categories`
- `menu_items`
- `item_prices`
- `orders`
- `order_items`
- `top_pizzas`
- `policies`
- `settings`
- `open_hours`

## Build the Frontend

1. Build the production frontend:
```bash
npm run build
```

This creates optimized files in the `dist/` folder.

## Files to Upload to Rackhost

Upload the following to your Rackhost web root (typically `public_html/` or `www/`):

### From `dist/` folder (built frontend):
- `index.html`
- `assets/` (entire folder)
- `static_images/` (your product images)

### From `public/` folder (API endpoints):
- `.htaccess`
- `api/` (entire folder with all PHP files)
- `send-email.php`

### API Files Structure:
```
public_html/
├── index.html
├── .htaccess
├── assets/
│   └── (built JS/CSS files)
├── static_images/
│   └── (product images)
├── api/
│   ├── config.php          # Database config & credentials
│   ├── foods.php           # Menu items endpoints
│   ├── categories.php      # Categories endpoints
│   ├── orders.php          # Orders endpoints
│   ├── top-pizzas.php      # Top pizzas endpoints
│   ├── policies.php        # Policies endpoints
│   ├── restaurant-status.php  # Open/closed status
│   ├── opening-hours.php   # Opening hours management
│   ├── admin.php           # Admin auth endpoints
│   └── barion.php          # Barion payment endpoints
└── send-email.php          # Contact form
```

## Update Database Credentials

Edit `public/api/config.php` on the server if database credentials need to change:

```php
define('DB_HOST', 'mysql.rackhost.hu');
define('DB_USER', 'c64634sali');
define('DB_PASS', 'asdfasmc123');
define('DB_NAME', 'c64634db');
```

## Testing the Deployment

1. Visit your website URL (e.g., `https://yourdomain.com`)
2. Test menu loading (should fetch from MySQL)
3. Test order creation
4. Test admin panel login at `/admin`

## API Endpoints

All endpoints now work as PHP files:

- `GET /api/foods` - Get all menu items
- `GET /api/categories` - Get all categories
- `GET /api/orders` - Get all orders (admin)
- `POST /api/orders` - Create new order
- `GET /api/restaurant-status` - Check if restaurant is open
- `POST /api/barion/check-payment` - Check Barion payment status
- And more...

The `.htaccess` file handles URL rewriting so `/api/foods` routes to `/api/foods.php`.

## Important Notes

### No Node.js Server Needed
The PHP files replace the Node.js server completely. You don't need to run `npm start` or any server process on Rackhost.

### CORS is Enabled
The `.htaccess` file includes CORS headers to allow API access.

### Database Connection
All PHP files use PDO with prepared statements for secure database access.

### Image Uploads
Product images are stored in `/static_images/` folder. Make sure this folder is writable (chmod 755 or 775).

### Admin Password
Admin password is stored in `config.php`. Change `ADMIN_PASSWORD` constant to update it.

### Barion Payments
- Test mode: `https://api.test.barion.com`
- Production: Change to `https://api.barion.com` in `config.php`
- Update POS Key and Pixel Key in `config.php`

### Email Configuration
The `send-email.php` uses PHP's `mail()` function. For production, consider using SMTP or an email service.

## Troubleshooting

### "Database connection failed"
- Verify MySQL credentials in `config.php`
- Check if MySQL user has proper permissions
- Ensure database name is correct

### "404 Not Found" for API calls
- Verify `.htaccess` file is uploaded
- Check if mod_rewrite is enabled on server
- Ensure RewriteEngine is On

### Images not loading
- Check `/static_images/` folder permissions (755)
- Verify image paths in database start with `/static_images/`

### Orders not appearing
- Check `orders` table in MySQL
- Verify restaurant is "open" (check `settings` table)
- Check browser console for API errors

## Development vs Production

### Development (Local)
- Uses Vite dev server with proxy
- API calls go through Vite proxy to Node.js server
- Hot module reload enabled

### Production (Rackhost)
- Static files served by Apache
- API calls go directly to PHP files
- No Node.js or build process needed on server

## Security Checklist

- [ ] Change admin password in production
- [ ] Use HTTPS for the website
- [ ] Keep database credentials secure
- [ ] Set proper file permissions (644 for files, 755 for directories)
- [ ] Enable error logging (don't display errors to users)
- [ ] Update Barion to production API key
- [ ] Validate all user inputs in PHP

## Backup

Regularly backup:
1. MySQL database (via phpMyAdmin or mysqldump)
2. `/static_images/` folder (product images)
3. `config.php` (contains credentials)

## Support

For Rackhost specific issues:
- Contact Rackhost support
- Check Rackhost PHP version and extensions
- Verify MySQL connection limits

For application issues:
- Check Apache error logs
- Enable PHP error reporting temporarily
- Test API endpoints with Postman or curl

# Deployment Checklist

## Pre-Deployment

- [ ] Run `npm run build` to create production build
- [ ] Verify `dist/` folder is created with all assets
- [ ] Check database credentials in `public/api/config.php`
- [ ] Update admin password in `public/api/config.php`
- [ ] Update Barion POS Key for production (if going live)
- [ ] Test locally to ensure build works

## Files to Upload

### Upload from `dist/` folder to server root:
- [ ] `index.html`
- [ ] `assets/` folder (all files)
- [ ] `static_images/` folder (if you have product images)

### Upload from `public/` folder to server root:
- [ ] `.htaccess`
- [ ] `api/` folder (all PHP files)
- [ ] `send-email.php`

### File Structure on Server:
```
public_html/
├── index.html              ← from dist/
├── .htaccess               ← from public/
├── assets/                 ← from dist/
│   └── *.js, *.css files
├── static_images/          ← from public/ or dist/
│   └── product images
├── api/                    ← from public/api/
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
└── send-email.php          ← from public/
```

## Post-Deployment Testing

### 1. Test Database Connection
- [ ] Visit: `https://yourdomain.com/api/test`
- [ ] Should show JSON with database tables and success message
- [ ] Verify all expected tables are listed

### 2. Test Website
- [ ] Visit: `https://yourdomain.com`
- [ ] Website loads correctly
- [ ] Menu items are displayed
- [ ] Images load properly

### 3. Test Menu
- [ ] Navigate to Menu page
- [ ] Categories load
- [ ] Food items display with prices
- [ ] Images show correctly

### 4. Test Cart & Orders
- [ ] Add items to cart
- [ ] Cart widget updates correctly
- [ ] Proceed to checkout
- [ ] Fill order form
- [ ] Submit order (test with cash payment first)

### 5. Test Admin Panel
- [ ] Visit: `https://yourdomain.com/admin`
- [ ] Login with admin password
- [ ] View orders list
- [ ] View order details
- [ ] Change order status
- [ ] Test food management (create, edit, delete)

### 6. Test Restaurant Status
- [ ] Test opening hours display
- [ ] Test manual open/close toggle in admin
- [ ] Verify orders are blocked when closed

### 7. Test Barion Payments (if enabled)
- [ ] Create test order with Barion payment
- [ ] Complete payment on Barion test page
- [ ] Verify order status updates to "confirmed"
- [ ] Check payment appears in Barion dashboard

## Common Issues & Fixes

### API returns 404
- Check `.htaccess` is uploaded and working
- Verify mod_rewrite is enabled on server
- Check file paths are correct

### Database connection fails
- Verify MySQL credentials in `config.php`
- Check MySQL server hostname
- Ensure database user has proper permissions
- Test connection via phpMyAdmin

### Images not loading
- Check `/static_images/` folder exists
- Verify folder permissions (755)
- Check image paths in database

### Blank page or errors
- Enable error reporting temporarily in PHP
- Check Apache error logs
- Verify PHP version is 7.4+
- Ensure all required PHP extensions are installed

### CORS errors in browser console
- Verify `.htaccess` CORS headers are set
- Check if mod_headers is enabled
- Test with browser dev tools network tab

## Security Post-Deployment

- [ ] Change default admin password
- [ ] Verify HTTPS is working
- [ ] Check file permissions (644 for files, 755 for directories)
- [ ] Disable PHP error display (log errors instead)
- [ ] Set up regular database backups
- [ ] Test SQL injection protection
- [ ] Verify XSS protection on forms

## Optional Enhancements

- [ ] Set up CDN for assets
- [ ] Enable Gzip compression
- [ ] Set up caching headers
- [ ] Add monitoring/analytics
- [ ] Configure proper email sending (SMTP)
- [ ] Set up automated backups

## Rollback Plan

If something goes wrong:
1. Keep backup of previous version
2. Have database backup ready
3. Can quickly revert by uploading old files
4. Test on staging environment first if possible

## Support Contacts

- **Hosting Support**: Rackhost customer service
- **Developer**: Check application logs and error messages
- **Database**: Use phpMyAdmin for direct access

---

## Quick Deploy Commands

```bash
# Build the frontend
npm run build

# The dist/ folder now contains your production-ready files
# Upload to server via FTP, SFTP, or file manager
```

## Verification URLs

After deployment, test these URLs:

- Main site: `https://yourdomain.com`
- API test: `https://yourdomain.com/api/test`
- Menu API: `https://yourdomain.com/api/foods`
- Categories API: `https://yourdomain.com/api/categories`
- Admin panel: `https://yourdomain.com/admin`

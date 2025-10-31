# Admin System - Quick Start Guide

## 🎯 What Was Created

### 1. Authentication System
- **`config/admin-credentials.ts`** - Secure password storage (gitignored)
- **`config/admin-credentials.template.ts`** - Template for credentials
- **`src/stores/auth.ts`** - Pinia store for authentication
  - Login/logout functionality
  - Brute-force protection (5 attempts, 5-minute lockout)
  - Session management

### 2. Food Management System
- **`server/food-server.js`** - Express API server with full CRUD
  - Runs on port 3001
  - RESTful endpoints for foods and categories
  - Reads/writes to `public/routes/menu.json`
- **`src/stores/foods.ts`** - Pinia store for food operations
  - Create, read, update, delete foods
  - Toggle active/inactive status
  - Category management

### 3. Admin Interface
- **`src/views/admin/AdminView.vue`** - Complete admin panel
  - Login screen with security
  - Dashboard with statistics
  - Food management table with CRUD
  - Password change interface
  - Responsive design with Tailwind CSS

### 4. Configuration
- **`src/router/index.ts`** - Updated with admin route
- **`package.json`** - New scripts:
  - `npm run dev:all` - Run both servers
  - `npm run food-server` - Run API server only
- **`.gitignore`** - Added admin credentials

### 5. Documentation
- **`README-admin.md`** - Complete documentation
- **`setup-admin.sh`** - Setup automation script

## 🚀 Quick Start

### Option 1: Run Everything Together
```bash
npm run dev:all
```

### Option 2: Run Separately
```bash
# Terminal 1
npm run dev

# Terminal 2  
npm run food-server
```

### Access Admin Panel
1. Open: `http://localhost:5173/admin`
2. Password: `admin123`
3. Change password immediately!

## ✨ Features

### Dashboard
- Total foods count
- Active foods count
- Total categories

### Food Management
- ✅ **Create** - Add new food items with multiple price tiers
- 📖 **Read** - View all foods in sortable table
- ✏️ **Update** - Edit food details, prices, categories
- 🗑️ **Delete** - Remove foods (with confirmation)
- 🔄 **Toggle** - Activate/deactivate without deletion

### Security
- Password-protected access
- Brute-force protection
- Session-based authentication
- Gitignored credentials

### Password Management
- Change password from admin panel
- Validates current password
- Requires 6+ character passwords

## 🔧 API Endpoints

Base URL: `http://localhost:3001/api`

- `GET /menu` - Full menu data
- `GET /foods` - All foods (flattened)
- `GET /foods/:id` - Single food
- `POST /foods` - Create food
- `PUT /foods/:id` - Update food
- `DELETE /foods/:id` - Delete food
- `PATCH /foods/:id/toggle-active` - Toggle status
- `GET /categories` - All categories

## 📝 Food Structure

```json
{
  "id": 1,
  "title": "Pizza Margherita",
  "description": "Tomato sauce, mozzarella",
  "prices": [
    { "label": "26 cm", "price": 2990 },
    { "label": "32 cm", "price": 3590 },
    { "label": "45 cm", "price": 5390 }
  ],
  "badges": ["classic"],
  "image": "/placeholder.png",
  "active": true,
  "categoryId": 1
}
```

## 🛡️ Security Notes

### Current Implementation (Development)
- Simple password comparison
- Credentials in gitignored file
- Session-based auth

### Production Recommendations
1. **Implement bcrypt hashing**
   ```bash
   npm install bcryptjs @types/bcryptjs
   ```

2. **Use environment variables**
   ```bash
   # .env
   ADMIN_PASSWORD_HASH=...
   ```

3. **Add JWT authentication**
4. **Use HTTPS only**
5. **Add rate limiting**
6. **Move to proper database**

## 🎨 Customization

### Change Admin Password (Code)
Edit `config/admin-credentials.ts`:
```typescript
verifyPassword: async (password: string): Promise<boolean> => {
  const correctPassword = 'YOUR_NEW_PASSWORD';
  return password === correctPassword;
}
```

### Change Admin Password (UI)
1. Login to admin panel
2. Click "Change Password" in sidebar
3. Enter current and new password
4. Submit

### Modify UI Colors/Styles
Edit `src/views/admin/AdminView.vue` - uses Tailwind classes

### Add New Admin Sections
1. Add view to `currentView` type
2. Add sidebar button
3. Create view section in template
4. Add necessary logic

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

### Login Not Working
1. Check `config/admin-credentials.ts` exists
2. Clear session: `sessionStorage.clear()` in browser console
3. Check browser console for errors

### CRUD Not Working
1. Ensure food server is running on port 3001
2. Check `public/routes/menu.json` permissions
3. Check browser network tab for API errors

### Changes Not Saving
1. Verify food server has write permissions
2. Check server console for errors
3. Validate JSON structure in menu.json

## 📊 File Sizes
- AdminView.vue: ~500 lines
- food-server.js: ~240 lines
- foods.ts: ~165 lines
- auth.ts: ~70 lines

## 🔗 Related Files
- Menu data: `public/routes/menu.json`
- Email server: `server/send-email.js`
- Main app: `src/App.vue`
- Router: `src/router/index.ts`

---

**Created**: 2025-10-30  
**Default Password**: admin123 ⚠️ CHANGE THIS!

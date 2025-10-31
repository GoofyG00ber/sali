# Admin System Documentation

## Overview
A secure admin panel with authentication and full CRUD operations for food items.

## Features
- 🔐 **Secure Login System**: Password-protected admin access with brute-force protection
- 📊 **Dashboard**: Overview of total foods, active items, and categories
- 🍕 **Food Management**: Complete CRUD operations (Create, Read, Update, Delete)
- ✅ **Active/Inactive Toggle**: Temporarily disable food items without deletion
- 🔒 **Password Management**: Change admin password from within the panel
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Servers
Run both the Vue app and the food API server:
```bash
npm run dev:all
```

Or run them separately:
```bash
# Terminal 1 - Vue app
npm run dev

# Terminal 2 - Food API server
npm run food-server
```

### 3. Access Admin Panel
Navigate to: `http://localhost:5173/admin`

**Default Login Credentials:**
- Password: `admin123`

⚠️ **IMPORTANT**: Change the default password immediately after first login!

## Architecture

### File Structure
```
config/
  admin-credentials.ts    # Password configuration (gitignored)
src/
  stores/
    auth.ts              # Authentication state management
    foods.ts             # Food items CRUD operations
  views/
    admin/
      AdminView.vue      # Main admin panel component
  router/
    index.ts            # Routes with admin route
server/
  food-server.js        # Express API server for CRUD
```

### Security Features

1. **Password Protection**: Credentials stored in separate gitignored file
2. **Brute-Force Protection**: Account locks after 5 failed login attempts (5-minute lockout)
3. **Session Management**: Uses sessionStorage for authentication state
4. **API Separation**: Food server runs on separate port (3001)

### API Endpoints

The food server (`http://localhost:3001/api`) provides:

- `GET /menu` - Get all menu data
- `GET /foods` - Get all food items (flattened)
- `GET /foods/:id` - Get single food item
- `POST /foods` - Create new food item
- `PUT /foods/:id` - Update food item
- `DELETE /foods/:id` - Delete food item
- `PATCH /foods/:id/toggle-active` - Toggle active status
- `GET /categories` - Get all categories

### Admin Panel Sections

#### 1. Dashboard
- Total foods count
- Active foods count
- Categories count

#### 2. Manage Foods
- **View All Foods**: Sortable table with all food items
- **Add New Food**: Create new food items with multiple price tiers
- **Edit Food**: Modify existing food details
- **Toggle Status**: Activate/deactivate foods without deletion
- **Delete Food**: Permanently remove food items (with confirmation)

#### 3. Change Password
- Update admin password
- Validates old password before allowing change
- Requires 6+ character passwords

## Food Item Structure

```typescript
{
  id: number,
  title: string,
  description: string,
  prices: [
    { label: "26 cm", price: 3290 },
    { label: "32 cm", price: 3890 },
    { label: "45 cm", price: 5890 }
  ],
  badges: ["újdonság", "veggie"],
  image: "/placeholder.png",
  active: true,
  categoryId: 1
}
```

## Changing the Admin Password

### In Code (Before First Run)
Edit `config/admin-credentials.ts`:
```typescript
export const ADMIN_CONFIG = {
  verifyPassword: async (password: string): Promise<boolean> => {
    const correctPassword = 'YOUR_NEW_PASSWORD_HERE';
    return password === correctPassword;
  }
}
```

### In Admin Panel
1. Login to admin panel
2. Navigate to "Change Password" section
3. Enter current password
4. Enter new password (6+ characters)
5. Confirm new password

**Note**: For production, implement proper bcrypt hashing!

## Production Deployment

⚠️ **Before deploying to production:**

1. **Implement Proper Password Hashing**
   - Install bcryptjs: `npm install bcryptjs`
   - Hash passwords properly in `config/admin-credentials.ts`
   - Store hashed passwords securely

2. **Environment Variables**
   - Move credentials to environment variables
   - Use `.env` file for configuration

3. **HTTPS**
   - Always use HTTPS in production
   - Secure cookie settings

4. **Database**
   - Move from JSON file to proper database
   - Use PostgreSQL, MongoDB, or similar

5. **API Security**
   - Add JWT authentication
   - Implement rate limiting
   - Add CORS restrictions
   - Add request validation

## Development Tips

### Adding New Food Categories
Edit `public/routes/menu.json` to add new categories:
```json
{
  "categories": [
    {
      "id": 10,
      "title": "New Category",
      "image": "/category-image.png",
      "items": []
    }
  ]
}
```

### Customizing the UI
The admin panel uses Tailwind CSS. Modify classes in `AdminView.vue` to customize appearance.

### Adding New Admin Features
1. Add new view option to `currentView` ref
2. Create button in sidebar navigation
3. Implement view section in main content area
4. Add necessary store methods if needed

## Troubleshooting

### Food Server Won't Start
- Check if port 3001 is already in use
- Ensure `menu.json` file exists
- Check file permissions

### Login Not Working
- Verify `config/admin-credentials.ts` exists
- Check browser console for errors
- Clear sessionStorage: `sessionStorage.clear()`

### CRUD Operations Failing
- Ensure food server is running on port 3001
- Check browser console for API errors
- Verify `menu.json` has write permissions

### Changes Not Persisting
- Confirm food server has write access to `menu.json`
- Check server console for errors
- Verify JSON file structure is valid

## Support

For issues or questions:
1. Check browser console for errors
2. Check food server terminal for logs
3. Verify all services are running
4. Review this documentation

---

**Last Updated**: 2025-10-30

# Understanding the Development vs Production Setup

## 🚨 Important: You're Seeing 404 Errors Because...

You're trying to test the **production build** (`dist/index.html`) which expects:
- PHP server (Apache with mod_rewrite)
- The API files to be accessible at `/api/*`

But you're viewing it:
- Without a server (just opening the file)
- Or with a simple HTTP server that doesn't have PHP

## How It Works

### Development (What You Should Use Locally)

**Run this:**
```bash
npm run dev
```

**What happens:**
- Vite dev server runs on `http://localhost:5173`
- Node.js API server runs on `http://localhost:3001`
- Vite proxies `/api` calls to Node.js server
- Everything works locally with hot reload

**Start the Node.js server:**
```bash
cd server
npm install  # if not already done
node index.js
```

### Production (For Rackhost Deployment Only)

**Build:**
```bash
npm run build
```

**What to upload:**
- `dist/` contents → Upload to Rackhost
- `public/api/` → Upload to Rackhost
- `public/.htaccess` → Upload to Rackhost
- `public/send-email.php` → Upload to Rackhost

**On Rackhost:**
- Apache serves `index.html`
- `.htaccess` routes `/api/*` to PHP files
- PHP files connect to MySQL database

## The Problem You're Having

❌ **You can't test the production build locally without PHP installed**

The production build (`dist/`) expects:
1. A web server (Apache/Nginx)
2. PHP support
3. `.htaccess` rewrite rules

When you open `dist/index.html` directly or with a simple server:
- No PHP interpreter available
- No `.htaccess` support
- `/api/*` requests return 404

## Solutions

### Option 1: Use Development Mode (Recommended)

**Terminal 1 - Start Node.js API server:**
```bash
cd server
node index.js
```

**Terminal 2 - Start Vite dev server:**
```bash
npm run dev
```

**Then visit:** `http://localhost:5173`

This gives you the full working site locally!

### Option 2: Install PHP Locally (Advanced)

If you want to test the exact production setup:

```bash
# On Arch Linux
sudo pacman -S php

# Then run
./test-production.sh
```

### Option 3: Deploy to Rackhost and Test There

The production PHP files are **specifically for Rackhost**. They will work perfectly when deployed there.

## Current Situation

You built the production files with `npm run build`, which is correct! But:

✅ **Build is successful** - `dist/` folder is ready  
✅ **PHP files are ready** - `public/api/` is ready  
❌ **Can't test locally** - Need either Node.js server (dev mode) or PHP installed  

## What To Do Now

### For Local Development:

1. Keep Node.js server running:
```bash
cd server
node index.js
```

2. In another terminal:
```bash
npm run dev
```

3. Visit `http://localhost:5173`

### For Rackhost Deployment:

1. Build is already done ✓
2. Follow `QUICK-START-RACKHOST.md`
3. Upload files to Rackhost
4. Test on your actual domain

## Why Two Different Setups?

**Development:**
- Fast hot reload
- Better debugging
- Node.js features
- Easy local database

**Production (Rackhost):**
- No Node.js support
- Only PHP + MySQL
- Shared hosting environment
- Must use PHP instead

## TL;DR

**Right now, to test locally:**
```bash
# Terminal 1
cd server && node index.js

# Terminal 2  
npm run dev

# Visit: http://localhost:5173
```

**To deploy to Rackhost:**
- Use the already-built `dist/` folder
- Upload along with `public/api/` and `public/.htaccess`
- Follow `QUICK-START-RACKHOST.md`

The PHP files will work perfectly on Rackhost, but you need Node.js for local testing.

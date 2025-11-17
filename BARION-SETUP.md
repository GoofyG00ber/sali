# Barion Payment Integration Setup Guide

This guide explains how to properly configure Barion payment integration to receive payment status updates from Barion's test system.

## Problem

The Barion payment system needs to send callback notifications to your server when payment status changes. However, during local development, your server runs on `localhost` which is not accessible from the internet, so Barion cannot reach your callback URL.

## Solution

We've implemented a **dual approach** for handling payment status updates:

### 1. Frontend Polling (Always Works)
After the user returns from Barion payment, the frontend automatically polls the Barion API through your backend server to check payment status. This works regardless of callback URL accessibility.

**How it works:**
- User completes payment on Barion
- Barion redirects back to your site with `paymentId` in URL
- Frontend automatically checks payment status every 3 seconds
- Updates order status based on Barion's response
- Continues for up to 2 minutes or until payment is confirmed/failed

### 2. Server Callback (Optional, for Production)
Barion can also send instant notifications to your server when payment status changes. This requires a publicly accessible URL.

---

## Setup for Local Development

### Option A: Use Frontend Polling Only (Easiest)

The system works out-of-the-box with frontend polling. No additional setup needed for testing!

1. Start your servers:
   ```powershell
   cd server
   node index.js
   
   # In another terminal
   npm run dev
   ```

2. Test payment flow:
   - Create an order with Barion payment
   - Complete payment on Barion test site
   - Watch the console - you'll see polling checks
   - Order status will update automatically

**Pros:** No configuration needed, works immediately
**Cons:** Slight delay (up to 3 seconds) in status update

---

### Option B: Enable Server Callbacks with Ngrok (Recommended for Testing)

For instant status updates via Barion callbacks, expose your local server using a tunnel.

#### Step 1: Install Ngrok

Download from: https://ngrok.com/download

Or with Chocolatey:
```powershell
choco install ngrok
```

#### Step 2: Create Ngrok Tunnel

Start your backend server first:
```powershell
cd server
node index.js
```

Then in another terminal, create a tunnel to port 3001:
```powershell
ngrok http 3001
```

You'll see output like:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3001
```

#### Step 3: Configure Environment Variable

Create a `.env` file in the project root:
```env
VITE_BARION_CALLBACK_URL=https://abc123.ngrok.io/api/barion/callback
```

Replace `abc123.ngrok.io` with your actual ngrok URL.

**Note:** You can also use https://webhook.site to generate a unique URL for testing callbacks without running ngrok.

#### Step 4: Restart Frontend

```powershell
npm run dev
```

Now Barion can reach your callback URL and send instant notifications!

**Note:** Ngrok URLs change each time you restart (unless you have a paid account). Update `.env` each time.

---

### Option C: Other Tunneling Services

Alternative to ngrok:

#### Cloudflared (Free, Stable URLs)
```powershell
# Install
choco install cloudflared

# Create tunnel
cloudflared tunnel --url http://localhost:3001
```

#### LocalTunnel
```powershell
npm install -g localtunnel
lt --port 3001
```

---

## Setup for Production

### Step 1: Deploy Backend to Cloud

Deploy your `server/` directory to a cloud service with a public URL:
- **Heroku**: https://www.heroku.com
- **Railway**: https://railway.app
- **Render**: https://render.com
- **DigitalOcean**: https://www.digitalocean.com

### Step 2: Configure Callback URL

Set the environment variable on your production server:
```env
VITE_BARION_CALLBACK_URL=https://yourdomain.com/api/barion/callback
```

### Step 3: Update Barion Credentials

In `src/views/public/OrderView.vue`, update:
```typescript
const barionData = {
  POSKey: 'YOUR_PRODUCTION_POS_KEY',  // From Barion dashboard
  // ...
}
```

Change endpoint from test to production:
```typescript
const barionEndpoint = 'https://api.barion.com/v2/Payment/Start'  // Remove .test
```

In `server/index.js`, update the check-payment endpoint:
```javascript
const barionResponse = await fetch('https://api.barion.com/v2/Payment/GetPaymentState', {
  // Remove .test from URL
```

### Step 4: Test in Production

1. Make a test payment
2. Check server logs for callback notifications
3. Verify order status updates correctly

---

## How Payment Status Updates Work

### Payment Flow

```
1. User submits order
2. Order created with status: "pending"
3. User redirected to Barion payment page
4. User completes payment on Barion
5. Barion redirects user back to: /order-success?orderId=123&paymentId=abc

6a. FRONTEND POLLING (Always happens)
    - Frontend checks payment status every 3 seconds
    - Calls backend /api/barion/check-payment
    - Backend queries Barion GetPaymentState API
    - Updates database based on response
    
6b. SERVER CALLBACK (If URL is accessible)
    - Barion sends POST to /api/barion/callback
    - Server updates database immediately
    - No delay, instant update

7. Order status changes to "confirmed" or "cancelled"
8. Admin can see order in dashboard
```

### Barion Payment States

- **Prepared**: Payment created but not started
- **Started**: User landed on payment page
- **InProgress**: User is completing payment
- **Waiting**: Waiting for bank response
- **Succeeded**: ✅ Payment successful → Order confirmed
- **Canceled**: ❌ User cancelled → Order cancelled
- **Expired**: ❌ Payment timeout → Order cancelled
- **Failed**: ❌ Payment failed → Order cancelled

---

## Testing Payment Flow

### Test Cards (Barion Sandbox)

**Successful Payment:**
```
Card Number: 9900 1234 5678 0000
Expiry: Any future date
CVC: Any 3 digits
```

**Failed Payment:**
```
Card Number: 9900 1234 5678 0001
Expiry: Any future date
CVC: Any 3 digits
```

### Test Checklist

- [ ] Create order with Barion payment
- [ ] Redirected to Barion payment page
- [ ] Complete payment with test card
- [ ] Redirected back to success page
- [ ] Frontend polling starts automatically (check console)
- [ ] Order status updates to "confirmed" within 3-10 seconds
- [ ] Order appears in admin dashboard
- [ ] If using ngrok/callback: Check server logs for callback

---

## Debugging

### Frontend Console Logs

Check browser console for:
```
Barion Payment Request: {...}
Redirecting to Barion: https://...
Starting payment status polling...
Checking Barion payment status for: abc123
Barion payment state: Succeeded
```

### Backend Server Logs

Check server console for:
```
Checking Barion payment state for: abc123
Barion payment state: Succeeded
Barion callback received: { PaymentId, PaymentRequestId, State }
Payment 123 succeeded, marking as confirmed
```

### Common Issues

**Payment stays "pending":**
- Check if PaymentId is in URL after redirect
- Check browser console for errors
- Verify backend server is running
- Check backend logs for Barion API errors

**Callback not received:**
- Normal in local development without tunnel
- Frontend polling will handle it
- Check if VITE_BARION_CALLBACK_URL is set correctly
- Verify tunnel is running (ngrok/cloudflared)

**"Failed to check payment state" error:**
- Verify backend server is running on port 3001
- Check Barion POSKey is correct
- Ensure Barion test API is accessible

---

## Environment Variables

### Frontend (.env)
```env
# Optional: Public callback URL for Barion notifications
VITE_BARION_CALLBACK_URL=https://your-public-url.com/api/barion/callback
```

### Backend (server/.env or hosting platform)
```env
# Database connection
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourdb

# Optional: If needed for additional Barion config
BARION_POS_KEY=your-pos-key
```

---

## Security Considerations

### Development
- ✅ Using Barion sandbox (test.barion.com)
- ✅ Test POSKey only
- ✅ No real money involved

### Production
- [ ] Use production POSKey
- [ ] Switch to production endpoint (api.barion.com)
- [ ] Validate callback signatures (optional but recommended)
- [ ] Use HTTPS for all URLs
- [ ] Set proper CORS headers
- [ ] Rate limit callback endpoint
- [ ] Log all payment activities
- [ ] Implement webhook retry logic

---

## Support

### Barion Documentation
- Sandbox: https://docs.barion.com/Sandbox
- Payment Start: https://docs.barion.com/Payment-Start-v2
- Get Payment State: https://docs.barion.com/Payment-GetPaymentState-v2
- IPN/Callback: https://docs.barion.com/Callback_mechanism

### Barion Test Portal
- Login: https://test.barion.com
- Get POSKey from Settings > API Keys

---

## Quick Reference

### Start Everything (Local Dev)
```powershell
# Terminal 1: Backend
cd server
node index.js

# Terminal 2: Frontend
npm run dev

# Terminal 3 (Optional): Ngrok
ngrok http 3001
# Then update .env with ngrok URL
```

### Check Payment Status Manually
```powershell
# In browser console or via API client
fetch('http://localhost:3001/api/barion/check-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ paymentId: 'your-payment-id' })
}).then(r => r.json()).then(console.log)
```

---

**Last Updated**: November 14, 2025  
**Status**: ✅ Fully Functional with Frontend Polling + Optional Callbacks

# Shopping Cart & Order System Documentation

## Overview
Complete e-commerce functionality with session-based cart, order processing, and Barion payment integration.

## Features Added

### 1. **Session-Based Shopping Cart**
- Persistent across page refreshes (uses sessionStorage)
- Add/remove items with quantity control
- Real-time price calculation
- Item counter badge

### 2. **Policy Management (Admin)**
- ÁSZF (Terms & Conditions) editor
- Privacy Policy editor
- Rich text editing with Quill
- Auto-save timestamps
- HTML content storage

### 3. **Order Management**
- Pickup or delivery options
- Customer information collection
- Address management for delivery
- Order notes/special instructions
- Order status tracking (admin)

### 4. **Payment Integration**
- **Barion Payment Gateway** (Sandbox)
- Cash on delivery/pickup option
- Secure payment flow
- Order confirmation

### 5. **Admin Features**
- View all orders
- Update order status
- Update payment status
- View order details
- Edit ÁSZF and Privacy Policy with rich text editor

## File Structure

### Stores
```
src/stores/
├── cart.ts          # Shopping cart state management
├── orders.ts        # Order creation and management
├── policies.ts      # ÁSZF and Privacy Policy
├── foods.ts         # Food items (existing)
└── auth.ts          # Authentication (existing)
```

### Views
```
src/views/public/
├── OrderView.vue           # Checkout page
├── OrderSuccessView.vue    # Order confirmation
└── ...

src/views/admin/
└── AdminView.vue           # Extended with policies & orders
```

### Components
```
src/components/
└── KosarWidget.vue         # Updated cart widget
```

### Data Files
```
public/data/
├── policies.json    # ÁSZF and Privacy Policy storage
└── orders.json      # Orders database
```

### Server
```
server/
└── food-server.js   # Extended API with policies & orders endpoints
```

## API Endpoints

### Policies
- `GET /api/policies` - Get all policies
- `GET /api/policies/:type` - Get specific policy (aszf or privacy)
- `PUT /api/policies/:type` - Update policy content

### Orders
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id` - Update order status

## Usage Guide

### Customer Flow

#### 1. Browse Menu
Visit `/menu` to see available food items.

#### 2. Add to Cart
```typescript
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

// Add item to cart
cartStore.addItem(food, selectedPrice, quantity)
```

#### 3. View Cart
The `KosarWidget` component automatically displays cart items and total.

#### 4. Checkout
Navigate to `/order` to complete the purchase:
- Choose delivery method (pickup/delivery)
- Fill in customer information
- Provide delivery address (if delivery selected)
- Select payment method
- Submit order

#### 5. Payment
- **Barion**: Redirects to Barion payment gateway
- **Cash**: Order confirmed immediately

#### 6. Confirmation
After successful order, redirected to `/order-success` with order ID.

### Admin Flow

#### Managing Orders
1. Login to admin panel (`/admin`)
2. Click "📦 Orders" in sidebar
3. View all orders in table format
4. Update status via dropdown:
   - Pending → Confirmed → Preparing → Ready → Delivered
5. Click "View" to see full order details

#### Editing Policies

##### ÁSZF
1. Click "📄 ÁSZF" in admin sidebar
2. Edit content using rich text editor
3. Click "💾 Save ÁSZF"
4. Changes saved with timestamp

##### Privacy Policy
1. Click "🔐 Privacy Policy" in admin sidebar
2. Edit content using rich text editor
3. Click "💾 Save Privacy Policy"
4. Changes saved with timestamp

## Barion Payment Integration

### Sandbox Setup

1. **Get Barion Test Account**
   - Register at: https://test.barion.com
   - Get your POS Key from dashboard

2. **Configure Barion**
   Edit `src/views/public/OrderView.vue`:
   ```typescript
   const barionData = {
     POSKey: 'YOUR_BARION_POS_KEY', // Replace
     Payee: 'YOUR_EMAIL@example.com', // Replace
     // ...
   }
   ```

3. **Test Cards**
   Use Barion test cards:
   - **Successful**: 9900 1234 5678 0000
   - **Failed**: 9900 1234 5678 0001

4. **Endpoints**
   - **Sandbox**: `https://api.test.barion.com/v2/Payment/Start`
   - **Production**: `https://api.barion.com/v2/Payment/Start`

### Payment Flow

1. Customer fills order form
2. Selects "Online Payment (Barion)"
3. Clicks "Proceed to Payment"
4. System creates order in database
5. Initiates Barion payment with order details
6. Redirects to Barion gateway
7. Customer completes payment
8. Barion redirects back to success page
9. Callback updates payment status

## Cart Store API

```typescript
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

// Properties
cart.items          // Array of cart items
cart.itemCount      // Total number of items
cart.totalPrice     // Total price in Ft
cart.isEmpty        // Boolean if cart is empty

// Methods
cart.addItem(food, selectedPrice, quantity)
cart.removeItem(foodId, priceLabel)
cart.updateQuantity(foodId, priceLabel, quantity)
cart.clearCart()
cart.loadCart()     // Load from sessionStorage
```

## Orders Store API

```typescript
import { useOrdersStore } from '@/stores/orders'

const orders = useOrdersStore()

// Create order
const order = await orders.createOrder({
  items: [...],
  deliveryType: 'pickup' | 'delivery',
  deliveryInfo: {...},
  totalPrice: 5000,
  paymentMethod: 'barion' | 'cash'
})

// Fetch orders (admin)
await orders.fetchOrders()

// Get specific order
const order = await orders.getOrder(orderId)

// Update status
await orders.updateOrderStatus(orderId, status, paymentStatus)
```

## Policies Store API

```typescript
import { usePoliciesStore } from '@/stores/policies'

const policies = usePoliciesStore()

// Fetch policies
await policies.fetchAszf()
await policies.fetchPrivacy()

// Update policies
await policies.updateAszf(htmlContent)
await policies.updatePrivacy(htmlContent)

// Access content
console.log(policies.aszf.content)
console.log(policies.privacy.content)
```

## Order Object Structure

```typescript
{
  id: "ORD-1234567890-xyz",
  items: [
    {
      foodId: 1,
      foodTitle: "Pizza Margherita",
      priceLabel: "32 cm",
      price: 3590,
      quantity: 2
    }
  ],
  deliveryType: "delivery",
  deliveryInfo: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+36 20 123 4567",
    address: "Main Street 123",
    city: "Budapest",
    zip: "1011",
    note: "Ring the bell twice"
  },
  totalPrice: 7680,
  status: "confirmed",
  paymentStatus: "paid",
  paymentMethod: "barion",
  barionPaymentId: "...",
  createdAt: "2025-10-30T12:00:00.000Z",
  updatedAt: "2025-10-30T12:05:00.000Z"
}
```

## Security Considerations

### Current Implementation (Development)
- Session storage for cart (client-side)
- Simple API without authentication for orders
- Barion sandbox mode

### Production Recommendations

1. **Cart Security**
   - Validate all prices server-side
   - Prevent price manipulation
   - Add CSRF protection

2. **Order Security**
   - Add rate limiting
   - Validate customer data
   - Sanitize inputs
   - Add spam protection

3. **Payment Security**
   - Use production Barion endpoint
   - Implement proper callback validation
   - Verify payment signatures
   - Handle payment failures

4. **Data Protection**
   - Encrypt sensitive customer data
   - GDPR compliance for personal info
   - Secure storage for payment details
   - Regular backups of order data

## Quill Editor Features

The ÁSZF and Privacy Policy editors support:
- **Headers**: H1-H6
- **Text Formatting**: Bold, Italic, Underline, Strike
- **Lists**: Ordered and Unordered
- **Indentation**: Increase/Decrease
- **Alignment**: Left, Center, Right, Justify
- **Links**: Insert hyperlinks
- **Clean**: Remove formatting

## Troubleshooting

### Cart Not Persisting
```javascript
// Check sessionStorage
console.log(sessionStorage.getItem('cart'))

// Force reload
cartStore.loadCart()
```

### Orders Not Saving
- Verify food-server is running on port 3001
- Check `public/data/orders.json` file permissions
- Inspect browser console for API errors

### Barion Payment Fails
- Verify POS Key is correct
- Check Barion sandbox is accessible
- Ensure test card details are correct
- Review Barion response in console

### Policy Editor Not Loading
- Check if Quill CSS is loaded
- Verify policies.json exists
- Check API endpoints response

## Testing

### Test Cart Functionality
```bash
# Add item to cart
# Navigate to /order
# Fill form and submit
# Check public/data/orders.json
```

### Test Barion Payment (Sandbox)
1. Complete order form
2. Select "Online Payment (Barion)"
3. Use test card: 9900 1234 5678 0000
4. Complete payment
5. Verify redirect to success page

### Test Admin Features
1. Login to /admin
2. Navigate to Orders section
3. Change order status
4. Edit ÁSZF content
5. Save and verify timestamp updates

## Future Enhancements

### Recommended Features
- [ ] Email notifications for orders
- [ ] Order tracking for customers
- [ ] Inventory management
- [ ] Discount codes/coupons
- [ ] Customer accounts
- [ ] Order history
- [ ] Print receipt/invoice
- [ ] SMS notifications
- [ ] Delivery time estimation
- [ ] Restaurant busy status
- [ ] Multiple payment gateways
- [ ] Refund handling

## Support

For issues:
1. Check browser console for errors
2. Verify all servers are running
3. Check API responses in Network tab
4. Review store state in Vue DevTools

---

**Last Updated**: 2025-10-30  
**Version**: 1.0.0

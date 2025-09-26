# Payment Setup Guide

## 1. Create Environment File

Create a `.env.local` file in your project root with the following variables:

```bash
# Required for payments to work
RAZORPAY_KEY_ID="rzp_test_your_test_key_id"
RAZORPAY_KEY_SECRET="your_test_secret_key"

# This can be either of these two (both work now):
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_test_key_id"
# OR just use the server-side key (the API will handle it)

# Optional webhook secret
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
```

## 2. Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up/Login to your account
3. Go to Settings → API Keys
4. Generate a new key pair
5. Copy the Key ID and Key Secret

## 3. Test Mode vs Live Mode

- **Development**: Use keys starting with `rzp_test_`
- **Production**: Use keys starting with `rzp_live_`

## 4. Restart Your Development Server

After creating `.env.local`, restart your Next.js development server:

```bash
npm run dev
# or
yarn dev
```

## 5. Verify Setup

Check your browser console and server logs for any configuration errors. You should see:

- "Plan verified: { planName: ..., planPrice: ... }"
- "Razorpay order created successfully: { orderId: ... }"

## 6. Common Issues & Solutions

### Issue: "Payment service not configured"

**Solution**: Missing environment variables

- Check that `.env.local` exists and has the correct values
- Ensure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
- Restart your development server

### Issue: "Database service not configured"

**Solution**: Prisma connection issue

- Check your `DATABASE_URL` in `.env.local`
- Ensure MongoDB is running
- Run `npx prisma generate` if needed

### Issue: "Failed to create Razorpay order"

**Solution**: Invalid Razorpay credentials

- Verify your Razorpay keys are correct
- Check if you're using test keys for development
- Ensure your Razorpay account is active

### Issue: "Payment system is not ready"

**Solution**: Client-side configuration issue

- Check browser console for errors
- Verify the `/api/payments/razorpay-key` endpoint works
- Check network tab for failed requests

## 7. Test Payment Flow

1. **Create a payment plan** in admin panel (`/admin/payment-history`)
2. **Try to purchase** from user dashboard (`/dashboard/payment-history`)
3. **Check server logs** for detailed error messages
4. **Verify Razorpay order creation** in Razorpay dashboard

## 8. Debug Steps

1. **Check server logs** when making a payment request
2. **Verify environment variables** are loaded correctly
3. **Test the Razorpay key endpoint**: `GET /api/payments/razorpay-key`
4. **Check browser console** for client-side errors
5. **Verify payment plan data** in the database

## 9. Environment Variable Priority

The system now checks for Razorpay keys in this order:

1. `NEXT_PUBLIC_RAZORPAY_KEY_ID` (client-side)
2. `RAZORPAY_KEY_ID` (server-side, exposed via API)

This makes the setup more flexible and secure.

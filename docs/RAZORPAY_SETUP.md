# Razorpay Integration Setup Guide

## Overview

This guide explains how to set up Razorpay payment gateway integration for both development and production environments in your CLAT Prep application.

## Prerequisites

1. Razorpay account (sign up at https://razorpay.com)
2. Node.js application with Next.js
3. MongoDB database (already configured)

## Development Setup

### 1. Create Razorpay Account

1. Go to https://razorpay.com and sign up
2. Complete KYC verification (required for receiving payments)
3. Access your Razorpay Dashboard

### 2. Get API Keys

1. In Razorpay Dashboard, go to **Settings** → **API Keys**
2. Generate a new key pair
3. Copy the **Key ID** and **Key Secret**
4. **Important**: Use Test Mode keys for development

### 3. Environment Variables

Create or update your `.env.local` file:

```env
# Razorpay Test Keys (Development)
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_secret_key

# Public key for frontend (Development)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_test_key_id
```

### 4. Test Mode Features

- Test cards available for testing
- No real money transactions
- Webhook testing with ngrok
- Sandbox environment

## Production Setup

### 1. Switch to Live Mode

1. In Razorpay Dashboard, toggle from **Test Mode** to **Live Mode**
2. Generate new Live API keys
3. **Important**: Never use test keys in production

### 2. Production Environment Variables

```env
# Razorpay Live Keys (Production)
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_secret_key

# Public key for frontend (Production)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_live_key_id
```

### 3. Webhook Configuration

1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy webhook secret for verification

## How Razorpay Works

### 1. Payment Flow

```
User → Select Plan → Create Order → Razorpay → Payment → Verification → Success
```

### 2. Order Creation

- Frontend requests order creation
- Backend creates Razorpay order
- Returns order ID to frontend

### 3. Payment Processing

- User completes payment on Razorpay
- Razorpay redirects back to your app
- Backend verifies payment signature
- Updates user status and database

### 4. Security Features

- Payment signature verification
- Webhook notifications
- Idempotency keys
- Secure API communication

## Testing

### 1. Test Cards

```
Success: 4111 1111 1111 1111
Failure: 4000 0000 0000 0002
CVV: Any 3 digits
Expiry: Any future date
```

### 2. Test UPI

```
UPI ID: success@razorpay
```

### 3. Test Net Banking

```
Bank: HDFC Bank
```

## Webhook Implementation

### 1. Create Webhook Endpoint

```javascript
// app/api/payments/webhook/route.js
export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature')

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  switch (event.event) {
    case 'payment.captured':
      // Handle successful payment
      break
    case 'payment.failed':
      // Handle failed payment
      break
  }

  return NextResponse.json({ received: true })
}
```

### 2. Webhook Events

- `payment.captured`: Payment successful
- `payment.failed`: Payment failed
- `order.paid`: Order completed
- `refund.processed`: Refund processed

## Error Handling

### 1. Common Errors

- `INVALID_SIGNATURE`: Webhook verification failed
- `ORDER_NOT_FOUND`: Order doesn't exist
- `PAYMENT_FAILED`: Payment processing failed
- `INSUFFICIENT_FUNDS`: User's account has insufficient funds

### 2. Error Response Format

```json
{
  "error": {
    "code": "PAYMENT_FAILED",
    "description": "Payment processing failed",
    "source": "gateway",
    "step": "payment_processing"
  }
}
```

## Security Best Practices

### 1. API Key Security

- Never expose secret keys in frontend
- Use environment variables
- Rotate keys regularly
- Monitor API usage

### 2. Payment Verification

- Always verify payment signatures
- Use webhooks for real-time updates
- Implement idempotency
- Log all payment attempts

### 3. Data Protection

- Encrypt sensitive data
- Use HTTPS in production
- Implement rate limiting
- Monitor for suspicious activity

## Monitoring & Analytics

### 1. Razorpay Dashboard

- Transaction history
- Settlement reports
- Refund management
- Dispute resolution

### 2. Your Application

- Payment success/failure rates
- User conversion metrics
- Revenue tracking
- Error monitoring

## Troubleshooting

### 1. Common Issues

- **Payment not processing**: Check API keys and environment
- **Signature verification failed**: Verify webhook secret
- **Order creation failed**: Check plan ID and amount
- **User role not updated**: Verify payment verification flow

### 2. Debug Steps

1. Check browser console for errors
2. Verify API responses
3. Check server logs
4. Test with Razorpay test cards
5. Verify environment variables

## Support Resources

### 1. Razorpay Documentation

- [API Documentation](https://razorpay.com/docs/)
- [Integration Guides](https://razorpay.com/docs/integration-guides/)
- [Webhook Documentation](https://razorpay.com/docs/webhooks/)

### 2. Community Support

- [Razorpay Community](https://community.razorpay.com/)
- [GitHub Issues](https://github.com/razorpay/razorpay-node/issues)

### 3. Contact Support

- Email: care@razorpay.com
- Phone: 1800-123-4567
- Live Chat: Available in dashboard

## Production Checklist

- [ ] Live API keys configured
- [ ] Webhook endpoints secured
- [ ] SSL certificate installed
- [ ] Error monitoring setup
- [ ] Payment verification implemented
- [ ] User role management working
- [ ] Database backup configured
- [ ] Performance monitoring active
- [ ] Security audit completed
- [ ] Compliance requirements met

## Revenue Collection

### 1. Settlement Process

- Payments are settled to your bank account
- Settlement time: T+2 to T+4 business days
- Minimum settlement amount: ₹100
- Settlement fees: 2% + GST

### 2. Refund Management

- Process refunds through Razorpay dashboard
- Refund time: 5-7 business days
- Refund fees: Same as transaction fees
- Partial refunds supported

### 3. Dispute Resolution

- Chargeback handling
- Dispute resolution process
- Evidence submission
- Resolution time: 30-90 days

This setup guide covers all aspects of Razorpay integration for your CLAT Prep application. Follow the steps carefully and test thoroughly before going live.

# Environment Variables Template

Copy this template to your `.env.local` file and fill in the actual values.

## Database

```env
DATABASE_URL="mongodb://localhost:27017/clatprep"
```

## NextAuth

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
```

## Google OAuth (if using)

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Razorpay Configuration

### Development (Test Mode)

```env
RAZORPAY_KEY_ID="rzp_test_your_test_key_id"
RAZORPAY_KEY_SECRET="your_test_secret_key"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_test_key_id"
```

### Production (Live Mode) - Uncomment when going live

```env
# RAZORPAY_KEY_ID="rzp_live_your_live_key_id"
# RAZORPAY_KEY_SECRET="your_live_secret_key"
# RAZORPAY_WEBHOOK_SECRET="your_live_webhook_secret"
# NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_your_live_key_id"
```

## Cloudinary (if using for image uploads)

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

## Gemini AI (for automated test creation)

```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

## Other Configuration

```env
NODE_ENV="development"
```

## Important Notes

1. **Never commit your `.env.local` file to version control**
2. **Use test keys for development and live keys for production**
3. **Keep your secret keys secure and rotate them regularly**
4. **The webhook secret is provided by Razorpay when you set up webhooks**
5. **Test thoroughly with test mode before switching to live mode**

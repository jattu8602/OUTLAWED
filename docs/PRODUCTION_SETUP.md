# 🚀 Production Setup Guide for CLATPrep

## Current Deployment Status

- **Domain**: https://clat-test.vercel.app/
- **Status**: ✅ Successfully deployed
- **Landing Page**: ✅ Beautiful CLATPrep branding

## 🔧 Environment Variables Configuration

### **1. Vercel Environment Variables**

Add these in your Vercel dashboard under Project Settings → Environment Variables:

```bash
# Authentication
NEXTAUTH_URL="https://clat-test.vercel.app"
NEXTAUTH_SECRET="your-32-character-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/clatprep?retryWrites=true&w=majority"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### **2. Google OAuth Configuration**

#### **Step 1: Google Cloud Console Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Edit your **OAuth 2.0 Client ID**

#### **Step 2: Authorized Redirect URIs**

Add these URLs to your Google OAuth client:

```
https://clat-test.vercel.app/api/auth/callback/google
https://clat-test.vercel.app/api/auth/callback/nextauth
```

#### **Step 3: Authorized JavaScript Origins**

Add your domain:

```
https://clat-test.vercel.app
```

## 🔄 Callback Flow in Production

### **Authentication Flow:**

1. **User clicks "Continue with Google"** on `/login`
2. **Redirected to Google OAuth** with your client ID
3. **Google redirects back** to `https://clat-test.vercel.app/api/auth/callback/google`
4. **NextAuth processes** the callback and creates/updates user
5. **User redirected** to `/dashboard` with session

### **Protected Routes:**

- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires ADMIN role
- `/api/admin/*` - Requires ADMIN role

## 🛠️ Testing Production Callbacks

### **1. Test Authentication Flow**

```bash
# Visit your login page
https://clat-test.vercel.app/login

# Test Google OAuth
# Should redirect to Google → back to dashboard
```

### **2. Test Admin Access**

```bash
# Admin dashboard
https://clat-test.vercel.app/admin

# User management
https://clat-test.vercel.app/admin/users

# Test creation
https://clat-test.vercel.app/admin/create-test
```

### **3. Test API Endpoints**

```bash
# Test user fetching (requires admin session)
GET https://clat-test.vercel.app/api/admin/users

# Test test creation (requires admin session)
POST https://clat-test.vercel.app/api/admin/tests
```

## 🔍 Debugging Production Issues

### **Common Issues & Solutions:**

#### **1. "Invalid redirect_uri" Error**

**Problem**: Google OAuth rejects callback
**Solution**:

- Add `https://clat-test.vercel.app/api/auth/callback/google` to Google Console
- Ensure `NEXTAUTH_URL` is set correctly

#### **2. "Database connection failed"**

**Problem**: Prisma can't connect to MongoDB
**Solution**:

- Verify `DATABASE_URL` in Vercel
- Check MongoDB Atlas network access
- Ensure database user has correct permissions

#### **3. "Image upload failed"**

**Problem**: Cloudinary uploads not working
**Solution**:

- Verify all Cloudinary environment variables
- Check upload preset permissions
- Ensure `NEXT_PUBLIC_` variables are set

#### **4. "Session not found"**

**Problem**: Users logged out unexpectedly
**Solution**:

- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches domain
- Clear browser cookies and retry

## 📊 Monitoring Production

### **Vercel Analytics**

- **Deployment Status**: Check Vercel dashboard
- **Function Logs**: Monitor API route performance
- **Error Tracking**: Set up error monitoring

### **Database Monitoring**

- **MongoDB Atlas**: Monitor connection and queries
- **Prisma Studio**: Use for database management

### **Authentication Monitoring**

- **NextAuth Logs**: Check authentication flow
- **Session Management**: Monitor user sessions

## 🚀 Post-Deployment Checklist

### **✅ Environment Variables**

- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXTAUTH_SECRET` configured
- [ ] Google OAuth credentials updated
- [ ] Database connection string verified
- [ ] Cloudinary credentials configured

### **✅ Google OAuth Setup**

- [ ] Authorized redirect URIs added
- [ ] Authorized JavaScript origins set
- [ ] OAuth consent screen configured
- [ ] Test authentication flow

### **✅ Database Setup**

- [ ] MongoDB Atlas cluster accessible
- [ ] Database user permissions correct
- [ ] Network access configured
- [ ] Test database connection

### **✅ Feature Testing**

- [ ] User registration/login works
- [ ] Admin dashboard accessible
- [ ] Test creation functional
- [ ] Image uploads working
- [ ] Theme toggle functional

## 🎯 Production URLs

### **Public Pages:**

- **Landing**: https://clat-test.vercel.app/
- **Login**: https://clat-test.vercel.app/login

### **Protected Pages:**

- **Dashboard**: https://clat-test.vercel.app/dashboard
- **Profile**: https://clat-test.vercel.app/dashboard/profile
- **Admin**: https://clat-test.vercel.app/admin

### **API Endpoints:**

- **Auth**: https://clat-test.vercel.app/api/auth/[...nextauth]
- **Upload**: https://clat-test.vercel.app/api/upload
- **Admin Users**: https://clat-test.vercel.app/api/admin/users
- **Admin Tests**: https://clat-test.vercel.app/api/admin/tests

## 🔐 Security Considerations

### **Environment Variables**

- ✅ Never commit secrets to Git
- ✅ Use Vercel's environment variable system
- ✅ Rotate secrets regularly

### **Authentication**

- ✅ JWT strategy for sessions
- ✅ Role-based access control
- ✅ Secure callback URLs

### **Database**

- ✅ MongoDB Atlas with SSL
- ✅ Network access restrictions
- ✅ User permissions limited

---

**🎉 Your CLATPrep platform is ready for production use!**

Visit: https://clat-test.vercel.app/

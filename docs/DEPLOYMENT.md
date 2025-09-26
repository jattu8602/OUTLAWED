# 🚀 Vercel Deployment Guide

## Prerequisites

- MongoDB database (MongoDB Atlas recommended)
- Google OAuth credentials
- Cloudinary account

## Environment Variables

Add these environment variables in your Vercel project settings:

### Database

```
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/clatprep?retryWrites=true&w=majority"
```

### Authentication (NextAuth.js)

```
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Cloudinary

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Build Configuration

The build script has been updated to include Prisma generation:

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

## Deployment Steps

1. **Connect your GitHub repository to Vercel**
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically run the build process

## Post-Deployment

1. **Database Setup**: Ensure your MongoDB database is accessible
2. **Test Authentication**: Verify Google OAuth is working
3. **Test Image Uploads**: Verify Cloudinary integration
4. **Create Admin User**: Use the script to create your first admin user

## Troubleshooting

### Prisma Issues

- Ensure `DATABASE_URL` is correctly set
- Check MongoDB connection string format
- Verify database permissions

### Authentication Issues

- Verify `NEXTAUTH_URL` matches your domain
- Check Google OAuth credentials
- Ensure `NEXTAUTH_SECRET` is set

### Image Upload Issues

- Verify Cloudinary credentials
- Check upload preset permissions
- Ensure environment variables are correctly named

## Features Ready for Deployment

✅ **Admin Dashboard**

- User management
- Test creation and management
- Question creation with validation

✅ **Authentication System**

- Google OAuth integration
- Role-based access control
- Session management

✅ **Image Management**

- Cloudinary integration
- Profile image uploads
- Question image uploads

✅ **Theme System**

- Dark/Light mode toggle
- Responsive design
- Modern UI components

✅ **Database Schema**

- User management
- Test and question models
- Payment and notification systems

## Next Steps After Deployment

1. **Create Admin User**: Use the provided script
2. **Set up initial tests**: Create sample tests
3. **Configure notifications**: Set up email/webhook notifications
4. **Monitor performance**: Use Vercel analytics
5. **Set up custom domain**: Configure your domain in Vercel

---

**🎉 Your CLAT Prep platform is ready for production!**

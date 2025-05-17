# Cloudinary Setup for Eatable

This guide explains how to set up Cloudinary for image optimization in the Eatable application.

## Why Cloudinary?

We've switched from Appwrite storage to Cloudinary for image handling because:

1. **Optimized Images**: Cloudinary automatically optimizes images for faster loading times
2. **Responsive Images**: Cloudinary can serve different image sizes based on the device
3. **Automatic Format Conversion**: Cloudinary can serve images in modern formats like WebP for browsers that support them
4. **CDN Delivery**: Cloudinary uses a global CDN for faster image delivery worldwide

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. After signing up, you'll be taken to your dashboard

### 2. Get Your Cloudinary Credentials

From your Cloudinary dashboard, collect the following information:

- **Cloud Name**: Found in the top right of your dashboard
- **API Key**: Found in the "API Keys" section
- **API Secret**: Found in the "API Keys" section

### 3. Create an Upload Preset

1. In your Cloudinary dashboard, go to "Settings" > "Upload"
2. Scroll down to "Upload presets" and click "Add upload preset"
3. Give it a name (e.g., "eatable_preset")
4. Set "Signing Mode" to "Unsigned"
5. Configure any other settings you want (optional):
   - Enable auto-tagging
   - Set folder structure
   - Configure transformations
6. Save the preset

### 4. Update Your Environment Variables

1. Copy the `.env.example` file to `.env`
2. Fill in your Cloudinary credentials:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
```

## How It Works

The application now uses Cloudinary for image handling:

1. **Image Upload**: When a user uploads an image, it's sent directly to Cloudinary using an unsigned upload preset
2. **Image Optimization**: Cloudinary automatically optimizes the image and returns a URL
3. **Image Storage**: The optimized image URL is stored in the Appwrite database
4. **Image Display**: When displaying images, we use Cloudinary's optimization parameters

## Optimization Features

The implementation includes several optimization features:

- **Automatic Quality**: `quality: 'auto'` lets Cloudinary determine the optimal quality
- **Format Conversion**: `fetch_format: 'auto'` serves images in WebP for supported browsers
- **Responsive Images**: Images are served with appropriate dimensions
- **Browser-Compatible**: Implementation works directly in the browser without server-side code

## Important Note About Image Deletion

Since this implementation runs entirely in the browser, image deletion from Cloudinary requires additional setup:

1. For a complete solution, you would need to create a server-side function or API endpoint to handle image deletion
2. This endpoint would use your Cloudinary API secret to authenticate deletion requests
3. The current implementation logs a warning when attempting to delete images

For a production environment, consider implementing a secure server-side deletion endpoint.

## Troubleshooting

If you encounter issues:

1. Check that your Cloudinary credentials are correct in the `.env` file
2. Ensure your upload preset is set to "Unsigned"
3. Check browser console for any errors during image upload
4. Verify that your Cloudinary account has sufficient credits (free tier has limits)

For more information, refer to the [Cloudinary documentation](https://cloudinary.com/documentation).

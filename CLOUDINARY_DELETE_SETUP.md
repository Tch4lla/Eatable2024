# Cloudinary Delete Function Setup

This document explains how to set up and use the Cloudinary delete function in the Eatable application.

## Overview

The Eatable application uses Cloudinary for image storage and optimization. While uploading images to Cloudinary can be done directly from the browser, deleting images requires server-side code to securely use the Cloudinary API secret.

This implementation uses an Appwrite Function to handle the deletion of images from Cloudinary.

## Current Implementation Status

**IMPORTANT**: The current implementation includes a temporary solution that mocks the deletion process. When you try to delete an image, it will log a message to the console and return a success status, but it won't actually delete the image from Cloudinary.

To enable actual deletion, you need to deploy the Appwrite Function and update the code as described in the setup instructions below.

## Setup Instructions

### 1. Deploy the Appwrite Function

1. Navigate to the function directory:

   ```bash
   cd functions/deleteFromCloudinary
   ```

2. Deploy the function to your Appwrite project:

   ```bash
   appwrite deploy function
   ```

3. After deployment, note the Function ID provided by Appwrite.

### 2. Update the Frontend Code

1. Open `src/lib/cloudinary/api.ts`
2. Find the `deleteFromCloudinary` function
3. Replace `'FUNCTION_ID'` with your actual Appwrite Function ID:
   ```typescript
   const execution = await functions.createExecution(
     'YOUR_ACTUAL_FUNCTION_ID', // Replace with your actual function ID
     JSON.stringify({ publicId }),
     false
   );
   ```

## How It Works

1. When a user deletes a post or updates their profile picture, the application calls the `deleteFile` function in `src/lib/appwrite/api.ts`.
2. The `deleteFile` function calls the `deleteFromCloudinary` function in `src/lib/cloudinary/api.ts`.
3. The `deleteFromCloudinary` function calls the Appwrite Function.
4. The Appwrite Function uses the Cloudinary API to delete the image.

## Security Considerations

This implementation keeps your Cloudinary API secret secure by:

1. Storing it only on the server-side (in Appwrite Function environment variables)
2. Never exposing it in the frontend code
3. Using Appwrite's authentication and authorization to control access to the function

## Troubleshooting

If you encounter issues with image deletion:

1. Check the Appwrite Function logs for any errors
2. Verify that your Cloudinary credentials are correctly set in the Appwrite Function environment variables
3. Ensure that the Function ID in the frontend code matches your deployed function
4. Check the browser console for any errors when calling the function

## Additional Resources

- [Appwrite Functions Documentation](https://appwrite.io/docs/functions)
- [Cloudinary API Documentation](https://cloudinary.com/documentation/image_upload_api_reference#destroy_method)

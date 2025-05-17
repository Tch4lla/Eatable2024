# Delete From Cloudinary Function

This Appwrite Function handles deleting images from Cloudinary. It provides a secure way to delete images from Cloudinary without exposing your API secret in the frontend code.

## Setup

1. Deploy this function to your Appwrite project:

   ```bash
   cd functions/deleteFromCloudinary
   appwrite deploy function
   ```

2. Make sure your Cloudinary environment variables are set in your Appwrite project:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## Usage

Call this function from your frontend code:

```typescript
import { ID, Client, Functions } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('YOUR_PROJECT_ID');

const functions = new Functions(client);

// Delete an image from Cloudinary
async function deleteImage(publicId: string) {
  try {
    const execution = await functions.createExecution(
      'FUNCTION_ID',
      JSON.stringify({ publicId }),
      false
    );

    return execution;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}
```

## Response

The function returns a JSON response with the following structure:

### Success Response

```json
{
  "success": true,
  "message": "Image deleted successfully",
  "result": {
    "result": "ok"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message"
}
```

## Security Considerations

This function helps keep your Cloudinary API secret secure by:

1. Storing the API secret on the server-side only
2. Validating requests before processing
3. Providing proper error handling and logging

Never expose your Cloudinary API secret in your frontend code.

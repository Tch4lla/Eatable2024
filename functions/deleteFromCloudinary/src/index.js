import { v2 as cloudinary } from 'cloudinary';
import { Client, Functions } from 'node-appwrite';

/**
 * This function handles deleting images from Cloudinary
 * It requires the following environment variables:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
export default async function deleteFromCloudinary(req, res) {
  // Initialize Cloudinary with credentials from environment variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Parse the request payload
  const payload = JSON.parse(req.payload || '{}');
  const { publicId } = payload;

  // Validate the request
  if (!publicId) {
    return res.json(
      {
        success: false,
        message: 'Public ID is required',
      },
      400
    );
  }

  try {
    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    // Check if the deletion was successful
    if (result.result === 'ok') {
      return res.json({
        success: true,
        message: 'Image deleted successfully',
        result,
      });
    } else {
      return res.json(
        {
          success: false,
          message: 'Failed to delete image',
          result,
        },
        500
      );
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return res.json(
      {
        success: false,
        message: 'Error deleting image from Cloudinary',
        error: error.message,
      },
      500
    );
  }
}

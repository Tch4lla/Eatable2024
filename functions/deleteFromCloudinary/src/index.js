import { v2 as cloudinary } from 'cloudinary';

/**
 * This function handles deleting images from Cloudinary
 * It requires the following environment variables:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 *
 * @param {Object} context - The Appwrite function context ({ req, res, log, error })
 */
export default async function deleteFromCloudinary({ req, res, log, error }) {
  // Initialize Cloudinary with credentials from environment variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Parse the request payload; req.body may arrive as a string or parsed object
  let payload = {};
  try {
    payload =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch {
    payload = {};
  }
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
  } catch (err) {
    error('Error deleting image from Cloudinary: ' + err.message);
    return res.json(
      {
        success: false,
        message: 'Error deleting image from Cloudinary',
        error: err.message,
      },
      500
    );
  }
}

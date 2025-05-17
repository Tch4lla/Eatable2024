// Cloudinary configuration for browser environment
export const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

// Helper function to generate Cloudinary URLs
export function buildCloudinaryUrl(publicId: string, options: Record<string, any> = {}) {
    const { cloudName } = cloudinaryConfig;

    if (!cloudName) {
        console.error('Cloudinary cloud name is not defined');
        return null;
    }

    // Start with base URL
    let url = `https://res.cloudinary.com/${cloudName}/image/upload`;

    // Add transformation parameters
    const transformations = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.fetchFormat) transformations.push(`f_${options.fetchFormat}`);

    // Add transformations to URL if any exist
    if (transformations.length > 0) {
        url += `/${transformations.join(',')}`;
    }

    // Add public ID
    url += `/${publicId}`;

    return url;
}

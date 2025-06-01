// Cloudinary configuration for browser environment
export const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

// Helper function to generate Cloudinary URLs with performance optimizations
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

    // Add loading optimization parameters by default
    transformations.push('f_auto'); // Auto format (WebP/AVIF where supported)
    transformations.push('q_auto'); // Auto quality

    // Add responsive image sizing if width is specified
    if (options.width) {
        // Use dpr_auto for automatic device pixel ratio
        transformations.push(`w_${options.width},dpr_auto`);
    }

    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.aspectRatio) transformations.push(`ar_${options.aspectRatio}`);

    // Only add quality if explicitly specified (otherwise use q_auto)
    if (options.quality && options.quality !== 'auto') transformations.push(`q_${options.quality}`);

    // Only add format if explicitly specified (otherwise use f_auto)
    if (options.fetchFormat && options.fetchFormat !== 'auto') transformations.push(`f_${options.fetchFormat}`);

    if (options.radius) transformations.push(`r_${options.radius}`);
    if (options.gravity) transformations.push(`g_${options.gravity}`);
    if (options.background) transformations.push(`b_${options.background}`);
    if (options.border) transformations.push(`bo_${options.border}`);

    // Add loading optimization
    transformations.push('fl_progressive'); // Progressive loading

    // Add transformations to URL
    url += `/${transformations.join(',')}`;

    // Add public ID
    url += `/${publicId}`;

    return url;
}

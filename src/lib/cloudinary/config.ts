// Cloudinary configuration for browser environment
export const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

/**
 * Extract Cloudinary public ID from a URL
 * This handles different URL formats that might be stored in the database
 */
export function extractCloudinaryPublicId(url: string): string {
    if (!url || !url.includes('cloudinary.com')) return '';

    // Handle URLs with transformation parameters
    if (url.includes('/upload/')) {
        // Get the part after the last /upload/ segment (which might include transformations)
        const uploadParts = url.split('/upload/');
        const afterUpload = uploadParts[uploadParts.length - 1];

        // Remove any transformation parameters
        const parts = afterUpload.split('/');
        const filename = parts[parts.length - 1];

        // Remove file extension if present
        return filename.split('.')[0];
    }

    // Fallback: just get the filename from the URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    return filename.split('.')[0];
}

// Helper function to generate Cloudinary URLs with performance optimizations
export function buildCloudinaryUrl(publicId: string, options: Record<string, any> = {}) {
    const { cloudName } = cloudinaryConfig;

    if (!cloudName) {
        console.error('Cloudinary cloud name is not defined');
        return '';
    }

    // Start with base URL
    let url = `https://res.cloudinary.com/${cloudName}/image/upload`;

    // Add transformation parameters
    const transformations = [];

    // Add loading optimization parameters by default
    transformations.push('f_auto'); // Auto format (WebP/AVIF where supported)
    transformations.push('q_auto:good'); // Auto quality with good balance

    // Add responsive image sizing if width is specified
    if (options.width) {
        transformations.push(`w_${options.width}`);
    }

    // Add DPR setting (but don't use dpr_auto as it can cause larger images)
    if (options.dpr) {
        transformations.push(`dpr_${options.dpr}`);
    } else {
        // Default to dpr_1.0 to prevent sending unnecessarily large images
        transformations.push('dpr_1.0');
    }

    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.aspectRatio) transformations.push(`ar_${options.aspectRatio}`);

    // Only add quality if explicitly specified (otherwise use q_auto:good)
    if (options.quality && options.quality !== 'auto') transformations.push(`q_${options.quality}`);

    // Only add format if explicitly specified (otherwise use f_auto)
    if (options.fetchFormat && options.fetchFormat !== 'auto') transformations.push(`f_${options.fetchFormat}`);

    if (options.radius) transformations.push(`r_${options.radius}`);
    if (options.gravity) transformations.push(`g_${options.gravity}`);
    if (options.background) transformations.push(`b_${options.background}`);
    if (options.border) transformations.push(`bo_${options.border}`);

    // Add loading optimization - but only if explicitly requested
    // fl_progressive can increase file size for some images
    if (options.progressive) {
        transformations.push('fl_progressive');
    }

    // Add transformations to URL
    url += `/${transformations.join(',')}`;

    // Add public ID
    url += `/${publicId}`;

    return url;
}

// Helper functions for common image types
export function getPostImageUrl(publicId: string, width = 800) {
    if (!publicId) return '';

    return buildCloudinaryUrl(publicId, {
        width,
        crop: 'limit',
        quality: 'auto:good',
    });
}

export function getProfileImageUrl(publicId: string, size = 100) {
    if (!publicId) return '';

    return buildCloudinaryUrl(publicId, {
        width: size,
        height: size,
        crop: 'fill',
        gravity: 'auto',
        radius: 'max',
        background: 'rgb:262c35',
    });
}

// Generate responsive image srcset
export function generateImageSrcSet(publicId: string, widths: number[] = [400, 600, 800, 1200]) {
    if (!publicId) return '';

    return widths
        .map(width => {
            const url = buildCloudinaryUrl(publicId, {
                width,
                crop: 'limit',
                quality: 'auto:good',
            });
            return `${url} ${width}w`;
        })
        .join(', ');
}

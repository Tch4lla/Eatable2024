import cloudinary from './config';

/**
 * Uploads a file to Cloudinary with optimization parameters
 * @param file The file to upload
 * @returns The uploaded file information
 */
export async function uploadToCloudinary(file: File) {
    try {
        // Convert file to base64 string for upload
        const base64Data = await fileToBase64(file);

        if (!base64Data) throw new Error('Failed to convert file to base64');

        // Create a FormData object
        const formData = new FormData();
        formData.append('file', base64Data);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        // Add optimization parameters
        formData.append('quality', 'auto');
        formData.append('fetch_format', 'auto');

        // Upload to Cloudinary via fetch API
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error('Failed to upload image to Cloudinary');
        }

        const data = await response.json();

        return {
            $id: data.public_id,
            url: data.secure_url,
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

/**
 * Gets an optimized image URL from Cloudinary
 * @param publicId The public ID of the image in Cloudinary
 * @param width The desired width of the image
 * @param height The desired height of the image
 * @returns The optimized image URL
 */
export function getOptimizedImageUrl(publicId: string, width = 800, height = 800) {
    try {
        // Create a Cloudinary URL with optimization parameters
        const url = cloudinary.url(publicId, {
            width,
            height,
            crop: 'fill',
            quality: 'auto',
            fetch_format: 'auto',
            dpr: 'auto',
            responsive: true,
            loading: 'lazy',
        });

        return url;
    } catch (error) {
        console.error('Error getting optimized image URL:', error);
        return null;
    }
}

/**
 * Deletes an image from Cloudinary
 * @param publicId The public ID of the image in Cloudinary
 * @returns Status of the deletion
 */
export async function deleteFromCloudinary(publicId: string) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return { status: result.result === 'ok' ? 'ok' : 'error' };
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return { status: 'error' };
    }
}

/**
 * Converts a File object to a base64 string
 * @param file The file to convert
 * @returns A Promise that resolves to the base64 string
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

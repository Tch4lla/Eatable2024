import { cloudinaryConfig, buildCloudinaryUrl } from './config';

/**
 * Uploads a file to Cloudinary with optimization parameters
 * @param file The file to upload
 * @returns The uploaded file information
 */
export async function uploadToCloudinary(file: File) {
    try {
        // Check file size before upload - resize large images client-side
        const shouldResizeImage = file.size > 1024 * 1024; // 1MB threshold
        let fileToUpload = file;

        if (shouldResizeImage && file.type.startsWith('image/')) {
            fileToUpload = await resizeImageBeforeUpload(file);
        }

        // Convert file to base64 string for upload
        const base64Data = await fileToBase64(fileToUpload);

        if (!base64Data) throw new Error('Failed to convert file to base64');

        // Create a FormData object
        const formData = new FormData();
        formData.append('file', base64Data);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);

        // Add optimization parameters
        formData.append('quality', 'auto');
        formData.append('fetch_format', 'auto');

        // Enable eager transformations to pre-generate optimized versions
        formData.append('eager', 'q_auto,f_auto,fl_progressive');

        // Upload to Cloudinary via fetch API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

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
 * Resizes an image before upload to reduce file size
 * @param file The image file to resize
 * @returns A Promise that resolves to the resized file
 */
async function resizeImageBeforeUpload(file: File): Promise<File> {
    return new Promise((resolve) => {
        try {
            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = () => {
                // Release object URL
                URL.revokeObjectURL(img.src);

                // Calculate new dimensions (max 1200px width/height)
                const MAX_SIZE = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height && width > MAX_SIZE) {
                    height = Math.round(height * (MAX_SIZE / width));
                    width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    width = Math.round(width * (MAX_SIZE / height));
                    height = MAX_SIZE;
                }

                // Create canvas and resize
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // Fall back to original if canvas not supported
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob with reduced quality
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve(file);
                            return;
                        }

                        // Create new file from blob
                        const resizedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });

                        resolve(resizedFile);
                    },
                    'image/jpeg',
                    0.85 // 85% quality
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                resolve(file); // Fall back to original on error
            };
        } catch (error) {
            console.error('Error resizing image:', error);
            resolve(file); // Fall back to original on error
        }
    });
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
        const url = buildCloudinaryUrl(publicId, {
            width,
            height,
            crop: 'fill',
            quality: 'auto',
            fetchFormat: 'auto',
        });

        return url;
    } catch (error) {
        console.error('Error getting optimized image URL:', error);
        return null;
    }
}

/**
 * Gets a circular profile image URL from Cloudinary
 * @param publicId The public ID of the image in Cloudinary
 * @param size The desired size of the circular image
 * @returns The circular profile image URL
 */
export function getProfileImageUrl(publicId: string, size = 300) {
    try {
        // Create a Cloudinary URL with circle crop parameters
        const url = buildCloudinaryUrl(publicId, {
            width: size,
            crop: 'fill',
            aspectRatio: '1:1',
            gravity: 'auto',
            radius: 'max',
            quality: 'auto',
            fetchFormat: 'auto',
            background: 'rgb:262c35',
        });

        return url;
    } catch (error) {
        console.error('Error getting profile image URL:', error);
        return null;
    }
}

export async function deleteFromCloudinary(publicId: string) {
    const functionId = import.meta.env.VITE_DELETE_FUNCTION_ID;
    if (!functionId) {
        console.warn('[Cloudinary] VITE_DELETE_FUNCTION_ID not set — image not deleted from Cloudinary:', publicId);
        return { status: 'ok' };
    }
    try {
        const { Client, Functions } = await import('appwrite');
        const client = new Client()
            .setEndpoint('https://cloud.appwrite.io/v1')
            .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
        const functions = new Functions(client);
        const execution = await functions.createExecution(
            functionId,
            JSON.stringify({ publicId }),
            false
        );
        const executionData = execution as any;
        if (executionData.status === 'completed') return { status: 'ok' };
        console.error('Failed to delete image from Cloudinary:', execution);
        return { status: 'error' };
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
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => {
            console.error('Error reading file as base64');
            resolve(''); // Return empty string on error
        };
    });
}

import { cloudinaryConfig, buildCloudinaryUrl } from './config';

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
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);

        // Add optimization parameters
        formData.append('quality', 'auto');
        formData.append('fetch_format', 'auto');

        // Upload to Cloudinary via fetch API
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
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
 * Deletes an image from Cloudinary
 * @param publicId The public ID of the image in Cloudinary
 * @returns Status of the deletion
 */
export async function deleteFromCloudinary(publicId: string) {
    try {
        // TEMPORARY SOLUTION: Until the Appwrite Function is deployed,
        // we'll just log a message and return success
        console.log(`[MOCK DELETE] Would delete image with ID: ${publicId}`);
        console.info('To enable actual deletion, deploy the Appwrite Function and update the function ID');

        // Return success status for now
        return { status: 'ok' };

        /* 
        TO ENABLE ACTUAL DELETION:
        1. Deploy the Appwrite Function from the functions/deleteFromCloudinary directory
        2. Get the Function ID from the Appwrite Console
        3. Replace 'YOUR_FUNCTION_ID' below with your actual Function ID
        4. Uncomment this code and remove the temporary solution above
        // Import Appwrite client and functions
        const { Client, Functions } = await import('appwrite');

        // Initialize Appwrite client
        const client = new Client()
            .setEndpoint('https://cloud.appwrite.io/v1')
            .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

        const functions = new Functions(client);

        // Call the Appwrite Function to delete the image from Cloudinary
        // Replace 'YOUR_FUNCTION_ID' with your actual function ID after deployment
        const execution = await functions.createExecution(
            'YOUR_FUNCTION_ID',
            JSON.stringify({ publicId }),
            false
        );

        // Use type assertion to access execution properties
        const executionData = execution as any;

        // Check if the execution was successful
        if (executionData.status === 'completed') {
            try {
                // Try to parse the response
                let responseData;
                if (typeof executionData.response === 'string') {
                    responseData = JSON.parse(executionData.response);
                } else if (typeof executionData.stdout === 'string') {
                    responseData = JSON.parse(executionData.stdout);
                } else if (executionData.response && typeof executionData.response === 'object') {
                    responseData = executionData.response;
                }

                // Check if we have a successful response
                if (responseData && responseData.success) {
                    return { status: 'ok' };
                }
            } catch (parseError) {
                console.error('Error parsing function response:', parseError);
            }
        }

        console.error('Failed to delete image from Cloudinary:', execution);
        return { status: 'error' };
        */
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

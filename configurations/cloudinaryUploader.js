const cloudinary = require('../config/cloudinary');

// Utility function to upload a file to Cloudinary
exports.uploadFileToCloudinary = async (file, folder) => {
    try {
        const options = {
            folder,
            resource_type: 'auto'  // Automatically detect file type (image/video/etc.)
        };

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath, options);
        return result; // Returns the complete response from Cloudinary
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

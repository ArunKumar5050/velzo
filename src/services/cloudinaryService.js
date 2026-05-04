// Cloudinary service for uploading images
const CLOUDINARY_CLOUD_NAME = 'dhjzybacp'
const CLOUDINARY_API_KEY = '616437383559823'
const CLOUDINARY_UPLOAD_PRESET = 'onway_admin' // Make sure to create this unsigned preset in Cloudinary

/**
 * Upload image to Cloudinary and return the secure URL
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - Cloudinary image URL
 */
export const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      // Provide helpful error message
      if (data.error && data.error.message.includes('Upload preset')) {
        throw new Error(
          'Upload preset "onway_admin" not found. Please create an unsigned upload preset in your Cloudinary dashboard.'
        )
      }
      throw new Error(data.error?.message || 'Failed to upload image to Cloudinary')
    }

    // Return the secure URL
    return data.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image: ' + error.message)
  }
}


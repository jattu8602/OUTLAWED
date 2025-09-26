import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload image to Cloudinary
export async function uploadImage(file, folder = 'clatprep') {
  try {
    // Convert file to base64 if it's a File object
    let base64Image
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      base64Image = `data:${file.type};base64,${buffer.toString('base64')}`
    } else {
      base64Image = file
    }

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    })

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Delete image from Cloudinary
export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return {
      success: true,
      result,
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Upload multiple images
export async function uploadMultipleImages(files, folder = 'clatprep') {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder))
    const results = await Promise.all(uploadPromises)

    const successful = results.filter((result) => result.success)
    const failed = results.filter((result) => !result.success)

    return {
      success: true,
      urls: successful.map((result) => result.url),
      failed: failed.length,
      total: results.length,
    }
  } catch (error) {
    console.error('Multiple upload error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

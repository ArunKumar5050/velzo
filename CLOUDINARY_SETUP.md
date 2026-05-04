# Cloudinary Image Upload Setup Guide

## ✅ Implementation Complete!

The image upload feature has been successfully integrated with Cloudinary. Here's what was changed:

### Changes Made:

1. **AddProduct.jsx** - Replaced the "Image URL" input field with a drag-and-drop image upload area
   - Added file input validation (image files only, max 5MB)
   - Shows image preview after upload
   - Added ability to remove/replace images
   - Upload to Cloudinary happens automatically when image is selected

2. **cloudinaryService.js** - Created new service for Cloudinary uploads
   - Handles image upload to Cloudinary
   - Returns secure HTTPS URL
   - Better error handling with helpful messages

### ⚙️ Required Cloudinary Setup:

Before the feature will work, you need to create an **unsigned upload preset** in your Cloudinary dashboard:

#### Steps:

1. Go to your Cloudinary Dashboard: https://cloudinary.com/console/settings/upload
2. Scroll down to "Upload presets"
3. Click "Add upload preset"
4. Fill in the details:
   - **Name**: `onway_admin` (important - must match exactly)
   - **Signing Mode**: `Unsigned` (important for frontend uploads)
   - **Folder**: `onway_admin/products` (optional, for organization)
5. Click "Save"

### Cloud Name & API Key:
- **Cloud Name**: `dhjzybacp` ✓
- **API Key**: `616437383559823` ✓

### How It Works Now:

1. User clicks the image upload area in Add Product form
2. User selects an image file (PNG, JPG, GIF - max 5MB)
3. Image is automatically uploaded to Cloudinary
4. Cloudinary URL is stored in the form
5. When "Add Product" is clicked, the Cloudinary URL is saved to Firestore
6. Product displays the image from Cloudinary

### Image Flow:
```
Local Computer 
    ↓
Select Image File
    ↓
Upload to Cloudinary
    ↓
Get Secure URL (https://res.cloudinary.com/...)
    ↓
Save URL to Firestore
    ↓
Display in Products List & Dashboard
```

### Error Handling:

If you see error "Upload preset 'onway_admin' not found":
- Check that you created the preset with exact name `onway_admin`
- Ensure it's set to `Unsigned` mode
- Try creating it again

### File Validation:

- ✓ Accepts: PNG, JPG, JPEG, GIF, WebP
- ✗ Rejects: Non-image files
- ✗ Rejects: Images larger than 5MB

### Security Notes:

- The API key is only used for client-side unsigned uploads
- Images are stored in Cloudinary, not in Firebase Storage
- Each image gets a unique URL

## Testing:

1. Go to "Products" page
2. Click "Add Product"
3. Fill in product details
4. Click the image upload area
5. Select an image file
6. Wait for upload to complete (you'll see a loading spinner)
7. Image preview will appear
8. Click "Add Product" button
9. Product will be created with Cloudinary image URL

Enjoy! 🚀

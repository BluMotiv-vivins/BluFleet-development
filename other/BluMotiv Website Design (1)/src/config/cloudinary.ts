// Cloudinary Configuration for Resume Uploads
// Sign up at https://cloudinary.com for free account

export const CLOUDINARY_CONFIG = {
  // Replace with your Cloudinary cloud name (get from dashboard)
  CLOUD_NAME: 'dbyllquot',
  
  // Upload preset for unsigned uploads (create in Cloudinary dashboard)
  UPLOAD_PRESET: 'blumotiv_resumes',
  
  // Folder to organize uploads
  FOLDER: 'blumotiv/job-applications',
  
  // Upload URL for different resource types
  UPLOAD_URL: 'https://api.cloudinary.com/v1_1/dbyllquot/upload'
};

// Utility function to upload file to Cloudinary
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  
  // Basic required params
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
  
  // Generate a unique name with timestamp
  const timestamp = Date.now().toString();
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  formData.append('public_id', `resume_${timestamp}_${safeName.split('.')[0]}`);
  
  try {
    console.log('Starting Cloudinary upload with preset:', CLOUDINARY_CONFIG.UPLOAD_PRESET);
    
    // Use raw upload URL specifically for PDFs and documents
    let url;
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      console.log('Using raw upload for PDF file');
      url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/raw/upload`;
      formData.append('resource_type', 'raw');
    } else {
      url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/auto/upload`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    // Log response info for debugging
    console.log('Cloudinary response status:', response.status);
    
    if (!response.ok) {
      let errorText = 'Unknown error';
      try {
        errorText = await response.text();
      } catch (e) {
        console.error('Could not read error response text', e);
      }
      console.error('Cloudinary error response:', errorText);
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload successful:', {
      publicId: data.public_id,
      format: data.format,
      resourceType: data.resource_type,
      url: data.secure_url
    });
    
    // For PDFs, modify the URL to ensure it's a direct download link
    let finalUrl = data.secure_url;
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      // Convert from /image/upload/ to /raw/upload/ in the URL if needed
      finalUrl = finalUrl.replace('/image/upload/', '/raw/upload/');
      console.log('Modified PDF URL for direct download:', finalUrl);
    }
    
    // Return the secure URL for the uploaded file
    return finalUrl;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload resume. Please try again.');
  }
};
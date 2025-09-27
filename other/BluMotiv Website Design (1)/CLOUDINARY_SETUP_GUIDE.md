# Cloudinary Setup Guide for BluMotiv Resume Uploads

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Free Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account (25GB storage, 25GB bandwidth/month)
3. Verify your email

### Step 2: Get Your Cloud Name
1. In Cloudinary dashboard, note your **Cloud Name** (top-left corner)
2. Example: `blumotiv-careers` or `your-company-name`

### Step 3: Create Upload Preset
1. Go to **Settings** → **Upload** → **Upload presets**
2. Click **Add upload preset**
3. Set these values:
   - **Preset name**: `blumotiv_resumes`
   - **Signing Mode**: `Unsigned` (important!)
   - **Folder**: `blumotiv/job-applications`
   - **Resource Type**: `Auto`
   - **Access Mode**: `Public`
4. Click **Save**

### Step 4: Update Configuration
Open `src/config/cloudinary.ts` and replace:

```typescript
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'your_actual_cloud_name', // Replace with your cloud name
  UPLOAD_PRESET: 'blumotiv_resumes',
  FOLDER: 'blumotiv/job-applications',
  UPLOAD_URL: 'https://api.cloudinary.com/v1_1/your_actual_cloud_name/upload' // Replace cloud name here too
};
```

### Step 5: Test Upload
1. Run your app: `npm run dev`
2. Go to job application page
3. Upload a test resume
4. Check Cloudinary dashboard → **Media Library** → **blumotiv** folder

## ✅ What This Solution Provides

### For Candidates:
- ✅ Instant resume upload with progress indicator
- ✅ Upload confirmation before form submission
- ✅ Support for PDF, DOC, DOCX files
- ✅ File size validation (up to 10MB)

### For HR Team:
- ✅ **Clickable download links** in email notifications
- ✅ Secure file storage with Cloudinary
- ✅ Organized file structure by date and candidate
- ✅ No need to request files separately

### Technical Benefits:
- ✅ **Free tier**: 25GB storage, 25GB bandwidth/month
- ✅ **Fast CDN**: Global file delivery
- ✅ **Secure**: HTTPS URLs, access control
- ✅ **Reliable**: 99.9% uptime SLA
- ✅ **Scalable**: Easy to upgrade when needed

## 🔧 How It Works

1. **File Selection**: User selects resume file
2. **Instant Upload**: File uploads to Cloudinary immediately
3. **URL Generation**: Cloudinary returns secure download URL
4. **Email Integration**: EmailJS sends email with download link
5. **HR Access**: HR clicks link to download resume

## 📧 Email Template Features

The email now includes:
- **Resume filename** for identification
- **Direct download link** (clickable)
- **Upload confirmation** message
- **Professional styling** with success indicators

## 🛡️ Security & Privacy

- Files stored securely on Cloudinary's CDN
- HTTPS-only access
- Organized folder structure
- No public browsing of files
- Files can be set to expire if needed

## 📊 Monitoring & Management

### Cloudinary Dashboard:
- View all uploaded resumes
- Monitor storage usage
- Download files manually if needed
- Set up webhooks for notifications

### File Organization:
```
blumotiv/
└── job-applications/
    ├── resume_2024-01-09_john_doe_resume.pdf
    ├── resume_2024-01-09_jane_smith_cv.pdf
    └── resume_2024-01-10_mike_johnson_resume.docx
```

## 🚀 Production Recommendations

### For High Volume:
1. **Upgrade Cloudinary plan** when approaching limits
2. **Add file compression** to reduce storage usage
3. **Set up auto-deletion** for old applications (optional)
4. **Add virus scanning** for uploaded files

### Advanced Features:
1. **Image thumbnails** for PDF previews
2. **File format conversion** (DOC → PDF)
3. **Watermarking** for security
4. **Analytics** on file downloads

## 🔍 Troubleshooting

### Common Issues:

**Upload fails:**
- Check cloud name in config
- Verify upload preset is "unsigned"
- Check file size (max 10MB)

**Download link doesn't work:**
- Verify file uploaded successfully
- Check Cloudinary media library
- Ensure URL is complete in email

**Slow uploads:**
- Cloudinary has global CDN (usually fast)
- Check internet connection
- Consider file size optimization

This solution gives you professional-grade file handling without needing a backend!
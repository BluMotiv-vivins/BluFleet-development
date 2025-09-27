# Microsoft Forms Integration Setup Guide

## Overview
This guide helps you set up Microsoft Forms for product inquiries instead of using EmailJS. Users will click "Express Interest" to open a Microsoft Form in a new tab.

## Step 1: Create Microsoft Forms

### 1.1 Access Microsoft Forms
1. Go to [Microsoft Forms](https://forms.office.com)
2. Sign in with your Microsoft/Office 365 account
3. Click "New Form"

### 1.2 Create Form for 3T Forklift
1. **Form Title**: "3T Forklift - Product Inquiry"
2. **Description**: "Thank you for your interest in our 3T Electric Forklift. Please fill out the form below and our team will contact you within 24 hours."

**Add these questions:**
1. **Full Name** (Text, Required)
2. **Email Address** (Text, Required)
3. **Company/Organization** (Text, Optional)
4. **Contact Number** (Text, Optional)
5. **Current Forklift Usage** (Multiple choice)
   - New to forklifts
   - Replacing existing fleet
   - Expanding current fleet
   - Other
6. **Timeline for Implementation** (Multiple choice)
   - Immediate (1-3 months)
   - Medium term (3-6 months)
   - Long term (6+ months)
   - Just exploring options
7. **Additional Requirements/Questions** (Long text, Optional)

### 1.3 Create Form for 30T Loader
1. **Form Title**: "30T Loader - Product Inquiry"
2. **Description**: "Thank you for your interest in our 30T Electric Mining Loader. Please fill out the form below and our team will contact you within 24 hours."

**Add these questions:**
1. **Full Name** (Text, Required)
2. **Email Address** (Text, Required)
3. **Company/Organization** (Text, Optional)
4. **Contact Number** (Text, Optional)
5. **Industry Sector** (Multiple choice)
   - Mining
   - Construction
   - Agriculture
   - Manufacturing
   - Other
6. **Current Fleet Size** (Multiple choice)
   - 1-5 vehicles
   - 6-20 vehicles
   - 21-50 vehicles
   - 50+ vehicles
7. **Timeline for Implementation** (Multiple choice)
   - Immediate (1-3 months)
   - Medium term (3-6 months)
   - Long term (6+ months)
   - Just exploring options
8. **Additional Requirements/Questions** (Long text, Optional)

## Step 2: Configure Form Settings

### 2.1 Response Settings
1. Go to "Settings" (three dots menu)
2. **Who can fill out this form**: Anyone can respond
3. **Response options**:
   - ✅ Record name (if signed in)
   - ✅ One response per person
   - ✅ Send email receipt to respondents
4. **Response notifications**:
   - ✅ Get email notification of each response
   - Set notification email to: `connect@blumotiv.com`

### 2.2 Thank You Message
Customize the thank you message:
```
Thank you for your interest in BluMotiv's electric vehicles! 

We have received your inquiry and our team will contact you within 24 hours to discuss your requirements.

For immediate assistance, please contact us at:
📧 connect@blumotiv.com
🌐 blumotiv.com

Best regards,
The BluMotiv Team
```

## Step 3: Get Form URLs

### 3.1 Get Shareable Links
1. Click "Share" button on each form
2. Click "Copy" to get the form URL
3. The URL will look like: `https://forms.office.com/r/ABC123XYZ`

### 3.2 Update Code
Replace the placeholder URLs in `ProductsPage.tsx`:

```typescript
const microsoftFormsUrls = {
  forklift: 'https://forms.office.com/r/YOUR_ACTUAL_FORKLIFT_FORM_ID',
  loader: 'https://forms.office.com/r/YOUR_ACTUAL_LOADER_FORM_ID'
};
```

## Step 4: Test Integration

### 4.1 Test Form Access
1. Visit your website's Products page
2. Click "Express Interest" on each product
3. Verify forms open in new tabs
4. Test form submission
5. Check that notifications arrive at `connect@blumotiv.com`

### 4.2 Test Fallback
If forms fail to load, the system will fallback to email:
`mailto:connect@blumotiv.com?subject=Product Inquiry - [Product Name]`

## Step 5: Response Management

### 5.1 View Responses
1. Go to Microsoft Forms dashboard
2. Click on each form
3. Go to "Responses" tab
4. View individual responses or export to Excel

### 5.2 Email Notifications
- Each form submission sends an email to `connect@blumotiv.com`
- Email includes all form responses
- Respondent gets a confirmation receipt

## Benefits of Microsoft Forms

✅ **Professional Integration**: Native Microsoft ecosystem
✅ **No Third-party Dependencies**: No EmailJS setup required
✅ **Better Data Collection**: Structured form responses
✅ **Easy Management**: View responses in dashboard
✅ **Automatic Notifications**: Email alerts for new submissions
✅ **Excel Export**: Easy data analysis and CRM integration
✅ **Mobile Friendly**: Optimized for all devices
✅ **Spam Protection**: Built-in security features

## Current Code Behavior

### Button Click Action:
1. User clicks "Express Interest" button
2. Opens Microsoft Form in new tab (`_blank`)
3. User fills out form on Microsoft's platform
4. Form submission sends notification to `connect@blumotiv.com`
5. User sees thank you message

### Fallback Behavior:
If form URL is not configured or fails:
- Opens default email client
- Pre-filled with `connect@blumotiv.com`
- Subject line includes product name

## Next Steps

1. ✅ Create both Microsoft Forms
2. ✅ Configure notification settings  
3. ✅ Update URLs in code
4. ✅ Test form submissions
5. ✅ Verify email notifications work
6. ✅ Train team on response management

## Support

If you need help:
- Microsoft Forms documentation: https://support.microsoft.com/forms
- Test form submissions before going live
- Verify email notifications are working
- Check spam folders for form notifications

# Product Inquiry EmailJS Template Setup Guide

## Overview
This guide helps you set up a separate EmailJS template specifically for product inquiries from the BluMotiv Products page.

## Step 1: Access EmailJS Dashboard
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com)
2. Log in to your account
3. Select your service: `service_xazd4ba`

## Step 2: Create New Template
1. Click on "Email Templates" in the left sidebar
2. Click "Create New Template"
3. Give it a name: "BluMotiv Product Inquiry"
4. Set Template ID: `template_product_inquiry`

## Step 3: Copy Template Content
1. Open the file: `product-inquiry-emailjs-template.html`
2. Copy the entire HTML content
3. Paste it into the EmailJS template editor
4. Make sure to use the "HTML" editor mode

## Step 4: Configure Template Settings
- **Template Name**: BluMotiv Product Inquiry
- **Template ID**: `template_product_inquiry`
- **Subject**: `New Product Inquiry - {{product_interest}} from {{from_name}}`
- **To Email**: `connect@blumotiv.com`
- **Reply To**: `{{from_email}}`

## Step 5: Template Variables
The template uses these variables:
- `{{to_email}}` - Always set to connect@blumotiv.com
- `{{from_name}}` - Customer's name
- `{{from_email}}` - Customer's email
- `{{company}}` - Customer's company
- `{{contact_number}}` - Customer's phone number
- `{{product_interest}}` - Product they're interested in
- `{{message}}` - Customer's message
- `{{submission_date}}` - Date of submission

## Step 6: Test Template
1. Use EmailJS's test feature
2. Fill in sample data for all variables
3. Send a test email to verify formatting
4. Check that email arrives at connect@blumotiv.com

## Step 7: Update Configuration
The code has been updated to use `EMAILJS_CONFIG.PRODUCT_TEMPLATE_ID`
Make sure the template ID in EmailJS matches: `template_product_inquiry`

## Template Features
✅ Professional BluMotiv branding
✅ Clear product inquiry identification
✅ Structured customer information display
✅ Mobile-responsive design
✅ Easy-to-read formatting
✅ Call-to-action for quick response
✅ Proper contact information layout

## Difference from Job Application Template
- **Recipient**: connect@blumotiv.com (vs careers@blumotiv.com)
- **Purpose**: Product inquiries (vs job applications)
- **Fields**: Company, product interest (vs job title, experience)
- **Design**: Product-focused branding
- **Call-to-action**: Sales follow-up (vs recruitment follow-up)

## Next Steps
1. Create the template in EmailJS dashboard
2. Test with sample data
3. Verify emails are received at connect@blumotiv.com
4. Update any styling if needed

## Support
If you encounter issues:
- Check EmailJS service limits
- Verify template ID matches exactly
- Ensure all required variables are included
- Test with simple data first

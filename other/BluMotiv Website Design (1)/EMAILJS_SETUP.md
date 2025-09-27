# EmailJS Setup Guide for BluMotiv Careers Page

## Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. Note down your **Service ID**

## Step 3: Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

```
Subject: New Job Application - {{job_title}}

Dear HR Team,

You have received a new job application for the position: {{job_title}} in {{job_department}} department.

Candidate Details:
- Name: {{candidate_name}}
- Email: {{candidate_email}}
- Mobile: {{candidate_mobile}}
- Experience: {{candidate_experience}}
- Education: {{candidate_education}}

Cover Letter:
{{cover_letter}}

Resume: {{resume_name}}

Application submitted on: {{application_date}}

Best regards,
BluMotiv Careers System
```

4. Save the template and note down your **Template ID**

## Step 4: Get Public Key
1. Go to "Account" > "General"
2. Find your **Public Key** (User ID)

## Step 5: Update Configuration
1. Open `src/config/emailjs.ts`
2. Replace the placeholder values:

```typescript
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'your_actual_service_id',
  TEMPLATE_ID: 'your_actual_template_id', 
  PUBLIC_KEY: 'your_actual_public_key',
};
```

## Step 6: Test the Integration
1. Run your application: `npm run dev`
2. Navigate to the Careers page
3. Click on any job card
4. Fill out the application form
5. Submit to test the email functionality

## Important Notes
- EmailJS free plan allows 200 emails per month
- Make sure to replace `careers@blumotiv.com` with your actual HR email
- The resume file name will be included in the email, but the actual file won't be attached (EmailJS limitation)
- For file attachments, consider using a file upload service like Cloudinary or AWS S3

## Troubleshooting
- Check browser console for any errors
- Verify all IDs are correct in the configuration
- Ensure your email service is properly connected
- Check EmailJS dashboard for delivery status
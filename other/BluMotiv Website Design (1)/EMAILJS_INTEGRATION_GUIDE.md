# EmailJS Integration Guide for BluMotiv Careers

## Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account (200 emails/month)
3. Verify your email address

## Step 2: Add Email Service
1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose **Gmail** (recommended) or your preferred email provider
4. Follow the connection steps:
   - For Gmail: Allow EmailJS to access your Gmail account
   - Note down the **Service ID** (e.g., `service_blumotiv`)

## Step 3: Create Email Template
1. Go to **"Email Templates"** in dashboard
2. Click **"Create New Template"**
3. Set **Template Name**: `Job Application - BluMotiv`
4. Use this template content:

### Email Template:
```
Subject: New Job Application - {{job_title}} | {{candidate_name}}

Dear BluMotiv HR Team,

You have received a new job application through the BluMotiv careers website.

=== JOB DETAILS ===
Position: {{job_title}}
Department: {{job_department}}
Application Date: {{application_date}}

=== CANDIDATE INFORMATION ===
Name: {{candidate_name}}
Email: {{candidate_email}}
Mobile: {{candidate_mobile}}
Experience: {{candidate_experience}}
Education: {{candidate_education}}

=== COVER LETTER ===
{{cover_letter}}

=== RESUME ===
Resume File: {{resume_name}}
Note: The actual resume file needs to be downloaded from the candidate's email or requested separately, as EmailJS cannot attach files directly.

=== CONTACT CANDIDATE ===
You can reach the candidate at:
- Email: {{candidate_email}}
- Phone: {{candidate_mobile}}

Best regards,
BluMotiv Careers System
```

5. Save the template and note the **Template ID** (e.g., `template_job_application`)

## Step 4: Get Public Key
1. Go to **"Account"** → **"General"**
2. Find your **Public Key** (User ID)
3. Copy this key (e.g., `user_abc123xyz`)

## Step 5: Update Configuration
Open `src/config/emailjs.ts` and replace with your actual values:

```typescript
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_xazd4ba', // Your actual service ID
  TEMPLATE_ID: 'template_xp2ghjh', // Your actual template ID
  PUBLIC_KEY: 'jaKtwdchhmuviturR', // Your actual public key
};
```

## Step 6: Set Destination Email
In `src/components/JobApplicationPage.tsx`, update line 67:
```typescript
to_email: 'hr@blumotiv.com', // Replace with your actual HR email
```

## Step 7: Test Integration
1. Run the application: `npm run dev`
2. Navigate to Careers page
3. Click on any job card
4. Fill out the application form
5. Submit and check your email

## Step 8: EmailJS Dashboard Monitoring
- Check **"Logs"** section in EmailJS dashboard
- Monitor email delivery status
- View usage statistics

## Important Notes

### Free Plan Limitations:
- 200 emails per month
- EmailJS branding in emails
- Basic support

### File Upload Limitation:
- EmailJS cannot send file attachments
- Resume file name is included in email
- Consider using cloud storage (Cloudinary, AWS S3) for actual file uploads

### Security:
- Public key is safe to expose in frontend
- Service ID and Template ID are also safe
- Never expose private keys in frontend code

### Troubleshooting:
1. **Email not received**: Check spam folder
2. **403 Error**: Verify public key is correct
3. **Template Error**: Check all template variables are defined
4. **Service Error**: Ensure email service is properly connected

## Production Recommendations

### For Production Use:
1. **Upgrade to paid plan** for more emails and remove branding
2. **Add file upload service** for resume attachments
3. **Set up email templates** for different job departments
4. **Add auto-reply** to candidates confirming application receipt
5. **Implement application tracking** system

### Email Template Variations:
Create different templates for different departments:
- `template_engineering` - For engineering roles
- `template_sales` - For sales roles
- `template_design` - For design roles

This allows for customized email routing and handling.
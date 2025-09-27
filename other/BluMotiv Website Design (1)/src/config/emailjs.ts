// EmailJS Configuration
// Replace these values with your actual EmailJS service details

export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_xazd4ba', // Your actual EmailJS service ID
  TEMPLATE_ID: 'template_xp2ghjh', // Job application template ID
  PRODUCT_TEMPLATE_ID: 'template_product_inquiry', // Product inquiry template ID (to be created)
  PUBLIC_KEY: 'jaKtwdchhmuviturR', // Your actual EmailJS public key
};

// Job Application Template variables:
// {{to_email}} - Recipient email (careers@blumotiv.com)
// {{from_name}} - Candidate's name
// {{from_email}} - Candidate's email
// {{job_title}} - Job title applied for
// {{job_department}} - Job department
// {{candidate_name}} - Candidate's full name
// {{candidate_email}} - Candidate's email
// {{candidate_mobile}} - Candidate's mobile number
// {{candidate_experience}} - Years of experience
// {{candidate_education}} - Education background

// Product Inquiry Template variables:
// {{to_email}} - Recipient email (connect@blumotiv.com)
// {{from_name}} - Customer's name
// {{from_email}} - Customer's email
// {{company}} - Customer's company
// {{contact_number}} - Customer's contact number
// {{product_interest}} - Product they're interested in
// {{message}} - Customer's message
// {{inquiry_type}} - Type of inquiry (Product Inquiry)
// {{submission_date}} - Date of submission
// {{cover_letter}} - Cover letter content
// {{resume_name}} - Resume file name
// {{application_date}} - Date of application
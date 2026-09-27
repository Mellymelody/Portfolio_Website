import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const sanitize = (str) => {
  return str.trim().replace(/[<>]/g, '');
};

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, email, subject, message } = JSON.parse(event.body);

    const errors = [];
    if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
    if (!email || !validateEmail(email)) errors.push('Valid email required');
    if (!subject || subject.trim().length < 3) errors.push('Subject must be at least 3 characters');
    if (!message || message.trim().length < 10) errors.push('Message must be at least 10 characters');

    if (errors.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, errors })
      };
    }

    const cleanData = {
      name: sanitize(name),
      email: sanitize(email).toLowerCase(),
      subject: sanitize(subject),
      message: sanitize(message)
    };

    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert([cleanData]);

    if (dbError) throw dbError;

    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: ['princelouis558@gmail.com'],
      subject: `New Contact: ${cleanData.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${cleanData.name}</p>
        <p><strong>Email:</strong> ${cleanData.email}</p>
        <p><strong>Subject:</strong> ${cleanData.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${cleanData.message.replace(/\n/g, '<br>')}</p>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Message sent successfully!' })
    };
  } catch (err) {
    console.error('Contact form error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, errors: ['Server error. Please try again.'] })
    };
  }
}
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// ---- Config (set in Netlify Dashboard > Site Settings > Environment Variables) ----
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_TO_EMAIL =
  process.env.CONTACT_TO_EMAIL || 'princelouis558@gmail.com';
// Use a verified sender in production. Resend's onboarding address only
// delivers to the Resend account owner, so override via CONTACT_FROM_EMAIL.
const CONTACT_FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL ||
  'Portfolio Contact <onboarding@resend.dev>';

// ---- Simple in-memory rate limit (per function instance) ----
// NOTE: Netlify Functions are serverless/ephemeral, so this is best-effort.
// For strict global limits use Redis/Upstash or Netlify Rate Limiting.
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_MAX = 5; // max submissions per IP per window
const hits = new Map(); // ip -> number[]

function isRateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  // Prevent unbounded growth
  if (hits.size > 5000) {
    const oldest = [...hits.keys()].slice(0, 1000);
    oldest.forEach((k) => hits.delete(k));
  }
  return arr.length > RATE_MAX;
}

const validateEmail = (email) => {
  return (
    typeof email === 'string' &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
};

const sanitize = (str, max) => {
  return String(str).trim().replace(/[<>\0]/g, '').slice(0, max);
};

const escapeHtml = (str) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const json = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    ...extraHeaders,
  },
  body: JSON.stringify(body),
});

export async function handler(event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true });
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, errors: ['Method Not Allowed'] });
  }

  // Fail fast when the function is misconfigured (don't leak which var).
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !RESEND_API_KEY) {
    console.error('Contact function misconfigured: missing env vars');
    return json(500, {
      success: false,
      errors: ['Server error. Please try again later.'],
    });
  }

  const ip =
    event.headers?.['x-nf-client-connection-ip'] ||
    event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
    'unknown';

  if (isRateLimited(ip)) {
    return json(
      429,
      {
        success: false,
        errors: ['Too many messages. Please wait a few minutes and try again.'],
      },
      { 'Retry-After': '600' }
    );
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { success: false, errors: ['Invalid request body.'] });
  }

  // Honeypot: bots fill hidden "website" field. Pretend success, store nothing.
  if (payload.website && String(payload.website).trim() !== '') {
    return json(200, {
      success: true,
      message: 'Message sent successfully!',
    });
  }

  const { name, email, subject, message } = payload;

  const errors = [];
  if (!name || String(name).trim().length < 2)
    errors.push('Name must be at least 2 characters');
  if (!email || !validateEmail(String(email).trim()))
    errors.push('Valid email required');
  if (!subject || String(subject).trim().length < 3)
    errors.push('Subject must be at least 3 characters');
  if (!message || String(message).trim().length < 10)
    errors.push('Message must be at least 10 characters');
  if (String(name || '').length > 100)
    errors.push('Name must be under 100 characters');
  if (String(subject || '').length > 150)
    errors.push('Subject must be under 150 characters');
  if (String(message || '').length > 2000)
    errors.push('Message must be under 2000 characters');

  if (errors.length > 0) {
    return json(400, { success: false, errors });
  }

  const cleanData = {
    name: sanitize(name, 100),
    email: sanitize(email, 254).toLowerCase(),
    subject: sanitize(subject, 150),
    message: sanitize(message, 2000),
  };

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert([cleanData]);

    if (dbError) throw dbError;

    const resend = new Resend(RESEND_API_KEY);
    const { error: emailError } = await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      replyTo: cleanData.email,
      subject: `New Contact: ${cleanData.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(cleanData.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(cleanData.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(cleanData.subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(cleanData.message).replace(/\n/g, '<br>')}</p>
      `,
    });

    if (emailError) throw emailError;

    return json(200, {
      success: true,
      message: 'Message sent successfully!',
    });
  } catch (err) {
    console.error('Contact form error:', err?.message || err);
    return json(500, {
      success: false,
      errors: ['Server error. Please try again.'],
    });
  }
}

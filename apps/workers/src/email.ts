import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'test');

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] Skipping (no API key):', opts.subject, '->', opts.to);
    return;
  }

  const { error } = await resend.emails.send({
    from: 'KiteID <noreply@kiteid.xyz>',
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) {
    console.error('[email] Send failed:', error);
    throw error;
  }
}

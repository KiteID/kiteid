import { Queue, Worker } from 'bullmq';
import { sendEmail } from '../email';
import { connection } from '../redis';

export const welcomeQueue = new Queue('kiteid:welcome', { connection });

export type WelcomeJobData = {
  email: string;
  name: string;
  address: string;
};

export function createWelcomeWorker() {
  return new Worker<WelcomeJobData>(
    'kiteid:welcome',
    async (job) => {
      const { email, name, address } = job.data;

      await sendEmail({
        to: email,
        subject: `Welcome to KiteID — ${name}.kite is yours!`,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #C9986A;">Welcome to KiteID!</h1>
          <p>You've successfully registered <strong>${name}.kite</strong>.</p>
          <p>Your domain is now live on the Kite AI network.</p>
          <p>
            <a href="https://kiteid.xyz/names/${name}"
               style="display: inline-block; padding: 12px 24px; background: #C9986A; color: #FAF7F0; text-decoration: none; border-radius: 8px;">
              Manage Your Domain
            </a>
          </p>
          <p style="color: #9B8564; font-size: 12px; margin-top: 32px;">
            Wallet: ${address}<br/>
            This email was sent because you registered a .kite domain.
          </p>
        </div>`,
      });
    },
    { connection },
  );
}

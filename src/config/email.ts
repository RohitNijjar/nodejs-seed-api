import nodemailer from 'nodemailer';

import { env } from './env';

const transporter = nodemailer.createTransport({
  service: env.EMAIL_SERVICE,
  auth: {
    user: env.ADMIN_EMAIL,
    pass: env.ADMIN_PASSWORD,
  },
});

export { transporter };

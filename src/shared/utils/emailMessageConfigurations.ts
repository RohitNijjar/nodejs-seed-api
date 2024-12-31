import { EmailMessage } from '../models';

export const createEmailMessageConfigurations = (
  emailMessage: EmailMessage,
): {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
} => {
  return {
    from: emailMessage.from,
    to: emailMessage.to,
    subject: emailMessage.subject,
    text: emailMessage.text,
    html: emailMessage.html,
  };
};

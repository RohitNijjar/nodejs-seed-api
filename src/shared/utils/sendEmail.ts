import { transporter } from '../../config';
import { EmailMessage } from '../models';
import { createEmailMessageConfigurations } from './emailMessageConfigurations';

export const sendEmail = async (emailMessage: EmailMessage): Promise<void> => {
  const emailMessageConfigurations =
    createEmailMessageConfigurations(emailMessage);
  await transporter.sendMail(emailMessageConfigurations);
};

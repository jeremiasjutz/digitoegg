import sgMail from '@sendgrid/mail';

import type { MailDataRequired } from '@sendgrid/mail';

export const sendMail = async ({
  to,
  activationUrl,
}: Record<string, string>) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  const msg: MailDataRequired = {
    to,
    from: 'jeremias.jutz@stud.hslu.ch',
    templateId: 'd-8ddd2612b71e41228d51db8b77b937a7',
    dynamicTemplateData: {
      activationUrl,
    },
  };
  try {
    await sgMail.send(msg);
  } catch (err) {
    console.error(err);
  }
};

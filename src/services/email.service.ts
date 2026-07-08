import nodemailer from "nodemailer";
import { brevoConfig } from "@/config/env";

export class EmailConfigurationError extends Error {}
export class EmailDeliveryError extends Error {}

function getEmailErrorMessage(err: unknown) {
  if (err instanceof Error) {
    return err.message;
  }

  return "Erro desconhecido";
}

interface SendEmailParams {
  to: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail({ to, name, subject, htmlContent, textContent }: SendEmailParams) {
  if (!brevoConfig.smtpUser || !brevoConfig.smtpPass || !brevoConfig.senderEmail) {
    throw new EmailConfigurationError("Configuracao do Brevo nao encontrada");
  }

  const transporter = nodemailer.createTransport({
    host: brevoConfig.smtpHost,
    port: brevoConfig.smtpPort,
    secure: brevoConfig.smtpPort === 465,
    auth: {
      user: brevoConfig.smtpUser,
      pass: brevoConfig.smtpPass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"${brevoConfig.senderName}" <${brevoConfig.senderEmail}>`,
      to: `"${name}" <${to}>`,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(
      `E-mail aceito pela Brevo: to=${to} from=${brevoConfig.senderEmail} response=${info.response}`
    );
  } catch (err) {
    const message = getEmailErrorMessage(err);

    console.error("Falha ao enviar e-mail pelo Brevo:", message);
    throw new EmailDeliveryError(`Falha ao enviar e-mail pelo Brevo: ${message}`);
  }
}

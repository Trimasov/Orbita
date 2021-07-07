import mailgun from "mailgun.js";
import Email from "email-templates";
import path from "path";
import { User } from "../models/user";
import { Device } from "../models/device";
import { Geozone } from "../models/geozone";

export async function sendEmail(recipient, subject, text: string = null, html: string = null) {
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "",
    public_key: process.env.MAILGUN_PUBLIC_KEY || "",
    url: "https://api.eu.mailgun.net"
  });

  try {
    return await mg.messages.create(process.env.MAILGUN_DOMAIN || "", {
      from: `general@orbita.one <info@${process.env.MAILGUN_DOMAIN || ""}>`,
      to: recipient.length ? recipient : [recipient],
      subject: subject,
      text,
      html
    });
  } catch(e) {
    console.log(e);
    // return errorLog.error(e);
  }
}

export async function sendResetPasswordEmail(recipient, token) {
  const email = new Email();

  const templateDir = path.join(__dirname, "../emails/resetPassword");
  const html = await email.render(templateDir, {
    token: token
  });
  return await sendEmail(recipient, "Сброс пароля", null, html);
}

export async function sendNewOwnerEmail(recipient, user) {
  const email = new Email();

  const templateDir = path.join(__dirname, "../emails/newOwner");
  const html = await email.render(templateDir, {
    user
  });
  return await sendEmail(recipient, "Сброс пароля", null, html);
}

export async function sendGeozoneEscapeEventEmail(recipient: string, device: Device, geozone: Geozone) {
  const email = new Email();

  const templateDir = path.join(__dirname, "../emails/geozoneEscape");
  const html = await email.render(templateDir, {
    device,
    geozone
  });
  return await sendEmail(recipient, "Выход из геозоны", null, html);
}


import transporter from "../config/nodemailer";
import {GMAIL_LOGIN, APP_ORIGIN} from "../constants/env";

export const sendVerificationEmail = async (email: string, username: string, token: string) => {
  const verificationUrl = `${APP_ORIGIN}/verify-email?email=${email}&token=${token}`;

  const mailOptions = {
    from: GMAIL_LOGIN,
    to: email,
    subject: 'Email Verification',
    html: `<h2>Hello, ${username}</h2>
           <p>Please click on the link below to verify your email:</p>
           <a href="${verificationUrl}">Verify your email</a>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending verification email: ${error}`);
    throw new Error("Error sending verification email");
  }
}


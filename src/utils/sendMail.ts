import transporter from "../config/nodemailer";
import { GMAIL_LOGIN, APP_ORIGIN } from "../constants/env";

export const sendVerificationEmail = async (
  email: string,
  username: string,
  token: string
) => {
  const verificationUrl = `${APP_ORIGIN}/verify-email?email=${email}&token=${token}`;

  const mailOptions = {
    from: GMAIL_LOGIN,
    to: email,
    subject: "Email Verification",
    html: `    <div style="font-family: Arial, sans-serif; font-size: large; font-weight: lighter; background: linear-gradient(to right, black, #374151); color: white; padding: 30px;">
        <div style="padding: 20px; color: white;">
            <p style="font-size: x-large; border-bottom: #f31260 solid 2px; padding-bottom: 10px; text-align: center; color: white;">
                ${username}, thanks for joining TalllorencDEV
            </p>
    
            <p>Click the button below to confirm your address:</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #f31260; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0;">Confirm Address</a>
    
            <p>If the button doesn’t work, copy and paste the following link into your browser’s address bar:</p>
            <p><a href="${verificationUrl}" style="color: #f31260;">${verificationUrl}</a></p>
    
            <p>If you did not register on our website, please ignore this email.</p>
        </div>
        

        <div style="padding: 20px 15px; margin-top: 30px; text-align: center; border-top: #f31260 solid 2px;">
            <p style="margin: 0;">Best regards, A.L.</p>
            <p style="margin: 0;">©2024 dev by A.L. Kazakhstan, Karaganda. All rights reserved.</p>
        </div>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending verification email: ${error}`);
    throw new Error("Error sending verification email");
  }
};

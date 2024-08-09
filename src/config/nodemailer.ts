import nodemailer from 'nodemailer';
import {GMAIL_LOGIN, GMAIL_PASSWORD, SERVICE} from "../constants/env";

const transporter = nodemailer.createTransport({
  service: SERVICE,
  auth: {
    user: GMAIL_LOGIN,
    pass: GMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

export default transporter;
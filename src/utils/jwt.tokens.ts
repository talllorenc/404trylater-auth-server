import crypto from "crypto";

export const generateEmailToken = () => {
  return crypto.randomBytes(32).toString('hex');
}
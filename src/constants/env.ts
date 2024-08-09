const getEnv = (key: string, defaultValue?: string) => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export const NODE_ENV = getEnv("NODE_ENV", "development");
export const PORT = getEnv("PORT", "8080");
export const MONGO_URI = getEnv("MONGO_URI");
export const APP_ORIGIN = getEnv("APP_ORIGIN");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
export const SERVICE = getEnv("SERVICE");
export const GMAIL_LOGIN = getEnv("GMAIL_LOGIN");
export const GMAIL_PASSWORD = getEnv("GMAIL_PASSWORD");
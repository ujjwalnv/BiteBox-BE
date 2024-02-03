import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT
const JWT_ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_TOKEN_SECRET;
const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const SENDER_EMAIL_ADDRESS = process.env.SENDER_EMAIL_ADDRESS;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const WEBSITE_URL = process.env.WEBSITE_URL ?? "http://localhost:8080";
const MONGO_DB_URL = process.env.MONGO_DB_URL
const JWT_EMAIL_VERIFICATION_SECRET = process.env.JWT_EMAIL_VERIFICATION_SECRET

export {
    PORT,
    JWT_ACCESS_TOKEN_SECRET,
    EMAIL_USERNAME,
    EMAIL_PASSWORD,
    SENDER_EMAIL_ADDRESS,
    EMAIL_SERVICE,
    WEBSITE_URL,
    MONGO_DB_URL,
    JWT_EMAIL_VERIFICATION_SECRET
}   
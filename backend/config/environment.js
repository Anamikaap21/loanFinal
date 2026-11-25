import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realcred',
  JWT_SECRET: process.env.JWT_SECRET || 'realcred_jwt_fallback_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  INITIAL_ADMIN: {
    email: process.env.INITIAL_ADMIN_EMAIL || 'admin@realcred.in',
    password: process.env.INITIAL_ADMIN_PASSWORD || 'Admin@RealCred2026!',
    name: process.env.INITIAL_ADMIN_NAME || 'RealCred Super Admin',
    phone: process.env.INITIAL_ADMIN_PHONE || '7048976349'
  }
};

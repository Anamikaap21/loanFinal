import mongoose from 'mongoose';
import { ENV } from './environment.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[RealCred Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[RealCred Database Error] MongoDB Connection Failed: ${error.message}`);
    console.error(`Ensure local MongoDB service is running on ${ENV.MONGO_URI} (check with MongoDB Compass)`);
    throw error;
  }
};

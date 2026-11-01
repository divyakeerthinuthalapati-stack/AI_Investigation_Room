import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  if (env.demoMode) return;
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.info('MongoDB connected');
}

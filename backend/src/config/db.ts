import pg from 'pg';
import mongoose from 'mongoose';
import { createClient } from 'redis';

const { Pool } = pg;

export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://habithub:habithub@localhost:5432/habithub',
  max: 10,
});

export async function connectMongo(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/habithub_analytics';
  return mongoose.connect(uri);
}

export const redisClient = createClient({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.warn('Redis error:', err));

export async function connectRedis(): Promise<void> {
  if (!redisClient.isOpen) await redisClient.connect();
}

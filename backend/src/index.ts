import mongoose from 'mongoose';
import { createApp } from './app';
import { env } from './config/env';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const connectMongo = async (retries = 15, delayMs = 2000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(env.mongoUri);
      console.log('Connected to MongoDB');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed`);
      if (attempt === retries) {
        throw error;
      }
      await wait(delayMs);
    }
  }
};

const start = async () => {
  await connectMongo();
  const app = createApp();

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${env.port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});

import mongoose from 'mongoose';

export default async function connectDB(uri) {
  // if (!uri) {
  //   throw new Error('MONGO_URI environment variable is required');
  // }     

  // mongoose.set('strictQuery', true);

  // try {
  //   await mongoose.connect(uri, {
  //     dbName: process.env.MONGO_DB || undefined,
  //     serverSelectionTimeoutMS: 10000, // 10 seconds
  //     socketTimeoutMS: 45000,
  //   });
  //   console.log('✅ MongoDB connected successfully');
  // } catch (error) {
  //   console.error('❌ MongoDB connection error:', error.message);
  //   throw error;
  // }
}

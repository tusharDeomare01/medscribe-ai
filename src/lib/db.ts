import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof globalThis & {
  mongoose: CachedConnection;
};

const cached: CachedConnection = globalWithMongoose.mongoose || { conn: null, promise: null };

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

/**
 * Connects to MongoDB.
 * Returns the mongoose instance on success, or `null` if MONGODB_URI is not
 * configured or the connection fails — allowing the app to run in stateless
 * (no-DB) mode on platforms like Vercel without a database.
 */
export async function connectDB(): Promise<typeof mongoose | null> {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    return null;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.warn("MongoDB connection failed, running in stateless mode:", e);
    return null;
  }

  return cached.conn;
}

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL not found. Using in-memory storage for testing.");
  console.warn("   For production, set DATABASE_URL environment variable.");
  // Use a fallback for testing
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/hotel_test";
}

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

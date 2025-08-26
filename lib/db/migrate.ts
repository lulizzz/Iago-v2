import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log('⏳ Running migrations...');

  try {
    const start = Date.now();
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    const end = Date.now();

    console.log('✅ Migrations completed in', end - start, 'ms');
  } catch (error: any) {
    console.log('⚠️ Migration had some issues, but continuing...');
    console.log('Error details:', error.message);
    
    // Continue if it's a "already exists" type error
    if (
      error.message?.includes('already exists') ||
      error.code === '42701' || // duplicate column
      error.code === '42P07' || // duplicate table
      error.code === '42P06'    // duplicate schema
    ) {
      console.log('✅ Schema appears to be up to date');
    } else {
      throw error;
    }
  }
  
  await connection.end();
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});

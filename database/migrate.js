const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  // Get database URL from environment or use defaults
  const databaseUrl = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'clawhub'}`;

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running migrations...');
    await client.query(schema);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Cannot connect to PostgreSQL database.');
      console.error('Please ensure PostgreSQL is running and check your connection settings:');
      console.error('  - DATABASE_URL environment variable, or');
      console.error('  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD environment variables');
      console.error('\nExample:');
      console.error('  export DATABASE_URL="postgresql://user:password@localhost:5432/clawhub"');
    } else if (error.code === '3D000') {
      console.error('\n❌ Database does not exist.');
      console.error('Please create the database first:');
      console.error('  createdb clawhub');
    } else {
      console.error('\nFull error:', error);
    }
    process.exit(1);
  } finally {
    try {
      await client.end();
    } catch (err) {
      // Ignore errors when closing connection
    }
  }
}

migrate();

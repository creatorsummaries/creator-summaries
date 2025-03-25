const { Client } = require('pg');

async function createTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const query = `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      creator VARCHAR(255) NOT NULL,
      confirmation_token VARCHAR(255),
      confirmed BOOLEAN DEFAULT false,
      unsubscribed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await client.query(query);
  console.log('Table created or already exists.');
  await client.end();
}

createTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

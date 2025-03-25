// index.js

const express = require('express');
const sgMail = require('@sendgrid/mail');
const { Pool } = require('pg');
const { randomBytes } = require('crypto');

// 1. Set the API key from your Render environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 2. Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// 3. Enable JSON parsing for POST requests
app.use(express.json());

// 4. Set up PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 5. Root route (just a sanity check)
app.get('/', (req, res) => {
  res.send("Hello from Creator Summaries via Express!");
});

// 6. Test Email Route (Optional)
app.get('/test-email', async (req, res) => {
  try {
    await sgMail.send({
      to: 'mattrobm@gmail.com',
      from: 'hello@creatorsummaries.com',
      subject: 'Test Email from Creator Summaries',
      text: 'If you received this, SendGrid is working!'
    });
    res.send('Test email sent successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error sending test email.');
  }
});

// 7. POST /subscribe - store subscription & send confirmation email
app.post('/subscribe', async (req, res) => {
  try {
    const { email, creator } = req.body;
    if (!email || !creator) {
      return res.status(400).json({ success: false, message: 'Email and creator are required.' });
    }

    // Generate a random token
    const token = randomBytes(16).toString('hex');

    // Insert subscription into the database
    await pool.query(
      `INSERT INTO subscriptions (email, creator, confirmation_token)
       VALUES ($1, $2, $3)`,
      [email, creator, token]
    );

    // Build a confirmation link
    const confirmUrl = `https://YOUR_RENDER_URL/confirm?token=${token}`;

    // Send the confirmation email
    await sgMail.send({
      to: email,
      from: 'hello@creatorsummaries.com', // Your verified domain
      subject: 'Confirm Your Subscription',
      text: `Thanks for subscribing to ${creator}!
Please confirm by clicking the link below:
${confirmUrl}`
    });

    return res.json({ success: true, message: 'Confirmation email sent!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error subscribing' });
  }
});

// 8. GET /confirm - confirm the subscription using the token
app.get('/confirm', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send('Missing token.');
    }

    // Find the subscription by token
    const result = await pool.query(
      `SELECT * FROM subscriptions WHERE confirmation_token = $1`,
      [token]
    );
    const subscription = result.rows[0];
    if (!subscription) {
      return res.status(404).send('Subscription not found or already confirmed.');
    }

    // Mark it as confirmed
    await pool.query(
      `UPDATE subscriptions
       SET confirmed = true, confirmation_token = null
       WHERE id = $1`,
      [subscription.id]
    );

    res.send(`Subscription confirmed for ${subscription.email}!`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error confirming subscription.');
  }
});

// 9. Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

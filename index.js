// index.js

const express = require('express');
const sgMail = require('@sendgrid/mail');

// 1. Set the API key from your Render environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 2. Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// 3. Root route (just a sanity check)
app.get('/', (req, res) => {
  res.send("Hello from Creator Summaries via Express!");
});

// 4. Test Email Route
app.get('/test-email', async (req, res) => {
  try {
    await sgMail.send({
      to: 'mattrobm@gmail.com',     // <-- Replace with your email
      from: 'hello@creatorsummaries.com',    // <-- Must match your verified domain in SendGrid
      subject: 'Test Email from Creator Summaries',
      text: 'If you received this, SendGrid is working!'
    });
    res.send('Test email sent successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error sending test email.');
  }
});

// 5. Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

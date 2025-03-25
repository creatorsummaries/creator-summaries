const express = require('express');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send("Hello from Creator Summaries via Express!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

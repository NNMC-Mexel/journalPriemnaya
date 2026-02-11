const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 15000;

// Redirect root to login page
app.get('/', (req, res) => {
  res.redirect('/journal-login.html');
});

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
});

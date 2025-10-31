const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 2026;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root API endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Loan API is running',
    status: 'success'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;


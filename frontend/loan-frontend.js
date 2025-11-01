const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
// Use app.use() instead of app.get('*') for Express v5 compatibility
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Use your preferred port
const PORT = process.env.PORT || 2027;
app.listen(PORT, () => {
    console.log(`React app is running on port ${PORT}`);
});

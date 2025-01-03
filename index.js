const express = require('express');
const connectDB = require('./db');
const userRoutes = require('./user Routes');
const { PORT } = require('./config');
const path = require('path');
const cors = require('cors');

connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// API routes
app.use('/api/users', userRoutes);

// Serve HTML files
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

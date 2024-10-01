const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const authRoutes = require('./routes/auth');
const codeRoutes = require('./routes/code');
const multimodelRoutes = require('./routes/multimodel');
// const codeTestRoutes = require('./routes/codeTest');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/multimodel', multimodelRoutes);
// app.use('/api/code', codeTestRoutes);

app.get('/',(req,res)=>{
  res.send('Hello World')
})

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
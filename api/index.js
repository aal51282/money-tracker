const express = require('express');
const cors = require('cors');
const Transaction = require('./models/Transaction.js');
const app = express();
const mongoose = require("mongoose");
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
});

// Database connection
mongoose.connect(process.env.MONGO_URL, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ body: 'test ok' });
});

// Create a new transaction
app.post('/api/transaction', async (req, res, next) => {
  try {
    const { name, description, datetime, price } = req.body;
    if (!name || !datetime || price === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const transaction = await Transaction.create({
      name,
      description: description || '', // Make description optional
      datetime,
      price
    });
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

// Get all transactions from database
app.get('/api/transactions', async (req, res, next) => {
  try {
    const transactions = await Transaction.find().sort({ datetime: -1 });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// Update a transaction
app.put('/api/transaction/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, datetime, price } = req.body;
    if (!name || !datetime || price === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { name, description, datetime, price },
      { new: true, runValidators: true }
    );
    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(updatedTransaction);
  } catch (error) {
    next(error);
  }
});

// Delete a transaction
app.delete('/api/transaction/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete multiple transactions
app.post('/api/transactions/delete', async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty array of IDs' });
    }
    const result = await Transaction.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No transactions found' });
    }
    res.json({ message: `${result.deletedCount} transaction(s) deleted successfully` });
  } catch (error) {
    next(error);
  }
});

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

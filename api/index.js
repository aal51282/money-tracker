const express = require('express');
const cors = require('cors');
const Transaction = require('./models/Transaction.js');
const app = express();
const mongoose = require("mongoose");
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
    res.json({ body: 'test ok' });
});

// Create a new transaction
app.post('/api/transaction', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL); // Connect to Database
    const { name, description, datetime, price } = req.body;
    const transaction = await Transaction.create({name, description, datetime, price});
    res.json(transaction);
});

// Get all transactions from database
app.get('/api/transactions', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const transactions = await Transaction.find().sort({ datetime: -1 });
    res.json(transactions);
});

// Update a transaction
app.put('/api/transaction/:id', async (req, res) => {
  await mongoose.connect(process.env.MONGO_URL);
  const { id } = req.params;
  const { name, description, datetime, price } = req.body;
  try {
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
    res.status(400).json({ message: 'Error updating transaction', error });
  }
});

// Delete a transaction
app.delete('/api/transaction/:id', async (req, res) => {
  await mongoose.connect(process.env.MONGO_URL);
  const { id } = req.params;
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error });
  }
});

app.listen(4040);

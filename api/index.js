const express = require('express');
const cors = require('cors');
const Transaction = require('./models/Transaction.js');
const app = express();
const mongoose = require("mongoose");
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
    res.json({ body: 'test ok' });
});

app.post('/api/transaction', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL); // Connect to Database
    const { name, description, datetime, price } = req.body;
    const transaction = await Transaction.create({name, description, datetime, price});
    res.json(transaction);
});

// Get all transactions from database
app.get('/api/transactions', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const transactions = await Transaction.find();
    res.json(transactions);
});

app.listen(4040);
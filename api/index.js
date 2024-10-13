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
    const { name, description, datetime } = req.body;
    const transaction = await Transaction.create({name, description, datetime});
    res.json(transaction);
});

app.listen(4040);
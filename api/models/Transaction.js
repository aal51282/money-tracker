const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const TransactionSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: "" }, // Make description optional
  datetime: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Associate with User
});

const TransactionModel = model("Transaction", TransactionSchema);

module.exports = TransactionModel;

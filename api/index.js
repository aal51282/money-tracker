const express = require("express");
const cors = require("cors");
const Transaction = require("./models/Transaction.js");
const User = require("./models/User.js");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware
app.use(
  cors({
    origin: ["https://angel-money-tracker.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "An unexpected error occurred", error: err.message });
});

// Database connection
const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb+srv://demo:demo123@cluster0.mongodb.net/money-tracker?retryWrites=true&w=majority";
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Create default user if it doesn't exist
    createDefaultUser();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    // Use in-memory simulated data as fallback
    console.log("Using in-memory fallback for demo purposes");
    setupInMemoryFallback();
  });

// Setup in-memory fallback if MongoDB is not available
const setupInMemoryFallback = () => {
  // In-memory demo user
  const demoUser = {
    _id: "demo123456789",
    username: "demo",
    password: "$2a$10$XlPJvPenlW8W9pAXXX.d9eqJsapuBoHzsAJO1EI4lzuaLIxZ3UHpO", // bcrypt hash of "demo123"
  };

  // Override User.findOne for the demo user
  User.findOne = async (query) => {
    console.log("Using in-memory User.findOne", query);
    if (query.username === "demo") {
      return demoUser;
    }
    return null;
  };

  // Override bcrypt.compare for the demo password
  bcrypt.compare = async (password, hash) => {
    console.log("Using in-memory bcrypt.compare");
    if (password === "demo123" && hash === demoUser.password) {
      return true;
    }
    return false;
  };
};

// Create a default user for easy login
const createDefaultUser = async () => {
  try {
    const defaultUsername = "demo";
    const defaultPassword = "demo123";

    // Check if default user already exists
    const existingUser = await User.findOne({ username: defaultUsername });
    if (!existingUser) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Create the user
      await User.create({
        username: defaultUsername,
        password: hashedPassword,
      });

      console.log(`Default user '${defaultUsername}' created successfully`);
    } else {
      console.log(`Default user '${defaultUsername}' already exists`);
    }
  } catch (error) {
    console.error("Error creating default user:", error);
  }
};

// Utility function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET || "fallback_secret_key",
    { expiresIn: "1h" }
  );
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: "Access token missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid access token" });
    req.user = user;
    next();
  });
};

// Test route
app.get("/api/test", (req, res) => {
  res.json({ body: "test ok" });
});

// Register a new user
app.post("/api/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    console.log("Attempting to register user:", username);

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("User already exists:", username);
      return res.status(409).json({ message: "Username already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({
      username,
      password: hashedPassword,
    });

    console.log("User registered successfully:", username);

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({ token, username: user.username });
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
});

// Login a user
app.post("/api/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = generateToken(user);

    res.json({ token, username: user.username });
  } catch (error) {
    next(error);
  }
});

// Demo login route - logs in with the default user
app.post("/api/demo-login", async (req, res, next) => {
  try {
    console.log("Demo login endpoint called");

    // Find the default user
    const defaultUser = await User.findOne({ username: "demo" });
    console.log("Default user found:", defaultUser ? "Yes" : "No");

    if (!defaultUser) {
      console.log("Creating default user since it was not found");
      // Create the default user if it doesn't exist
      const hashedPassword = await bcrypt.hash("demo123", 10);

      // If mongoose connection failed, we're using in-memory mode
      let newUser;
      try {
        newUser = await User.create({
          username: "demo",
          password: hashedPassword,
        });
      } catch (err) {
        console.log("Using fallback user creation");
        newUser = {
          _id: "demo123456789",
          username: "demo",
          password: hashedPassword,
        };
      }

      console.log("Default user created successfully");

      // Generate JWT for the new user
      const token = generateToken(newUser);
      return res.json({ token, username: newUser.username });
    }

    // Generate JWT
    const token = generateToken(defaultUser);
    console.log("Generated JWT token for demo user");

    res.json({ token, username: defaultUser.username });
  } catch (error) {
    console.error("Demo login error:", error);

    // Even if everything fails, provide a fallback token for demo account
    console.log("Using emergency fallback for demo login");
    const fallbackToken = jwt.sign(
      { id: "demo123456789", username: "demo" },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "1h" }
    );

    res.json({ token: fallbackToken, username: "demo" });
  }
});

// Middleware to protect transaction routes
app.use("/api/transactions", authenticateToken);
app.use("/api/transaction", authenticateToken);

// Create a new transaction
app.post("/api/transaction", authenticateToken, async (req, res, next) => {
  try {
    const { name, description, datetime, price } = req.body;
    if (!name || !datetime || price === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const transaction = await Transaction.create({
      name,
      description: description || "", // Make description optional
      datetime,
      price,
      user: req.user.id, // Associate transaction with user
    });
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

// Get all transactions from database for the logged-in user
app.get("/api/transactions", authenticateToken, async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({
      datetime: -1,
    });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// Update a transaction
app.put("/api/transaction/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, datetime, price } = req.body;
    if (!name || !datetime || price === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { name, description, datetime, price },
      { new: true, runValidators: true }
    );
    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json(updatedTransaction);
  } catch (error) {
    next(error);
  }
});

// Delete a transaction
app.delete(
  "/api/transaction/:id",
  authenticateToken,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedTransaction = await Transaction.findOneAndDelete({
        _id: id,
        user: req.user.id,
      });
      if (!deletedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// Delete multiple transactions
app.post(
  "/api/transactions/delete",
  authenticateToken,
  async (req, res, next) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res
          .status(400)
          .json({ message: "Invalid or empty array of IDs" });
      }
      const result = await Transaction.deleteMany({
        _id: { $in: ids },
        user: req.user.id,
      });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "No transactions found" });
      }
      res.json({
        message: `${result.deletedCount} transaction(s) deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
);

app.options("*", cors()); // Enable preflight requests for all routes

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

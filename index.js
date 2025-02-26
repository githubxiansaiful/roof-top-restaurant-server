const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ubq5tqr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB Client with Connection Pooling
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10, // Maintain up to 10 connections
});

let menuCollection;

async function connectDB() {
  try {
    await client.connect();
    menuCollection = client.db("roofTopRestaurant").collection("menus");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connectDB();

// Routes
app.get('/menu', async (req, res) => {
  try {
    if (!menuCollection) {
      return res.status(500).send("Database not connected");
    }
    const result = await menuCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log("Closing MongoDB connection");
  await client.close();
  process.exit(0);
});

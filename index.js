const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure environment variables are set
if (!process.env.DB_USER || !process.env.DB_PASS) {
  throw new Error('Missing required DB_USER and DB_PASS in environment variables');
}

// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ubq5tqr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Cache MongoDB connection for serverless environments like Vercel
let client;

async function connectToMongoDB() {
  if (!client) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await client.connect();
    console.log("✅ Successfully connected to MongoDB");
  }
  return client;
}

// API Routes
async function run() {
  try {
    const client = await connectToMongoDB();
    const menuCollection = client.db("roofTopRestaurant").collection("menus");

    // GET: Fetch menu items
    app.get('/menu', async (req, res) => {
      try {
        const result = await menuCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.error('❌ Error fetching menu:', error);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });

    console.log("🚀 API Routes initialized");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}
run();

// Root route
app.get('/', (req, res) => {
  res.send('✅ Server is running successfully');
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

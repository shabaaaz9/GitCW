var express = require("express");
let app = express();

app.use(express.json());
app.set('json spaces', 3);

const cors = require("cors");
app.use(cors());

const path = require('path');
let PropertiesReader = require("properties-reader");

// Load properties from the file
let propertiesPath = path.resolve(__dirname, "./dbconnection.properties");
let properties = PropertiesReader(propertiesPath);

// Extract values from the properties file
const dbPrefix = properties.get('db.prefix');
const dbHost = properties.get('db.host');
const dbName = properties.get('db.name');
const dbUser = properties.get('db.user');
const dbPassword = properties.get('db.password');
const dbParams = properties.get('db.params');



const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// MongoDB connection URL
const uri = `${dbPrefix}${dbUser}:${dbPassword}${dbHost}${dbParams}`;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

const PORT = 3000;
let db1; // Declare variable

// Connect to the database
async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db1 = client.db('CW1'); // Use the correct database
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

connectDB();

// Get all courses
app.get('/collections/courses', async (req, res, next) => {
    try {
        const results = await db1.collection('courses').find({}).toArray();
        res.json(results);
    } catch (err) {
        console.error('Error fetching courses:', err.message);
        next(err);
    }
});

// Get course by ID
app.get('/collections/courses/:id', async (req, res, next) => {
    try {
        const result = await db1.collection('courses').findOne({ _id: new ObjectId(req.params.id) });
        res.json(result);
    } catch (err) {
        console.error('Error fetching course:', err.message);
        next(err);
    }
});

// Add a new order
app.post('/collections/orders', async (req, res, next) => {
    try {
        const order = req.body;
        const result = await db1.collection('orders').insertOne(order);
        res.json(result);
    } catch (err) {
        console.error('Error creating order:', err.message);
        next(err);
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ error: 'An error occurred' });
});

// Start the server
const port =  process.env.ENV || 3000;
app.listen(port, ()=>{
    console.log(`Server is running on port 3000`);
});

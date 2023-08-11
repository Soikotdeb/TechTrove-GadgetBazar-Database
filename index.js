const express = require('express');
const cors = require('cors');
const jwt =require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');

// middleware
app.use(cors());
app.use(express.json());
// ---------------------------------------------------------------------------------------------------------------------------------------

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e1mdmag.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

// All Collection Start-----------------------------------------------------------------------------------------------------
const usersCollection = client.db("TechTrove").collection("AllUsers");
const addProductsCollection = client.db("TechTrove").collection("AddProducts");


// All Collection End-----------------------------------------------------------------------------------------------------


// JWT Token 
app.post("/jwt", (req, res) => {
  const user = req.body;
  console.log(user);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10h",
  });
  res.send({ token });
});












//-------------------------------------------------- Code logic operation Start------------------------------------------------------------------------------
// manually first user create and get all users data from client site and store this data

app.post('/manualUsers', async (req, res) => {
  const body = req.body;
  console.log(body);
  try {
    const result = await usersCollection.insertOne(body);
    res.send(result);
  } catch (error) {
    console.error('Error inserting user data:', error);
    res.status(500).json({ error: 'An error occurred while inserting user data.' });
  }
});

// Google first user create from registration page & Login Page and get all users data from client site and store this data
app.post('/GoogleUsers', async (req, res) => {
  const body = req.body;
  console.log(body);
  try {
    const result = await usersCollection.insertOne(body);
    res.send(result);
  } catch (error) {
    console.error('Error inserting user data:', error);
    res.status(500).json({ error: 'An error occurred while inserting user data.' });
  }
});


// Check user role = admin ? instructor ? user to dynamic the dashboard login

  // check user role (admin)
  app.get("/users/admin/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    const result = { admin: user?.role === "admin" };
    res.send(result);
  });

  // Check user role (instructor)
  app.get("/users/instructor/:email", async (req, res) => {
    const email = req.params.email;

    const query = { email: email };
    const user = await usersCollection.findOne(query);
    const result = { instructor: user?.role === "instructor" };
    res.send(result);
  });

  // Check user role (normalUser)
  app.get("/users/user/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const users = await usersCollection.findOne(query);
    const result = { user: users?.role === "user" };
    res.send(result);
  });


    // manage normalUsers  role user  to instructor or admin ------------------------------------------------

  // All Users data Load to the ManageClasses Route in admin dashboard
  app.get("/users", async (req, res) => {
    const result = await usersCollection.find().toArray();
    res.send(result);
  });


// Perform  AddProducts to Instructor dashboard recive and store the data in database-----------------
  app.post('/AddProducts', async (req, res) => {
    const body = req.body;
    console.log(body);
    try {
      const result = await addProductsCollection.insertOne(body);
      res.send(result);
    } catch (error) {
      console.error('Error inserting user data:', error);
      res.status(500).json({ error: 'An error occurred while inserting user data.' });
    }
  });


  // instructor My Added Products data get
  app.get("/users/instructor/myAddedProducts/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const query = { instructorEmail: email }; // Update the query to match instructorEmail field
      const data = await addProductsCollection.find(query).toArray(); // Find all matching documents and convert to an array
      res.send(data);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  });


// instructor My Added Products data delete
app.delete('/MyAddedProduct/:id', async (req, res) => {
  const classId = req.params.id;
  const query = { _id: new ObjectId(classId) };
  const deleteResult = await addProductsCollection.deleteOne(query);
  const deletedCount = deleteResult.deletedCount;
  console.log('Deleted count:', deletedCount);
  res.send({ deletedCount });
});





//-------------------------------------------------- Code logic operation End------------------------------------------------------------------------------
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



  

// ---------------------------------------------------------------------------------------------------------------------------------------
app.get('/',(req,res)=>{
    res.send('TechTrove Server is Running')
})
app.listen(port,()=>{
    console.log(`TechTrove Server is Running On PORT ${port}`);
})
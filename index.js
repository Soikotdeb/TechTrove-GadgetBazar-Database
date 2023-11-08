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
const AskedQuestionsCollection = client.db("TechTrove").collection("AskedQuestions");
const UserFeedbackCollection = client.db("TechTrove").collection("UserFeedback");
const cartCollection = client.db("TechTrove").collection("ProductCart");


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

// Google first user create from registration page & Login Page and get all users data from client site and store this data--------------
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

  // check user role (admin)-------------------------------------------------------------------------------
  app.get("/users/admin/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    const result = { admin: user?.role === "admin" };
    res.send(result);
  });

  // Check user role (instructor)-------------------------------------------------------------------------------
  app.get("/users/instructor/:email", async (req, res) => {
    const email = req.params.email;

    const query = { email: email };
    const user = await usersCollection.findOne(query);
    const result = { instructor: user?.role === "instructor" };
    res.send(result);
  });

  // Check user role (normalUser)-------------------------------------------------------------------------------
  app.get("/users/user/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const users = await usersCollection.findOne(query);
    const result = { user: users?.role === "user" };
    res.send(result);
  });


    // manage normalUsers  role user  to instructor or admin -------------------------------------------------------------

  // All Users data Load to the ManageUsers Route in admin dashboard
  app.get("/users", async (req, res) => {
    const result = await usersCollection.find().toArray();
    res.send(result);
  });


// Perform  AddProducts to Instructor dashboard recive and store the data in database---------------------------------------------
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


  // instructor My Added Products data get------------------------------------------------------------------------------
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
// Search instructor added all Products to the MYAdded Components page -------------------------------------------------------------
  app.get('/searchByProductName/:text', async (req, res) => {
    const searchText = req.params.text;
    const result = await addProductsCollection.find({
      name: { $regex: searchText, $options: "i" }
    }).toArray();
    res.send(result);
  });


  // Search all Products to the HomePage  -------------------------------------------------------------
  app.get('/searchByHomePage/:text', async (req, res) => {
    const searchText = req.params.text;
    const result = await addProductsCollection.find({
      productName: { $regex: searchText, $options: "i" }
    }).toArray();
    res.send(result);
});




// instructor My Added Products data delete--------------------------------------------------
app.delete('/MyAddedProduct/:id', async (req, res) => {
  const classId = req.params.id;
  const query = { _id: new ObjectId(classId) };
  const deleteResult = await addProductsCollection.deleteOne(query);
  const deletedCount = deleteResult.deletedCount;
  console.log('Deleted count:', deletedCount);
  res.send({ deletedCount });
});

// custom hook use------------------------------------------------------------------------
app.get("/useQuery", async (req, res) => {
  const email = req.query.email;
  console.log(email);
  if (!email) {
    res.send([]);
  }
  const query = { email: email };
  const result = await selectClassesCollection.find(query).toArray();
  res.send(result);
});
    // check user role admin and update user role to admin manage user route------------------------------------------------------
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateData = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateData);
      res.send(result);
    });
    
    // Check user role instructor and update user role to admin manage user route------------------------------------------------------
    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateData = {
        $set: {
          role: "instructor",
        },
      };
      const result = await usersCollection.updateOne(filter, updateData);
      res.send(result);
    });


// user asked questions get questions to the client side AskQuestions components and store to the database---------------------------------
    app.post('/FrequentlyAskedQuestions', async (req, res) => {
      const body = req.body;
      console.log(body);
      try {
        const result = await AskedQuestionsCollection.insertOne(body);
        res.send(result);
      } catch (error) {
        console.error('Error inserting user data:', error);
        res.status(500).json({ error: 'An error occurred while inserting user data.' });
      }
    });

    // All Users questions Load to the UserQuestion Route in admin dashboard---------------------------------------------------------------
  app.get("/UsersQuestions", async (req, res) => {
    const result = await AskedQuestionsCollection.find().toArray();
    res.send(result);
  });

  //  Users questions delete to the UserQuestion Route in admin dashboard-------------------------------------------------------------------
  app.delete('/UsersQuestions/:id', async (req, res) => {
    const classId = req.params.id;
    const query = { _id: new ObjectId(classId) };
    const deleteResult = await AskedQuestionsCollection.deleteOne(query);
    const deletedCount = deleteResult.deletedCount;
    console.log('Deleted count:', deletedCount);
    res.send({ deletedCount });
  });

  //  Users questions replay to Admin the UserQuestion Route in admin dashboard------------------------------------------------------------
  app.patch("/AdminReplayToUser/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const QuestionReplay = req.body.replay; // Get the AdminReplay from the request body
    const updateData = {
      $set: {
        AdminReplay: QuestionReplay, // Set the AdminReplay in the update data
      },
    };
    const result = await AskedQuestionsCollection.updateOne(filter, updateData);
    res.send(result); 
  });

  // user Feedback get  to the client side Feedback components and store to the database---------------------------------
  app.post('/UserFeedback', async (req, res) => {
    const body = req.body;
    console.log(body);
    try {
      const result = await UserFeedbackCollection.insertOne(body);
      res.send(result);
    } catch (error) {
      console.error('Error inserting user data:', error);
      res.status(500).json({ error: 'An error occurred while inserting user data.' });
    }
  });
      // All Users Feedback Load to the UserFeedback Route in admin dashboard---------------------------------------------------------------
      app.get("/UsersFeedback", async (req, res) => {
        const result = await UserFeedbackCollection.find().toArray();
        res.send(result);
      });

       // All latest new offer data Load to the homepage only category=Latest Offers -----------------------------------------------------------------------------------
       app.get("/LatestOffers", async (req, res) => {
        try {
          const latestOffers = await addProductsCollection.find({ category: "Latest Offers" }).toArray();
          res.send(latestOffers);
        } catch (error) {
          console.error("Error retrieving Latest Offers:", error);
          res.status(500).send("Internal Server Error");
        }
      });

       // All Premium Gadget  offer data Load to the homepage only category=Premium Gadget  -----------------------------------------------------------------------------------
       app.get("/PremiumGadget", async (req, res) => {
        try {
          const PremiumGadget = await addProductsCollection.find({ category: "Premium Gadget" }).toArray();
          res.send(PremiumGadget);
        } catch (error) {
          console.error("Error retrieving Premium Gadget:", error);
          res.status(500).send("Internal Server Error");
        }
      });

   // All MacBook  offer data Load to the homepage only category=MacBook  -----------------------------------------------------------------------------------
      app.get("/MacBook", async (req, res) => {
        try {
          const MacBook = await addProductsCollection.find({ category: "MacBook" }).toArray();
          res.send(MacBook);
        } catch (error) {
          console.error("Error retrieving Macbook data:", error);
          res.status(500).send("Internal Server Error");
        }
      });
      
      
      // LatestOffer Route to handle delete requests only admin and instructor can delete it----------------------------------------------
      app.delete('/LatestOffer/:id', async (req, res) => {
        const classId = req.params.id;
        const query = { _id: new ObjectId(classId) };
        const deleteResult = await addProductsCollection.deleteOne(query);
        const deletedCount = deleteResult.deletedCount;
        console.log('Deleted count:', deletedCount);
        res.send({ deletedCount });
      });
      
// Brows Category data dynamic loaded based on click specific button ----------------------------------------------------------------------------------------------------
      app.get("/categoryProducts/:id", async (req, res) => {
        const categoryId = req.params.id;
    
        try {
            const result = await addProductsCollection.find({ category: categoryId }).toArray();
            res.send(result);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).send('Internal Server Error');
        }
    });
    
 // All FeaturedOffer data Load to the homepage only category=Featured Products -----------------------------------------------------------------------------------
 app.get("/FeaturedProducts", async (req, res) => {
  try {
    const FeaturedProducts = await addProductsCollection.find({ category: "Featured Products" }).toArray();
    res.send(FeaturedProducts);
  } catch (error) {
    console.error("Error retrieving Latest Offers:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.get('/searchByFeaturedProducts/:text', async (req, res) => {
  const searchText = req.params.text;
  const result = await addProductsCollection.find({
    productName: { $regex: searchText, $options: "i" }
  }).toArray();
  res.send(result);
});


 // Endpoint to add an item to the cart--------------------------------------------------------------------------------------------------------
 app.post('/carts', (req, res) => {
  const cartItem = req.body;
  // Insert the item into the cart collection
  cartCollection.insertOne(cartItem, (err, result) => {
    if (err) {
      console.error('Error adding item to the cart:', err);
      res.status(500).json({ error: 'Failed to add item to the cart' });
    } else {
      res.status(201).json({ success: 'Item added to the cart', insertedId: result.insertedId });
    }
  });
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
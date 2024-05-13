const express =require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express();
const port = process.env.port || 5004;

//middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

const uri =`mongodb+srv://nextGenBlogs:KuHvVbB39ODjr9Lm@cluster0.5ftvpmn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const blogsCollection =client.db('blogsDB').collection('blogs')
    const WishBlogsCollection =client.db('WishblogsDB').collection('wishblogs/:email')
    const CommentCollection =client.db('CommentsDB').collection('addcomment/:id')
  
    await client.connect();

    app.get('/addblogs', async(req,res) =>{
      const cursor =blogsCollection.find();
      const result=await cursor.toArray();
      res.send(result)
    })

    app.get("/addblogs/:id", async(req,res)=>{
      console.log(req.params.id);
      const result = await blogsCollection.findOne({_id:
     new ObjectId(req.params.id) ,
    })
     console.log(result);
      res.send(result)
    })

    app.get('/topposts', async (req, res) => {
      try {
        // Retrieve all blogs from the database
        const allBlogs = await blogsCollection.find().toArray();
    
        // Calculate word count for each blog's long description and sort by word count
        const sortedBlogs = allBlogs.sort((a, b) => {
          const wordCountA = a.LongDescription.split(/\s+/).length;
          const wordCountB = b.LongDescription.split(/\s+/).length;
          return wordCountB - wordCountA;
        });
    
        // Return the top posts (e.g., top 5)
        const topPosts = sortedBlogs.slice(0, 10);
        
        res.send(topPosts);
      } catch (error) {
        console.error("Error fetching top posts:", error);
        res.status(500).send("Internal server error");
      }
    });


    app.get("/addblogs/:email", async(req,res)=>{
      console.log(req.params.email);
      const result= await  blogsCollection.find({email:req.params.email}).toArray();
      res.send(result);
    })


    app.post('/addblogs', async(req,res) =>{
      const newPaintings =req.body;
      console.log(newPaintings);
      const result = await blogsCollection.insertOne(newPaintings);
      res.send(result);
    })
    app.post('/wishblogs/:email', async(req,res) =>{
      const newPaintings = req.body;
      delete newPaintings._id; // Remove the _id field
      console.log(newPaintings);
      const result = await WishBlogsCollection.insertOne(newPaintings);
      res.send(result);
    })
  
    
    app.get('/wishblogs/:email', async(req,res) =>{
      // console.log(req.params.email);
      const result= await  WishBlogsCollection.find({userEmail:req.params.email}).toArray();
      res.send(result);
    })
    app.post('/addcomment/:id', async(req,res) =>{
      const newPaintings = req.body;
      // delete newPaintings._id; // Remove the _id field
      console.log(newPaintings);
      const result = await CommentCollection.insertOne(newPaintings);
      res.send(result);
    })
    app.get("/addcomment/:id", async(req,res)=>{
      const blogId = req.params.id;
      
      const result = await CommentCollection.find({BlogID:
        blogId }).toArray();
    
     console.log(result);
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);













app.get('/',(req ,res)=>{
  res.send('nextGenServer is running')
})

app.listen(port,()=>{
  console.log(`server is running on port ${port}`);
})
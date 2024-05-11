const express =require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    const WishBlogsCollection =client.db('WishblogsDB').collection('Wishblogs')
  
    await client.connect();

    app.get('/addblogs', async(req,res) =>{
      const cursor =blogsCollection.find();
      const result=await cursor.toArray();
      res.send(result)
    })
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
      const newPaintings =req.body;
      console.log(newPaintings);
      const result = await WishBlogsCollection.insertOne(newPaintings);
      res.send(result);
    })
    
    app.get('/wishblogs/:email', async(req,res) =>{
      console.log(req.params.email);
      const result= await  WishBlogsCollection.find({email:req.params.email}).toArray();
      res.send(result);
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
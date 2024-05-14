const express =require('express');
require('dotenv').config()
const cors = require('cors');
const jwt =require('jsonwebtoken')
const cookieParser =require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express();
const port = process.env.port || 5004;

//middleware
app.use(cors({
  origin:['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());


require('dotenv').config()

const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5ftvpmn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middlewares

const logger =async(req,res,next)=>{
  console.log('called',req.hostname,req.originalUrl);
  next();
}

const verifyToken =async(req,res,next)=>{
  const token =req.cookies?.token;
  if(!token){
    return res.status(401).send({message:'not authorized'})
  }
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
     if(err){
        return res.status(401).send({message:'unauthorized'})
     }
     console.log('value in the token',decoded);
     next()
  })

}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const blogsCollection =client.db('blogsDB').collection('blogs')
    const WishBlogsCollection =client.db('WishblogsDB').collection('wishblogs/:email')
    const CommentCollection =client.db('CommentsDB').collection('addcomment/:id')

    // auth related api

    app.post('/jwt', async(req,res)=>{
      const user =req.body;
      console.log(user);
      const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
      res
      .cookie('token', token ,{
        httpOnly:true,
        secure: false,
      
      })
      .send({success : true})
    })
    


    // blog related api
  
    await client.connect();

    app.get('/addblogs', logger, async(req,res) =>{
      
      const cursor =blogsCollection.find();
      const result=await cursor.toArray();
      res.send(result)
    })

    app.get("/addblogs/id/:id", verifyToken, async (req, res) => {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
      if (!isValidObjectId) {
      console.error("Invalid ObjectId format");
      res.status(400).send("Invalid blog ID");
      console.log('blog',req.cookies.token);
      return;
       }
      try {
        const objectId = new ObjectId(req.params.id);
        console.log(req.params.id);
        const result = await blogsCollection.findOne({ _id: objectId });
        console.log(result);

        res.send(result);
        console.log('blogdetails',req.cookies.token);
      } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(400).send("Invalid blog ID");
      }
    });
    app.get("/addblogs/:email",async(req,res)=>{
      console.log('My blogs',req.cookies.token);
      // console.log(req.params.email);
      const result= await  blogsCollection.find({writerEmail:req.params.email
      }).toArray();
      res.send(result);
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


  


    app.post('/addblogs',verifyToken, async(req,res) =>{
      
      const newPaintings =req.body;

      // console.log(newPaintings);
      const result = await blogsCollection.insertOne(newPaintings);
      console.log('tok tok token',req.cookies.token);
      res.send(result);
    })
    app.post('/wishblogs/:email', async(req,res) =>{
      const newPaintings = req.body;
     
      delete newPaintings._id; // Remove the _id field
      console.log(newPaintings);
      const result = await WishBlogsCollection.insertOne(newPaintings);
      res.send(result);
    })
  
    
    app.get('/wishblogs/:email',verifyToken, async(req,res) =>{
      console.log('wishblogs',req.cookies.token);
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
   
    app.get("/updateblogs/id/:id",verifyToken, async(req,res)=>{
      console.log(req.params.id);
      console.log('updated token',req.cookies.token);
      const result = await blogsCollection.findOne({_id:
     new ObjectId(req.params.id) ,
    })
     console.log(result);
      res.send(result)
    })

    app.put("/updateblogs/id/:id" ,async(req,res)=>{
      console.log(req.params.id)
      const id = req.params.id;
      const filter ={_id: new ObjectId(id)}

     const data=req.body;
      const fulldata ={
        $set:{
          Title:data.Title,
          OwnnerName:data.OwnnerName,
          Category:data.Category,
          ShortDescription:data.ShortDescription,
          PhotoURL:data.PhotoURL,
          LongDescription:data.LongDescription,
          OwnerPhotoURL:data.photo,
          
        }
      }
      const result = await blogsCollection.updateOne(filter,fulldata);
      
      res.send(result);
      console.log(result);
    })
    

    app.delete("/delete/:id", async(req,res) =>{
      console.log(req.params.id);
      const result = await WishBlogsCollection.deleteOne({_id:new ObjectId(req.params.id)})
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
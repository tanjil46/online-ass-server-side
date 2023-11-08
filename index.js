
const express=require('express')
const cors=require('cors')
const jwt= require('jsonwebtoken');
const cookieParser=require('cookie-parser')
const app=express()
const port=process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
app.use(cors({
  origin:'http://localhost:5173',
 credentials:true

}))
app.use(express.json())
app.use(cookieParser());




const logger=(req,res,next)=>{
  console.log('called',req.method,req.originalUrl)
next()
 }


const verifyToken=async(req,res,next)=>{
  const token=req.cookies?.token
  
 if(!token){
  return res.status(401).send({message:'No Permission'})
 }
 jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
if(err){
  console.log(err)
  return res.status(401).send({message:'Unathorized'})
}

req.user=decoded
next()

 })
}









app.get('/',(req,res)=>{
  
    res.send('Online Assignment Server is Running')

})

app.listen(port)






const uri = "mongodb+srv://onlineassignment:0oH91EZxNJoxH6Ij@cluster0.u2o3a1l.mongodb.net/?retryWrites=true&w=majority";

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
    // await client.connect();



  const assignmentTotal=client.db('assignmentDB').collection('assignment')
 const submitedAssignment=client.db('submittedDB').collection('submit')

 const submitedCollection=client.db('submitCollectionDB').collection('submited')







//  token creating

  app.post('/jwt',async(req,res)=>{
 const user=req.body
 console.log(user)
 const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1hr'})
 res.
 cookie('token',token,{
  httpOnly:true,
  secure:false,
 

 })

.send({success:true})

})


app.post('/logout',async(req,res)=>{
const user=req.body
res.clearCookie('token').send({success:true})


})










  app.post('/assignment',async(req,res)=>{

    const assignmentInfo=req.body;
    console.log('Assignment upload',assignmentInfo)
    const result=await assignmentTotal.insertOne(assignmentInfo)
   res.send(result)

 });

app.get('/assignment',async(req,res)=>{

  const page=parseInt(req.query.page)
  const size=parseInt(req.query.size)
  console.log('pagination',req.query)
 const result=await assignmentTotal.find()
 .skip(page*size)
 .limit(size)
 .toArray()
 res.send(result)


})


 app.get('/assignment/:id',async(req,res)=>{
const id=req.params.id
const query={_id:new ObjectId(id)}
const result =await assignmentTotal.findOne(query)

res.send(result)
})



app.put('/update/:id',async(req,res)=>{

const id=req.params.id
const filter={_id:new ObjectId(id)}
const options = { upsert: true };
 const updateAssignment=req.body
 const updateAssignments={
 $set:{


  title:updateAssignment.title,
  thumbailImage:updateAssignment.thumbailImage,
  description:updateAssignment.description,
  mark:updateAssignment.mark,
  assignmentLevel:updateAssignment.assignmentLevel,
  date:updateAssignment.date

}
}


const result=await assignmentTotal.updateOne(filter,updateAssignments,options)
res.send(result)




})


app.post('/submitassign',async(req,res)=>{


  const submittedAssign=req.body;
  console.log('Assignment submitted',submittedAssign)
  const result=await submitedAssignment.insertOne(submittedAssign)
 res.send(result)

})



app.get('/assignment/:id',async(req,res)=>{
  const id=req.params.id
  const query={_id:new ObjectId(id)}
  const result =await assignmentTotal.findOne(query)
  
  res.send(result)
  })









app.get('/submitassign',logger,verifyToken,async(req,res) =>{
  const cursor=submitedAssignment.find()
  const result=await cursor.toArray()
  res.send(result)

})














app.post('/submitted',async(req,res)=>{


  const submitted=req.body;
  console.log('Assignment submitted',submitted)
  const result=await submitedCollection.insertOne(submitted)
 res.send(result)

})






app.get('/submitted',logger,verifyToken,async(req,res) =>{
  const cursor=submitedCollection.find()
  const result=await cursor.toArray()
  res.send(result)

})









app.patch('/submitassign',async(req,res)=>{
  const markStatus=req.body
  const filter={email:markStatus.email}
 const updateStausMark={
  $set:{
    status:markStatus.statusSecond
   
  }
 

 }


const result=await submitedAssignment.updateOne(filter,updateStausMark)
res.send(result)

})




//PAGINATION

app.get('/assignmentcount',async(req,res)=>{


    const count=await assignmentTotal.estimatedDocumentCount();
    res.send({count})


})









app.delete('/assignment/:id',async(req,res)=>{

    const id=req.params.id;
    const query={_id:new ObjectId(id)}
    const result=await assignmentTotal.deleteOne(query)
    res.send(result)
   
    });























    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

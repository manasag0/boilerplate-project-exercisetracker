const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Connection error:', error);
  });

const userSchema = mongoose.Schema({
  username:{
    type: String,
    unique: true
  }
},
{versionKey:false}
)

const User = mongoose.model("User",userSchema)

const exerciseSchama= mongoose.Schema({
  username:String,
  description:String,
  duration:Number,
  date: Date,
  UserId: String
})

const Exercise = mongoose.model("Exercise",exerciseSchama)

app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
//mongodb+srv://manasa:asdfasdfasdf@cluster0.ui5hrmq.mongodb.net/?retryWrites=true&w=majority
app.get("/api/users", async(req,res)=>{
  const users = await User.find()

res.send(users)})
app.post("/api/users",async(req,res)=>{
  const username = req.body.username;
  const foundUser = await User.findOne({username})
  if(foundUser){
          res.json(foundUser);
        }
  const user = await User.create({
    username,
  })
  res.json(user);
})



app.get("/api/user/:_id/logs", async (req,res)=>{
  const {from,to,limit} = req.query;
  const userId = req.params._id;
  res.send(userId)
const foundUser = await User.findById(userId)
if(!foundUser){
  res.json({
   message: "No user exists for that id "
  })
}

let filter = {userId};
if(from){
  dateFilter['$gte']=new Date(from)
}
if(to){
  dateFilter['$lte'] = new Date(to)
}

if(from || to){
  filter.dateFilter = dateFilter
}
if(!limit){
  limit = 100;
}

let exercises = await Exercise.find(dateFilter)
exercises = exercises.map((exercise)=>{
  return {
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  }
});

res.json({
  username:foundUser.username,
  count:exercises.length,
  _id:userId,
  log: exercises
})
})

app.post("/api/users/:_id/exercises",async(req,res)=>{
 
  let {description, duration,date } =req.body; 
  const userId = req.body[":_id"];
  const foundUser = await User.findById(userId)
 
 
  if(!foundUser){
   res.json({
    message: "No user exists for that id "
   })
 }
 
 if(!date){
  date= new Date();
 }else{
  date =new Date(date);
 }
 await Exercise.create({
  username: foundUser.username,
  description,
  duration,
  date,
  userId
 })
 res.send({
   username: foundUser.username,
   description,
   duration,
   date: date.toDateString(),
   _id:userId,
 })
 })


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

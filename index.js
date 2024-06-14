const express = require ("express")
const port = 9090
const app = express()
const mongoose = require ("mongoose")

app.use(express.json())

//connect to mongoose
mongoose.connect("mongodb+srv://oyin1239:HP07seno5GITMAxL@clusterthemb.grjqqdx.mongodb.net/").then(()=>{
    console.log("database is established successfully")
    
    app.listen(port,()=>{
        console.log(`application is listening ${port}`); 
    })
    }).catch((error)=>{
        console.log(`unable to connect database because ${error}`);
})
const date = new Date
//connect to schema
const scoreSchema = new mongoose.Schema({
    firstname:{type:String, required:[true, "kindly provide name"]},
    lastname:{type:String, required:[true, "kindly provide name"]},
    age:{type:Number},
    sex:{type:String, required:true, enum: ["MALE", "FEMALE"],required:true, uppercase:true},
    birthyear:{type:Number, required:[true, 'birth year is required']},
    state:{type:String,require:[true,"kindly provide your state"]},
    subject: {type:Array,required:[true,"kindly input your subject"]},
    scores:{type:Object, required:[true,"kindly fill scores"]},
    total:{type:Number},
    isPassed:{type:Boolean, default: function(){if(this.total<200){
        return false
    }else{
        return true
    }}}
},{timestamps:true}) 

const scoreModel= mongoose.model("utme scores", scoreSchema)

app.post("/createuser",async(req,res)=>{
    try {
        const {firstname, lastname, birthyear, sex, state, subject, scores}=req.body
        if(!(subject.includes(Object.keys(scores)[0])&& subject.includes(Object.keys(scores)[1])&&
        subject.includes(Object.keys(scores)[2]) && subject.includes(Object.keys(scores)[3]))){
            return res.status(400).json("scores column dosent match with the subject provided")}
            else{

        const data ={firstname, lastname,sex, birthyear, state, subject,age:date.getFullYear()-birthyear,scores,
            total:Object.values(scores).reduce((a,b)=>{
            return a+b}),
        }
        if (data.age<18){return res.status(400).json("you are not eligible to register for this exam")} 
        const newData = await scoreModel.create(data)
        res.status(201).json({message:`new user created`,newData})
    }}catch (error) {
        res.status(500).json(error.message)
        
    }
})
app.get("/getallstudent", async(req,res)=>{
    try {
        const allstudent = await scoreModel.find(req.body)
        res.status(200).json({message:`below are all ${allstudent.length} in the database`, allstudent})
        
    } catch (error) {
        res.status(500).json(error.message)
        
    }
})
app.get("/getone/:id", async(req,res)=>{
    try {
        let id = req.params.id
        const getOne = await scoreModel.findById(id)
        res.status(200).json({message:`below is the attached ${id} to be display`,getOne }) 
         
    } catch (error) {
        res.status(500).json(error.message)
        
    }
})

app.get("/:status",async(req,res)=>{
    try {
        let status=req.params.status.toLowerCase()==="true"
        
        const getPass= await scoreModel.find({isPassed:status})
        if (status==true){
            res.status(200).json({
                message:`kindly find below the ${getPass.length} passed students`,
                data:getPass
            })
        }else{
            res.status(200).json({
                message:`kindly find below the ${getPass.length} failled students`,
                data:getPass
            })    
        }

      
           
    } catch (error) {
     res.status(500).json(error.message)   
    }
})

app.put("/updateuser/:id",async (req,res)=>{
    try {
        let id = req.params.id
        let {yb, subject, scores}=req.body
        let data  = {birthyear:yb, 
            age:date.getFullYear()-yb,
             subject, 
             scores, 
             total:Object.values(scores).reduce((a,b)=>{
                return a+b
             })}
             if(data.total < 200 ){
                data.isPassed=false
             }else{
                data.isPassed=true
             }

             //data.total < 200 ? ispassed= false : ispassed = true

             if(!(subject.includes(Object.keys(scores)[0])&& subject.includes(Object.keys(scores)[1])&&
        subject.includes(Object.keys(scores)[2]) && subject.includes(Object.keys(scores)[3]))){
            return res.status(400).json("scores column dosent match with the subject provided")}
            else{
                const updateUser = await scoreModel.findByIdAndUpdate(id,data,{new:true})
                res.status(200).json({message:`${updateUser.firstname} information updated successfully`, updateUser}) 
            }
                
        //await scoreModel.findByIdAndUpdate(id,data)
        
    } catch (error) {
        res.status(500).json(error.message)
    }
})
app.put("/updateinfo/:id", async(req,res)=>{
    try {
        let id = req.params.id
        let {firstname, lastname, state, sex}=req.body

        let infoUpdate = {firstname,lastname, state, sex
        }

       // let firstalpha = firstname.slice(0).toUpperCase()
       // let remainingalpha = firstname.slice(1).toLowerCase()

if(infoUpdate.sex!=="male" && infoUpdate.sex!== "female"){
    return res.status(400).json({message:`enter a valid sex`})
}

if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(400).json({message:`invalid ID format`}) 
} 

       let updateinfo =  await scoreModel.findByIdAndUpdate(req.params.id,infoUpdate, {new:true})
      if(!updateinfo){
        return res.status(400).json({message:`user with ${id} dose not exist`})
    }
        res.status(200).json({message:`info of ${infoUpdate.firstname} updated success`,updateinfo})
        

        
    } catch (error) {
        res.status(500).json(error.message)
        
    }
})

app.get("/", (req,res)=>{
    res.status(200).json("EXAMINATION SCORES")
})


 

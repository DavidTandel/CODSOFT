// const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");
const Razorpay = require('razorpay');
const { create } = require("domain");
const dotenv = require("dotenv");
const paymentRoutes = require("./Routes/payment");


app.use(express.json());
app.use(cors());

dotenv.config();

//Database Connection with MongoDB
mongoose.connect("mongodb+srv://davidproject:Davidtandel22@cluster0.fytsog0.mongodb.net/e-commerce");

//API Creation

app.get("/",(req,res)=>{
    res.send("Express App is Running");
})

app.use("/api/payment/", paymentRoutes);
//Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})

//Creating Upload Endpoint for Images

app.use('/images',express.static('upload/images'))

app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

//Schema for Creating Product

const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required: true,
    },
    name:{
        type: String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },
})

app.post('/addproduct',async(req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0){
         let last_product_array = products.slice(-1);
         let last_product =last_product_array[0];
         id = last_product.id +1;
    }
    else{
        id=1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    })
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })
})


//Creating API for deleting Products
app.post('/removeproduct',async(req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })
})



// Creating API for getting all products
app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})



//Schema for User

const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

//Creating Endpoint For regestering User

app.post('/signup',async(req,res)=>{

    let check = await Users.findOne({email:req.body.email})
    if(check){
        return res.status(400).json({success:false,errors:"Existing User Found with same email address"})
    }
    let cart={};
    for (let i = 0; i < 300; i++) {
        cart[i]=0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }

    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})

})

//Creating Endpoint For USer Login
app.post('/login',async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data={
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong password"});
        }
    }
    else{
        res.json({success:false,error:"Wrong Email ID"});
    }
})



//Creating Endpoint for newCollectin

app.get('/newcollections',async(req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New Collection Fetched");
    res.send(newcollection);
})


//Creating Endpoint for Popular in Women
app.get('/popularinwomen',async(req,res)=>{
    let products = await Product.find({category:"women"});
    let popular_in_women = products.slice(0,4);
    console.log("popular in women fetched");
    res.send(popular_in_women);
})


//Creating Middleware to Fetch User
    const fetchUser = async(req,res,next)=>{
        const token = req.header('auth-token');
        if(!token){
            res.status(401).send({errors:"Please authanticate using valid Token"});
        }
        else{
            try{
                const data = jwt.verify(token,'secret_ecom');
                req.user = data.user;
                next();
            } catch(error){
                res.status(401).send({errors:"Please authanticate using valid Token"});
            }
        }
    }



//Creating Endpoint for adding products in cart
app.post('/addtocart',fetchUser,async(req,res)=>{
    console.log("added",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] +=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added")
})

//Creating Endpoint to Remove the Product from cart data


app.post('/removefromcart',fetchUser,async(req,res)=>{
    console.log("Removed",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0){
    userData.cartData[req.body.itemId] -=1;}
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed")
})

// Creating API to get data from Cart

app.post('/getcart',fetchUser,async(req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData)
})


const port = process.env.PORT || 4000;

app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on port"+port)
    }
    else{
        console.log("Error "+error)
    }
})
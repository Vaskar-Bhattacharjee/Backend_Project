//require('dotenv').config({path: './.env'});
import dotenv from 'dotenv';    
console.log("🔑 CLOUDINARY_CLOUD_NAME =", process.env.CLOUDINARY_CLOUD_NAME);
console.log("🔑 CLOUDINARY_API_KEY   =", process.env.CLOUDINARY_API_KEY);
console.log("🔑 CLOUDINARY_API_SECRET =", process.env.CLOUDINARY_API_SECRET)
dotenv.config(); 
import connectDB from './db/index.js';
import  {app}  from './app.js';




connectDB()
.then(()=> 
app.listen(process.env.PORT || 8000, ()=>{
    console.log(`Server is running on port:  ${process.env.PORT}`);
    
}))
.catch((err)=> console.error("MongoDB connection error from index: ", err));
























// import express from 'express';
// const app = express();

// (async () =>{
//     try {
//        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
//        app.on("error", (error)=>{
//            console.log("MongoDB connection error :", error);
//        })
//         app.listen(process.env.PORT, ()=>{
//             console.log(`Server is running on port ${process.env.PORT}`);

//         })
//     } catch (error) {
//         console.error("Error: ", error);
//     }
// })()
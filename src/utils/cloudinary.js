import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();


    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET

    
        
        
        
    });
    console.log("cloud name: ", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("api key: ", process.env.CLOUDINARY_API_KEY);
    console.log("api secret: ", process.env.CLOUDINARY_API_SECRET);
    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if (!localFilePath) return null;
            console.log(localFilePath)
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto"
            });
            console.log("File has been uploaded successfully", response.url);
            return response.url;
        } catch (error) {
            fs.unlinkSync(localFilePath);
            console.log(" uploadOnCloudinary: ",error);
            return null;
        }
    }
    export { uploadOnCloudinary }
import ApiError from "../utils/ApiErorr.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import User from "../models/user.model.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header(
            'Authorization')?.replace('Bearer ', '')
           
    
        if (!token) {
            throw new ApiError(401, 'Token not found')
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id).select('-password -refreshToken')
        if(!user){
            //TODO: discuss about frontend
            throw new ApiError(401, 'User not found')
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid token')
    }
    
})
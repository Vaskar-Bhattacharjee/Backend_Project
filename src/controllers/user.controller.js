import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiErorr.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshTokens = async (userId) => {

  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})
    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating generate and refresh token"

    );
  }
}

const registerUser = asyncHandler(async (req, res) => {

    // get user from frontend
  // validation -not empty
  // check if user exists
  // check for user image and avatar
  // upload them to cloudinary
  // Create user object
  // remove password and refresh token from response
  // check for user creation
  // return user object to frontend

  const { username, email, fullname, password } = req.body;
  console.log("email: ", email);
  
  if (
    [username, email, fullname, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // validation for empty field completed

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  })
  if (existingUser) {
    throw new ApiError(409, "User with this email or username exists");
  }
  // validation for existing user completed

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is required");
  }
 const avatar= await uploadOnCloudinary(avatarLocalPath);
 const coverImage =  await uploadOnCloudinary(coverImageLocalPath);
 if (!avatar) {
  throw new ApiError(400, "Avatar is required");
 }
 if (!coverImage) {
  throw new ApiError(400, "Cover image is required");
  
 }
 User.create({
   username: username.toLowerCase(),
   email,
   fullname,
   password,
   avatar: avatar.url,
   coverImage: coverImage.url?.url || "",
 })
});
//login user section starts here 
    const loginUser = asyncHandler(async(req, res) =>{
      //req.body -> data
      //username or email
      //find the user 
      //password check
      //access and refresh token 
      //send cookie

      const {email, password, username} = req.body
      if (!(username || email)) {
        throw new ApiError(400, "username or email is required");
      }
      const user = await User.findOne({ 
        $or: [{username}, {email}]
      })
      if (!user) {
        throw new ApiError(404, "User does not exist")
      }
      const isPasswordValid = await user.isPasswordCorrect(password)

      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
        
       }

      const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
      const loggedInUser  = await User.findById(user._id).
       select("-password -refreshToken")
       const options = {
         httpOnly : true,
         secure: true,
       }
       return res.status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json(
          new ApiResponse(
            200,
            {
              user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
          )
       )
    })  
// login user section ends here



//logout user section starts here

    const logoutUser = asyncHandler(async (req, res) => {
      await User.findByIdAndUpdate(req.user._id, {
          $set: {
            refreshToken: undefined,
          }
        },
        {
          new: true
        }
      )
      const options = {
        httpOnly : true,
        secure: true,
      }
      return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, null, "User logged out successfully"))
    })
//logout user section ends here

    const refreshAccessToken =  asyncHandler(async (req, res) => {
      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

      if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorised request")
      }
        try {
          const decodedToken =  jwt.verify(
            incomingRefreshToken, 
            ACCESS_TOKEN_SECRET  )  
  
           const user = await User.findById(decodedToken?._id)
           if (!user) {
            throw new ApiError('401', "Invalid refresh token")
           }
  
           if (incomingRefreshToken !== user?.refreshToken) {
             throw new ApiError('401', "refresh token is expired or used")
           }
  
           const options = {
            httpOnly: true,
            secure: true
           }
  
           const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
           return res
           .status(200)
           .cookie("accessToken", accessToken, options)
           .cookie("refreshToken", refreshToken, options)
           .json(new ApiResponse(
            200, 
            {accessToken, refreshToken},
            "Access token refreshed successfully"))
        } catch (error) {
          throw new ApiError(401, "Invalid refresh token")
        }

        })
//refresh access token section ends here

     const changeCurrentPassword = asyncHandler(async(req, res) =>{
       const {currentPassword, newPassword} = req.body
       const user = await User.findById(req.user?._id)
       const isPasswordValid = await user.isPasswordCorrect(currentPassword)

       if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password")
       }

       user.password = newPassword
       await user.save({
        validateBeforeSave: false
       })

       return res.status(200)
       .json(
        new ApiResponse(
          200, 
          {},
         "Password changed successfully"))
     })  
     //change current password section ends here
     const getCurrentUser = asyncHandler(async(req, res) =>{
       return res
       .status(200)
       .json(
        200,
        req.user,
        "Current user details fetched successfully")
     }) 
     //get current user section ends here
     const updateAccountDetails = asyncHandler(async(req, res) =>{
       const {fullname, email} = req.body
       if (!fullname || !email) {
        throw new ApiError(400, "fullname and email are required")
       }
      const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            fullname,
            email
          }
        },
        {new: true}

      ).select("-password")

      return res
      .status(200)
      .json(
        new ApiResponse(200, user, "Account details updated successfully"))
      

     })
     //update account details section ends here

     const avatarUpdate = asyncHandler(async(req, res) =>{
        const avatarLocalPath = req.file?.path
        if (!avatarLocalPath) {
          throw new ApiError(400, "Avatar is missing")
        }
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        if (!avatar.url) {
          throw new ApiError(400, "Error when uploading avatar")          
        }

        const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
            $set: {
              avatar: avatar.url
            }
          },
          {new: true}
        ).select("-password")
        return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"))
     })
     //avatar update section ends here

    const coverImageUpdate = asyncHandler(async(req, res) =>{
      const coverImageLocalPath = req.file?.path
      if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is missing")
      }
      const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath)
      if (!uploadedCoverImage.url) {
        throw new ApiError(400, "Error when uploading cover image")          
      }
      const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            coverImage: uploadedCoverImage.url
          }        
        },
        {new: true}
      ).select("-password")

      return res
      .status(200)
      .json(new ApiResponse(200, user, "Cover image updated successfully"))
    })
     //cover image update section ends here

     const getUserChannelProfile = asyncHandler(async(req, res) =>{
      const {username} = req.params

      if (!username?.trim()) {
        throw new ApiError(400, "username is missing")        
      }
      const channel = await User.aggregate([
        {
          $match: {
            username: username?.toLowerCase(),
          }
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
          }
        },
      {
        $lookup: {
          from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribeTo"
        }
      },
      {
        $addFields: {
          subscribersCount: {
            $size: "$subscribers"
          },
          channelSubscribeToCount: {
            $size: "$subscribeTo"
          },
          isSubscribed: {
             $cond: {
               if: {
                 $in: [
                   req.user?._id,
                   "$subscribers.subscriber"
                 ]
               },
               then: true,
               else: false
             }
        }
      }
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        avatar: 1,
        subscribersCount: 1,
        channelSubscribeToCount: 1,
        isSubscribed: 1
      }
    }        
      ])
      if (!channel?.length) {
        throw new ApiError(404, "Channel not found")
      }

      return res
      .status(200)
      .json(new ApiResponse(200, channel, "Channel profile fetched successfully"))

     })
        


export{
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  avatarUpdate
}


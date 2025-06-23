import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiErorr.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

  // get user from frontend
  // validation -not empty
  // check if user exists
  // check for user image and avatar
  // upload them to cloudinary
  // Create user object
  // remove password and refresh token from response
  // check for user creation
  // return user object to frontend

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
  })
     if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
      
     }
  
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
 
 const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
 const loggedinUser = await User.findById(user._id).
  select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }
  return res.status(200).
  cookie("accessToken", accessToken, options).
  cookie("refreshToken", refreshToken, options).
  json(
    new ApiResponse(200, 
      {
        user: loggedinUser,
        accessToken,
        refreshToken
      },
      "User registered successfully"
  )
)


});

const logoutUser = asyncHandler(async (req, res) => {
    
})

export{
  registerUser,
  loginUser
}


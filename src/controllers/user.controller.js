import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiErorr.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user from frontend
  // validation -not empty
  // check if user exists
  // check for user image and avatar
  // upload them to cloudinary
  // Create user object
  // remove password and refresh token from response
  // check for user creation
  // return user

  const { username, email, fullname, password } = req.body;
  console.log("email: ", email);
  
  if (
    [username, email, fullname, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // validation for empty field completed

  const existingUser = User.findOne({
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

export default registerUser;

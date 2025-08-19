import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content cannot be empty");
    }
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })
   const createdTweet = await Tweet.findById(tweet._id)
   if (!createdTweet) {
        throw new ApiError(404, "Tweet not found");
    }
    return res
    .status(201)
    .json(new ApiResponse(201, "Tweet created successfully", createdTweet)); 
    
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const tweets = await Tweet.find({ owner: userId })
    .populate("owner", "username profilePicture")

    if (!tweets) {
        throw new ApiError(404, "No tweets found");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, "Tweets fetched successfully", tweets));
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content cannot be empty");
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: { content }
        },
        {new: true}
    )
})
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
  const tweet = await Tweet.findOneAndDelete({  // Changed from findByOneAndDelete
        _id: tweetId,
        owner: req.user._id
    });
    if (!tweet) {
        throw new ApiError(404, "Tweet not found or you are not authorized to delete this tweet");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully"));

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
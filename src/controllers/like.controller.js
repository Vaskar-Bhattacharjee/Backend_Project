import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const userId = req.user._id
    const existingLike = await Like.findOne({video: videoId, user: userId})

    if (existingLike) {
        await existingLike.deleteOne();
        return res
        .status(200)
        .json(new ApiResponse(200, "Video like removed"));
    }

    const newLike = await Like.create({
        video: videoId,
        user: userId
    });
    return res
    .status(200)
    .json(new ApiResponse(200, "Video liked"));

    //TODO: toggle like on video
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    const userId = req.user._id
    const existingLike = await Like.findOne({comment: commentId, user: userId})
    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, "Comment like removed"));
    }
    const newLike = await Like.create({
        comment: commentId,
        user: userId
    })
    
    return res
    .status(200)
    .json(new ApiResponse(200, "Comment liked"));
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    const userId = req.user._id
    const existingLike = await Like.findOne({tweet: tweetId, user: userId})
    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, "Tweet like removed"));
    }
    const newLike = await Like.create({
        tweet: tweetId,
        user: userId
    })
    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet liked"));
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.find({ user: userId, video: { $exists: true } })
        .populate("video", "title description")
        .select("video -_id")                                                          
        .lean();
    if (likedVideos.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, "No liked videos found", []));
    }
    const video = likedVideos
    .map(like => like.video)
    .filter(video => video !== null && video !== undefined);

    return res
    .status(200)
    .json(new ApiResponse(200, "Liked videos retrieved successfully", video));
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
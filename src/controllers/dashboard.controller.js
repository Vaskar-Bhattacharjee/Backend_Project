import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });
    const stats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$likes" } }
            }
        },
        {
            $project: {
                _id: 0
            }
        }
    ])
    const channelStats = {
        totalSubscribers,
        totalVideos: stats[0]?.totalVideos || 0,
        totalViews: stats[0]?.totalViews || 0,
        totalLikes: stats[0]?.totalLikes || 0
    };
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        "Channel stats fetched successfully",
        channelStats
    ));


    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const videos = await Video.find({ owner: userId })
        .sort({ createdAt: -1 })
        .populate("owner", "username fullName avatar")
        .select("-password");

        if (!videos?.length) {
            return res
                .status(200)
                .json(new ApiResponse(200, "No videos found", []));
        }
    
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                "Channel videos fetched successfully",
                videos
            ));
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }
import mongoose, { isValidObjectId } from "mongoose";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Subscribe or unsubscribe from a channel
const toggleUserSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user?._id;

    if (!subscriberId) {
        throw new ApiError(401, "Unauthorized request");
    }
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const channel = await User.findById(channelId).select("_id");
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const removed = await Subscription.findOneAndDelete({
        channel: channelId,
        subscriber: subscriberId,
    });

    if (removed) {
        return res
            .status(200)
            .json(new ApiResponse(200, "Unsubscribed successfully", { unsubscribed: true }));
    }

    const subscription = await Subscription.create({
        channel: channelId,
        subscriber: subscriberId,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, "Subscribed successfully", { subscriptionId: subscription._id }));
});

// Get list of users who subscribed to a channel
const getChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    console.log("channelId:", channelId);

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const channel = await User.findById(channelId).select("_id fullname username");
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate({ path: "subscriber", select: "_id fullname username" })
        .sort({ createdAt: -1 })
        .lean();

    if (!subscribers || subscribers.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, "No subscribers found", { subscribers: [] }));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Subscribers retrieved successfully", { subscribers }));
});

// Get list of channels a user has subscribed to
const getUserSubscriptions = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    console.log("userId:", userId);

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId).select("_id fullname username");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const subscriptions = await Subscription.find({ subscriber: userId })
        .populate({ path: "channel", select: "_id fullname username" })
        .sort({ createdAt: -1 })
        .lean();

    if (!subscriptions || subscriptions.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, "No subscriptions found", { channels: [] }));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Subscribed channels retrieved successfully", { channels: subscriptions }));
});

export {
    toggleUserSubscription,
    getChannelSubscribers,
    getUserSubscriptions,
};

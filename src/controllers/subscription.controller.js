import mongoose, {isValidObjectId} from "mongoose"
import User from "../models/user.model.js"
import Subscription  from "../models/subscription.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriberId = req.user?._id
    if (!subscriberId) {
        throw new ApiError(401, "Unauthorized request")
    }
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }
    const channel = await User.findById(channelId).select("_id")
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }
    const removed = await Subscription.findOneAndDelete({
        channel: channelId,
        subscriber: subscriberId
    })

    if (removed) {
        return res
            .status(200)
            .json(new ApiResponse(200, "Unsubscribed successfully", { unsubscribed: true }))
    }
    const subscription = await Subscription.create({
        channel: channelId,
        subscriber: subscriberId
    })

    return res
        .status(201)
        .json(new ApiResponse(201, "Subscribed successfully", { subscriptionId: subscription._id }))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channel = await User.findById(channelId).select("_id fullname username")
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate({ path: 'subscriber', select: '_id fullname username' })
        .sort({ createdAt: -1 })
        .lean()
    if (!subscribers || subscribers.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, "No subscribers found", { subscribers: [] }))
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Subscribers retrieved successfully", { subscribers }))
})


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }

    const subscriber = await User.findById(subscriberId).select("_id fullname username")
    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found")
    }   
    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate({ path: 'channel', select: '_id fullname username' })
        .sort({ createdAt: -1 })
        .lean()
    if (!subscriptions || subscriptions.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, "No subscriptions found", { channels: [] }))
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Subscribed channels retrieved successfully", { channels: subscriptions }))


    
})
 
export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
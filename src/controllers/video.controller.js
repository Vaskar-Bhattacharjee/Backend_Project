import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: {
            [sortBy || "createdAt"]: sortType || "desc",
        }
    }
    const videoAggregate = [
        {
            $match: {
                $and: [
                    {isPublished: true},
                    {
                        $text: {
                            $search: query
                        }
                    }
                ]
            }
        },
        {
                $addFields: {
                    score: {
                        $meta: "textScore"
                    }
                }
        },
        {
            $lookup: {
                from: "users",
                localField: "creator",
                foreignField: "_id",
                as: "creator",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            avatar: 1,
                        }
                    }
                ] //pipeline to get fullname and avatar, without pipeline it will return whole docs of user.
            }
        }
        
    ]
    const videos = await Video.aggregate(videoAggregate)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit)

    if(!videos) {
        throw new ApiError(404, "No videos found while fetching")
    }
    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    )
 //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if (!title) {
        throw new ApiError( 400, "title should not be empty")
    };
    if (!description) {
        throw new ApiError( 400, "description should not be empty")
    };
    const  videoLocalPath = req.files?.videoFile[0]?.path
    if (!videoLocalPath) {
        throw new ApiError ( 400, "No videos submitted there")
    } 
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError ( 400, "No Thumbnail submitted there")
    }
    const [ video, thumbnail ] = await Promise.all([
        uploadOnCloudinary(videoLocalPath, {resource_type: "video"})
        .catch(err => {
            throw new ApiError( 400, "Video not uploaded in cloudinary")
        }),
        uploadOnCloudinary(thumbnailLocalPath)
        .catch(err => {
            throw new ApiError( 400, "Thumbnail not uploaded in cloudinary")
        }),
    ])
    const duration = await video.duration;
    const videoDocs = await Video.create({
        title,
        description,
        videoFile: video,
        thumbnail,
        owner: req.user._id,
        isPublished: true,
        duration

    })
    if (!videoDocs) {
        throw new ApiError( 400, "Video not uploaded")
    }
    res
    .status(201)
    .json(new ApiResponse(200, videoDocs, "Video uploaded successfully"))
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!videoId) {
        throw new ApiError(400, "Video Id not found")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");        
    }
    const videoFindById = await Video.findById(videoId).populate("owner", "fullname")
    if (!videoFindById) {
        throw new ApiError(404, "Video not found");        
    }
    return res
    .status(200)
    .json(new ApiResponse(200, videoFindById, "Video fetched successfully"))

    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid video ID");
        }
        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError(404, "Video not found");
        }
        if (video.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Unauthorized access");
        }
        //-------------------------
        const { title, description } = req.body
        const updates = {}
        if (typeof title !== "undefined") updates.title = title
        if (typeof description !== "undefined") updates.description = description
    
      
        const videoLocalPath = req.files?.videoFile?.[0]?.path;   
        const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
     
        if (videoLocalPath) {
            const videoFile = await uploadOnCloudinary(videoLocalPath, {resource_type: "video"})
            if (!videoFile) {
                throw new ApiError( 400, "Video not uploaded in cloudinary")
            }
            updates.videoFile = videoFile
            fs.unlink(videoLocalPath, (err) => {
                if (err) console.error("Failed to delete temp video:", err);
            });
        }    
        if (thumbnailLocalPath) {
            const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
            if (!thumbnail) {
                throw new ApiError( 400, "Thumbnail not uploaded in cloudinary")
            }
            updates.thumbnail = thumbnail
            fs.unlink(thumbnailLocalPath, (err) => {
                if (err) console.error("Failed to delete temp video:", err);
            });
        } 
        if (Object.keys(updates).length !== 0) {
            let updatedVideo = await Video
            .findByIdAndUpdate(
            videoId,
            updates,
            { new: true }
        )
        return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"))
        } else {
            throw new ApiError( 400, "Nothing updated there")
        }
       
    } catch (error) {
        throw new ApiError ( 500, error.message)
    }
       
     

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
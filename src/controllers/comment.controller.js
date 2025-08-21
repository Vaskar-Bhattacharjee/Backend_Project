import {isValidObjectId} from "mongoose"
import Comment from "../models/comment.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
      }
    
      const comments = await Comment.find({ video: videoId })
        .populate("owner", "username email") // populate comment owner
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    
      const totalComments = await Comment.countDocuments({ video: videoId });
    
      return res.status(200).json(
        new ApiResponse(200, {
          comments,
          total: totalComments,
          page: parseInt(page),
          limit: parseInt(limit),
        }, "Comments fetched successfully")
      );

})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {content} = req.body
    if(!videoId) {
        throw new ApiError(400, "Video Id not found")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");        
    }
    if (!content || !content.trim()) {
        throw new ApiError(400, "Content should not be empty");
      }
    const comment = await Comment.create({
        content,
        creator: req.user._id,
        video: videoId
    })
    if (!comment) {
        throw new ApiError(400, "Comment not created")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment created successfully"))
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const{content} = req.body
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Comment not found")
    }
    if (comment.creator.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to edit this comment");
      }
      if (!content || !content.trim()) {
        throw new ApiError(400, "Content should not be empty");
      }

    comment.content = content
    const newComment = await comment.save()

    
    return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment updated successfully"))

    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const deletedComment = await Comment.findOneAndDelete(
        {_id: commentId, creator: req.user._id}
    )
    if (!deletedComment) {
        throw new ApiError(400, "Comment not deleted")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"))
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
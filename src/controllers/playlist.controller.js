import mongoose, {isValidObjectId} from "mongoose"
import Playlist from "../models/playlist.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if (!name || !name.trim()) {
        throw new ApiError(400, "Playlist name is required");
    }
    const owner = req.user?._id;
    if (!owner) {
        throw new ApiError(401, "Unauthorized access. Please log in.");
    }
    const existingPlaylist = await Playlist.findOne({ owner, name: name.trim() });
    if (existingPlaylist) {
        throw new ApiError(409, "A playlist with this name already exists for this user.");
    }

    const newPlaylist = await Playlist.create({
        name: name.trim(),
        description: description?.trim() || "",
        owner,
    });
    
    if (!newPlaylist) {
        throw new ApiError(500, "Something went wrong while creating the playlist.");
    }
    return res
        .status(201)
        .json(new ApiResponse(201, newPlaylist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const playlists = await Playlist.find({ owner: userId })
    .sort({ createdAt: -1 })
    .populate("owner", "username email")
    .lean()
    
    if (!playlists) {
        throw new ApiError(400, "There is no playlists there")
    }
    return res
    .status(200)
    .ApiResponse(200, playlists, "Playlists fetched successfully")
})

const getPlaylistById = asyncHandler(async (req, res) => {
        const {playlistId} = req.params
        if (!isValidObjectId(playlistId)) {
          throw new ApiError(400, "Invalid playlist ID");
        }
        const playlist = await Playlist.findById(playlistId)
          .populate("owner", "username email") 
          .populate("videos", "title thumbnail duration")
          .lean(); 
      
        if (!playlist) {
          throw new ApiError(404, "Playlist not found");
        }
        return res
          .status(200)
          .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
      });
        


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
      }
      if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
      }
      const playlist = await Playlist.findById(playlistId)
      if (!playlist) {
        throw new ApiError(400, " There is no such playlist ")
      }
      if (req.user && playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist");
      }
      if (playlist.videos.includes(videoId)) {
        throw new ApiError(409, "Video already exists in this playlist");
      }
      playlist.videos.push(videoId);
      await playlist.save();

      return res
      .status(200)
      .ApiResponse(
        200, 
        [],
        "Video added to the playlist"
      )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid playlist or video ID");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { videos: videoId } }, // remove videoId from videos array
      { new: true }
    );
    if (!updatedPlaylist) {
      throw new ApiError(404, "Playlist not found");
    }
    return res
      .status(200)
      .ApiResponse(200, updatedPlaylist, "Video removed succesfully from the playlist");

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)
    if (!deletePlaylist) {
        throw new ApiError(404, "Playlist not found and deleted");
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID")
     
      if (!name?.trim() && !description?.trim()) {
        throw new ApiError(400, "Nothing to update. Provide at least one field.");
      }  

      const updateData = {};
      if (name?.trim()) updateData.name = name.trim();
      if (description?.trim()) updateData.description = description.trim();
    
      const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: req.user?._id },
        { $set: updateData },
        { new: true, runValidators: true } // return updated doc, validate schema rules
      );
    
      if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
      }
      return res
        .status(200)
        .ApiResponse(200, updatedPlaylist, "Playlist updated successfully");
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
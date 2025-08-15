import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,  
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJwt);

router.route("/").post(createPlaylist);
router.route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist)
router.route("/add/:playlistId/:videoId")
    .post(addVideoToPlaylist)
router.route("/remove/:playlistId/:videoId")
    .delete(removeVideoFromPlaylist)
export default router;
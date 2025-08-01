import { Router } from "express";
import  {registerUser, loginUser, logoutUser, changeCurrentPassword, getCurrentUser, updateAccountDetails, avatarUpdate, coverImageUpdate, getUserChannelProfile, getWatchHistory}  from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";



const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name: "coverImage",
            maxCount: 1
        },
     
        {
         name: "avatar",
         maxCount: 1
     },
     
    ]),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post (refreshAccessToken);
router.route("/change-password").post(verifyJwt, changeCurrentPassword );
router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/update-user").patch(verifyJwt, updateAccountDetails);
router.route("/avatar").patch(verifyJwt, upload.single("avatar"), avatarUpdate);
router.route("/cover-image").patch(verifyJwt, upload.single("coverImage"), coverImageUpdate);
router.route("/c/username").get(verifyJwt, getUserChannelProfile);
router.route("/history").get(verifyJwt, getWatchHistory);

export default router;
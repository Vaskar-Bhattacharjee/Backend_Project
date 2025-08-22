import { Router } from "express";
import {
    toggleUserSubscription,
    getChannelSubscribers,
    getUserSubscriptions,

} from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJwt);

router.route("/u/:userId")
    .get(getUserSubscriptions);
router.route("/u/:channelId").post(toggleUserSubscription)
    .get(getUserSubscriptions);
router.route("/c/:channelId")
    .get(getChannelSubscribers);
    
export default router;

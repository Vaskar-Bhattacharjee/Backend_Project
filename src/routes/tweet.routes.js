import { Router } from 'express';
import { createTweet, getUserTweets, updateTweet, deleteTweet } from '../controllers/tweet.controller.js';
import { verifyJwt } from '../middlewares/verifyJwt.js';

const router = Router();
router.use(verifyJwt);
router.route('/')
    .post(createTweet)
   
router.route('/user/:userId')
    .get(getUserTweets);    
    
router.route('/delete/:tweetId')
    .put(updateTweet)
    .delete(deleteTweet);

export default router;    
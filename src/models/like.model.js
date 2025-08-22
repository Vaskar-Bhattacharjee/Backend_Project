import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema =  new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: 'Video',
       
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: 'Tweet',
       
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
       
    }
}, {

    timestamps: true
})
likeSchema.pre("validate", function (next) {
    if (!this.video && !this.comment && !this.tweet) {
      next(new Error("Like must belong to a video, comment, or tweet"));
    } else {
      next();
    }
  });
  
likeSchema.plugin(mongooseAggregatePaginate)

 const Like = mongoose.model("Like", likeSchema)
export default Like;
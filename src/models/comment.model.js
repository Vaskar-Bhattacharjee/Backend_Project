import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema =  new Schema({
    content: {
        type: String,
        required: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {

    timestamps: true
    
    
    });
commentSchema.plugin(mongooseAggregatePaginate)
const Comment = mongoose.model("Comment", commentSchema)
export default Comment;

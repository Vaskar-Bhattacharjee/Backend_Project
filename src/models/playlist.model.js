import mongoose, { Schema } from "mongoose";
// import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
    
}, {

    timestamps: true
})
// playlistSchema.plugin(mongooseAggregatePaginate)

 const Playlist = mongoose.model("Playlists", playlistSchema)
 export default Playlist;

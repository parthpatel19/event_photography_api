const mongoose = require("mongoose");

const communitiesAlbumSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        community_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "communities",
            required: true,
        },
        album_type: {
            type: String,
            enum: ["image", "video"],
        },
        album_thumbnail: {
            type: String,
            default: null,
        },
        album_path: {
            type: String,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("communities_albums", communitiesAlbumSchema);

const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
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

module.exports = mongoose.model("user_albums", albumSchema);

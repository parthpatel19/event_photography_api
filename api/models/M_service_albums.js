const mongoose = require("mongoose");

const serviceAlbumSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        service_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "services",
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

module.exports = mongoose.model("service_albums", serviceAlbumSchema);

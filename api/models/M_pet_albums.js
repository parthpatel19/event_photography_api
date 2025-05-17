const mongoose = require("mongoose");

const petAlbumSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        pet_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "pets",
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

module.exports = mongoose.model("pet_albums", petAlbumSchema);

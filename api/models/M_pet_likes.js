const mongoose = require("mongoose");

const petLikesSchema = new mongoose.Schema(
    {
        pet_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "pets",
            required: true,
        },
        user_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("pet_likes", petLikesSchema);
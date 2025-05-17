const mongoose = require("mongoose");

const serviceLikesSchema = new mongoose.Schema(
    {
        service_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "services",
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

module.exports = mongoose.model("service_likes", serviceLikesSchema);
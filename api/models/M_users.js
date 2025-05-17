const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: [true, "coordinates is required."], // [latitude, longitude]
        },
    },
    { _id: false }
);

const usersSchema = new mongoose.Schema(
    {
        user_type: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            required: [true, "User type is required."],
        },
        full_name: {
            type: String,
        },
        email_address: {
            type: String,
            trim: true,
            lowercase: true,
            // validate: {
            //   validator: function (v) {
            //     return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            //   },
            //   message: "Your email is not valid please enter the correct email",
            // },
            required: [true, "Email address is required."],
        },
        mobile_number: {
            type: Number,
        },
        country_code: {
            type: String,
        },
        country_string_code: {
            type: String,
        },
        password: {
            type: String,
            default: null,
        },
        is_social_login: {
            type: Boolean,
            enum: [true, false],
            default: false, // true- login with social id, false- normal login
        },
        social_id: {
            type: String,
            default: null,
        },
        social_platform: {
            type: String,
            enum: ["google", "facebook", "apple", null],
            default: null,
        },
        notification_badge: {
            type: Number,
            default: 0,
        },
        location: {
            type: locationSchema,
        },
        address: {
            type: String,
        },
        is_user_verified: {
            type: Boolean,
            enum: [true, false],
            default: false, // true = user_verified, false = not user_verified 
        },
        is_blocked_by_admin: {
            type: Boolean,
            enum: [true, false],
            default: false, // true = blocked, false = not blocked 
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false, // true = deleted, false = not deleted 
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("users", usersSchema);

usersSchema.index({ location: "2dsphere" });
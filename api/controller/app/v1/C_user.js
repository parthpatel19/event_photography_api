const { i18n } = require("../../../../utils/modules");

const { userToken } = require("../../../../utils/token");

const { users, faqs, notifications, guests, user_sessions, user_reviews, user_albums, email_verifications } = require("../../../models/index");

const { errorRes, successRes, multiSuccessRes } = require("../../../../utils/response_functions");

const { sendOtpForgotPassword } = require("../../../../utils/send_mail");

const { findUserAlbum, findUserAlbumId, objectId, findReview, findOwnReview, findExistingReview, findGuestUser, findEmailAddress, findMobileNumber, findUser, findVerifyEmailAddress, findAlbumById } = require("../../../../utils/user_function");

const {
    securePassword,
    comparePassword,
} = require("../../../../utils/secure_password");

const {
    uploadMediaIntoS3Bucket,
    removeMediaFromS3Bucket,
} = require('./../../../../utils/bucket_manager');

const guestSession = async (req, res) => {
    try {
        const { device_token, device_type, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_guest_user = await findGuestUser(device_token);

        if (find_guest_user) {
            await guests.deleteMany({ device_token: device_token });
        }

        await guests.create({
            device_token: device_token,
            device_type: device_type,
        });

        return successRes(res, res.__("Guest added successfully"));
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const checkEmailAddress = async (req, res) => {
    try {
        const { email_address, ln } = req.body;
        i18n.setLocale(req, ln);

        const check_email_address = await findEmailAddress(email_address);

        if (check_email_address) {
            return errorRes(res, res.__("Email address already exists"));
        }

        return successRes(res, res.__("Email address available"));

    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const checkMobileNumber = async (req, res) => {
    try {
        const { mobile_number, ln } = req.body;
        i18n.setLocale(req, ln);

        const check_mobile_number = await findMobileNumber(mobile_number);

        if (check_mobile_number) {
            return errorRes(res, res.__("Mobile number already exists"));
        }

        return successRes(res, res.__("Mobile number available"));

    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

// const signUp = async (req, res) => {
//     try {
//         const {
//             full_name,
//             email_address,
//             country_code,
//             country_string_code,
//             mobile_number,
//             is_social_login,
//             social_id,
//             social_platform,
//             device_token,
//             device_type,
//             password,
//             ln
//         } = req.body;

//         i18n.setLocale(req, ln);

//         const insert_data = {
//             full_name,
//             email_address,
//             country_code,
//             country_string_code,
//             mobile_number,
//         };

//         if (is_social_login == true || is_social_login == "true") {
//             insert_data.is_social_login = is_social_login;
//             insert_data.social_id = social_id;
//             insert_data.social_platform = social_platform;
//         }

//         if (password) {
//             const hashedPassword = await securePassword(password);
//             insert_data.password = hashedPassword;
//         }

//         await email_verifications.create({
//             email_address: email_address,
//             is_email_verified: true,
//         });

//         const create_user = await users.create(insert_data);

//         const token = await userToken(create_user);

//         const session = await user_sessions.create(
//             {
//                 user_id: create_user._id,
//                 user_type: "user",
//                 device_token: device_token,
//                 auth_token: token,
//                 device_type: device_type,
//                 is_login: true,
//                 is_active: true,
//             },
//         );

//         await guests.deleteMany({
//             device_token: device_token,
//             device_type: device_type,
//         });

//         const res_data = {
//             ...create_user._doc,
//             token: token,
//             device_token: session.device_token,
//             device_type: session.device_type,
//             user_profile: null,
//         };

//         return successRes(res, res.__("User signup successfully"), res_data);
//     } catch (error) {
//         console.log("Error : ", error);
//         return errorRes(res, res.__("Internal server error"));
//     }
// };


const signUp = async (req, res) => {
    try {
        const { email, password, role, name } = req.body;

        // Check if user already exists
        const existingUser = await users.findOne({ email });
        if (existingUser) return res.status(409).json({ message: 'Email already in use' });

        // Hash password
        // const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        let hashedPassword;
        if (password) {
            hashedPassword = await securePassword(password);
        }

        const create_user = await users.create({
            email,
            password: hashedPassword,
            role: role?.toLowerCase() === 'studio/agency' ? 'studio' : role?.toLowerCase(),
            name,
        });

        const token = await userToken(create_user);
        //         const create_user = await users.create(insert_data);

        // const session = await user_sessions.create(
        //     {
        //         user_id: create_user._id,
        //         user_type: "user",
        //         device_token: device_token,
        //         auth_token: token,
        //         device_type: device_type,
        //         is_login: true,
        //         is_active: true,
        //     },
        // );


        const res_data = {
            ...create_user._doc,
            token: token,
            // device_token: session.device_token,
            // device_type: session.device_type,
            // user_profile: null,
        };
        return successRes(res, res.__("User signup successfully"), res_data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Signup failed', error: err.message });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const find_user = await users.findOne({ email, is_deleted: false });

        if (!find_user) return res.status(401).json({ message: 'Invalid email or password' });

        console.log("find_user",find_user)
        console.log("sign_in", req.body)

        const password_verify = await comparePassword(password, find_user.password);

        if (!password_verify) {
            return errorRes(res, res.__("Incorrect password. Please try again."));
        }

        const token = await userToken(find_user);


        const res_data = {
            ...find_user._doc,
            token: token,
            // device_token: session.device_token,
            // device_type: session.device_type,
            // user_profile: null,
        };
        return successRes(res, res.__("User login successfully"), res_data);

    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const changePassword = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { old_password, new_password, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_user = await findUser(user_id);

        if (find_user.is_social_login == true || find_user.is_social_login == "true") {
            return errorRes(
                res,
                res.__("auth.change_password", { platform: find_user.social_platform })
            );
        }

        const password_verify = await comparePassword(old_password, find_user.password);

        if (!password_verify) {
            return errorRes(
                res,
                res.__("The old password is incorrect. Please try again.")
            );
        }

        const hashedPassword = await securePassword(new_password);

        if (find_user.password == hashedPassword) {
            return errorRes(
                res,
                res.__("Your existing and new password are similar. Please try a different password.")
            );
        }

        const update_data = {
            password: hashedPassword,
        };

        await users.findByIdAndUpdate(user_id, update_data);

        return successRes(res, res.__("Your password has been changed"));
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email_address, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_user = await findEmailAddress(email_address);

        if (!find_user) {
            return errorRes(res, res.__("No account found with this email"));
        }

        if (find_user.is_social_login == true || find_user.is_social_login == "true") {
            return errorRes(
                res,
                res.__("auth.forgot_password", { platform: find_user.social_platform })
            );
        }

        const otp = Math.floor(1000 + Math.random() * 9000);

        await email_verifications.updateOne(
            {
                email_address: email_address,
                is_email_verified: true,
                is_deleted: false,
            },
            {
                $set: {
                    otp: otp,
                }
            }
        );

        const emailData = {
            full_name: find_user.full_name,
            emailAddress: find_user.email_address,
            otp: otp,
        };

        await sendOtpForgotPassword(emailData);

        return successRes(res, res.__("Otp sent successfully to your email."), otp);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email_address, otp, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_user = await findVerifyEmailAddress(email_address);

        if (!find_user) {
            return errorRes(res, res.__("No account was found with this email address"));
        }

        if (find_user.otp == otp) {
            const update_data = {
                otp: null,
            };

            await email_verifications.updateOne(
                {
                    email_address: email_address,
                    is_email_verified: true,
                    is_deleted: false,
                },
                {
                    $set: update_data
                }
            );

            return successRes(res, res.__("OTP verified successfully"));
        } else {
            return errorRes(res, res.__("Please enter valid OTP"));
        }
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email_address, mobile_number, new_password, ln } = req.body;
        i18n.setLocale(req, ln);

        if (email_address) {
            const find_user = await findEmailAddress(email_address);

            if (!find_user) {
                return errorRes(res, res.__("No account was found with this email address"));
            }

            const hashedPassword = await securePassword(new_password);

            const update_data = {
                password: hashedPassword,
            };

            await users.updateOne(
                {
                    _id: find_user._id,
                },
                {
                    $set: update_data,
                }
            );

            return successRes(res, res.__(`Your password has been updated successfully`), []);
        }

        if (mobile_number) {
            const find_user = await findMobileNumber(mobile_number);

            if (!find_user) {
                return errorRes(res, res.__("No account was found with this mobile number"));
            }

            const hashedPassword = await securePassword(new_password);

            const update_data = {
                password: hashedPassword,
            };

            await users.updateOne(
                {
                    _id: find_user._id,
                },
                {
                    $set: update_data,
                }
            );

            return successRes(res, res.__(`Your password has been updated successfully`), []);
        }
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const logout = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { device_token, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_user = await findUser(user_id);

        if (!find_user) {
            return errorRes(res, res.__("User not found"));
        }

        await user_sessions.deleteMany({ user_id: user_id, device_token: device_token });

        return successRes(res, res.__("You have successfully logged out"));
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const deleteAccount = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { device_token, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_user = await findUser(user_id);

        if (!find_user) {
            return errorRes(res, res.__("User not found"));
        }

        await users.updateOne(
            { _id: user_id },
            {
                $set: {
                    is_deleted: true,
                },
            },
            { new: true }
        );

        await user_sessions.deleteMany({ user_id: user_id, device_token: device_token });

        return successRes(res, res.__("Your account is deleted successfully"));
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const uploadMedia = async (req, res) => {
    try {
        const user_id = req.user._id;

        const { album_type, ln } = req.body;
        const { album, thumbnail } = req.files;
        i18n.setLocale(req, ln);

        const folder_name = "user_media";
        const content_type = album.type;

        const res_upload_file = await uploadMediaIntoS3Bucket(album, folder_name, content_type);

        if (res_upload_file.status) {

            if (thumbnail) {
                const folder_name_thumbnail = "video_thumbnail";
                const content_type_thumbnail = thumbnail.type;

                const res_upload_thumbnail_file = await uploadMediaIntoS3Bucket(thumbnail, folder_name_thumbnail, content_type_thumbnail);

                if (res_upload_thumbnail_file.status) {
                    const user_image_path = `${folder_name}/` + res_upload_file.file_name;
                    const thumbnail_image_path = `${folder_name_thumbnail}/` + res_upload_thumbnail_file.file_name;

                    const fileData = {
                        user_id: user_id,
                        album_type: album_type,
                        album_thumbnail: thumbnail_image_path,
                        album_path: user_image_path
                    };

                    const add_albums = await user_albums.create(fileData);

                    add_albums.album_path = process.env.BUCKET_URL + add_albums.album_path;
                    add_albums.album_thumbnail = process.env.BUCKET_URL + add_albums.album_thumbnail;

                    return successRes(res, res.__("User media uploaded successfully"), add_albums);
                } else {
                    return errorRes(res, res.__("User thumbnail media upload failed"));
                }
            } else {
                const user_image_path = `${folder_name}/` + res_upload_file.file_name;

                const fileData = {
                    user_id: user_id,
                    album_type: album_type,
                    album_thumbnail: null,
                    album_path: user_image_path
                };

                const add_albums = await user_albums.create(fileData);

                add_albums.album_path = process.env.BUCKET_URL + add_albums.album_path;

                return successRes(res, res.__("User media uploaded successfully"), add_albums);
            }
        } else {
            return errorRes(res, res.__("User media upload failed"));
        }
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }

};

const removeMedia = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { album_id, ln } = req.body;
        i18n.setLocale(req, ln);

        const userAlbum = await findAlbumById(album_id, user_id);

        if (!userAlbum) {
            return errorRes(res, res.__("Album not found"));
        } else {
            const res_remove_file = await removeMediaFromS3Bucket(userAlbum.album_path);
            if (userAlbum.album_type == "video") {
                await removeMediaFromS3Bucket(userAlbum.album_thumbnail);
            }

            if (res_remove_file.status) {
                await user_albums.deleteOne({
                    _id: album_id,
                });

                return successRes(res, res.__("Media removed successfully"), []);
            } else {
                return errorRes(res, res.__("Failed to remove user media"));
            }
        }
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const notificationsList = async (req, res) => {
    try {
        let user_id;

        if (req.user._id) {
            user_id = req.user._id;
        } else {
            user_id = req.body.user_id;
        }

        const { page, limit, ln } = req.body;
        i18n.setLocale(req, ln);

        const userObjectId = await objectId(user_id);

        const notification_list = await notifications.aggregate([
            {
                $match: {
                    is_deleted: false,
                    $or: [
                        { receiver_id: userObjectId },
                        {
                            $and: [
                                { noti_for: "admin_create_contest" },
                                { noti_date: { $gt: req.user.createdAt } }
                            ]
                        }
                    ]
                }
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $skip: (parseInt(page) - 1) * parseInt(limit),
            },
            {
                $limit: parseInt(limit),
            },
            {
                $lookup: {
                    from: "users",
                    localField: "sender_id",
                    foreignField: "_id",
                    as: "user_detail"
                }
            },
            {
                $unwind: {
                    path: "$user_detail",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: "user_albums",
                    localField: "album_id",
                    foreignField: "_id",
                    as: "album_detail"
                }
            },
            {
                $unwind: {
                    path: "$album_detail",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: "album_comments",
                    localField: "album_comment_id",
                    foreignField: "_id",
                    as: "album_comment_detail"
                }
            },
            {
                $unwind: {
                    path: "$album_comment_detail",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: "user_albums",
                    localField: "album_comment_detail.album_id",
                    foreignField: "_id",
                    as: "album_detail_for_comment"
                }
            },
            {
                $unwind: {
                    path: "$album_detail_for_comment",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: "user_comments",
                    localField: "profile_comment_id",
                    foreignField: "_id",
                    as: "profile_comment_detail"
                }
            },
            {
                $unwind: {
                    path: "$profile_comment_detail",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: "contests_comments",
                    localField: "contest_comment_id",
                    foreignField: "_id",
                    as: "contest_comment_detail"
                }
            },
            {
                $unwind: {
                    path: "$contest_comment_detail",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: "contests",
                    localField: "contest_id",
                    foreignField: "_id",
                    as: "contest_detail"
                }
            },
            {
                $unwind: {
                    path: "$contest_detail",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: "contests",
                    localField: "contest_comment_detail.contest_id",
                    foreignField: "_id",
                    as: "comment_contest_detail"
                }
            },
            {
                $unwind: {
                    path: "$comment_contest_detail",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: "user_albums",
                    let: { localId: "$sender_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$localId"] },
                                        { $eq: ["$album_type", "image"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "user_media",
                }
            },
            {
                $lookup: {
                    from: "user_followers",
                    let: { followingUserId: "$sender_id", userId: "$receiver_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$userId"] },
                                        { $eq: ["$following_user_id", "$$followingUserId"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "user_following_data",
                }
            },
            {
                $lookup: {
                    from: "chat_rooms",
                    let: { senderUserId: "$sender_id", receiverUserId: "$receiver_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        {
                                            $and: [
                                                { $eq: ["$user_id", "$$senderUserId"] },
                                                { $eq: ["$other_user_id", "$$receiverUserId"] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $eq: ["$user_id", "$$receiverUserId"] },
                                                { $eq: ["$other_user_id", "$$senderUserId"] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "user_chat_room_data",
                }
            },
            {
                $unwind: {
                    path: "$user_chat_room_data",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $addFields: {
                    user_profile: {
                        $cond: {
                            if: { $gt: [{ $size: "$user_media" }, 0] },
                            then: { $concat: [process.env.BUCKET_URL, { $arrayElemAt: ["$user_media.album_path", 0] }] },
                            else: null
                        }
                    },
                    profile_comment: {
                        $cond: {
                            if: { $eq: ["$noti_for", "commented_profile"] },
                            then: "$profile_comment_detail.comment_text",
                            else: null
                        }
                    },
                    album_comment: {
                        $cond: {
                            if: { $eq: ["$noti_for", "commented_album"] },
                            then: "$album_comment_detail.comment_text",
                            else: null
                        }
                    },
                    contest_url: {
                        $cond: {
                            if: { $eq: ["$noti_for", "liked_contest"] },
                            then: { $concat: [process.env.BUCKET_URL, "$contest_detail.contest_thumbnail"] },
                            else: null
                        }
                    },
                    album_path: {
                        $cond: {
                            if: { $eq: ["$noti_for", "liked_album"] },
                            then: { $concat: [process.env.BUCKET_URL, "$album_detail.album_path"] },
                            else: null
                        }
                    },
                    album_thumbnail: {
                        $cond: {
                            if: { $eq: ["$noti_for", "liked_album"] },
                            then: { $concat: [process.env.BUCKET_URL, "$album_detail.album_thumbnail"] },
                            else: null
                        }
                    },
                    album_comment_path: {
                        $cond: {
                            if: { $eq: ["$noti_for", "commented_album"] },
                            then: { $concat: [process.env.BUCKET_URL, "$album_detail_for_comment.album_path"] },
                            else: null
                        }
                    },
                    album_comment_thumbnail: {
                        $cond: {
                            if: { $eq: ["$noti_for", "commented_album"] },
                            then: { $concat: [process.env.BUCKET_URL, "$album_detail_for_comment.album_thumbnail"] },
                            else: null
                        }
                    },
                    // album_paths: {
                    //     $cond: {
                    //         if: { $eq: ["$noti_for", "liked_album"] },
                    //         then: {
                    //             album_path: { $concat: [process.env.BUCKET_URL, "$album_detail.album_path"] },
                    //             album_thumbnail: { $concat: [process.env.BUCKET_URL, "$album_detail.album_thumbnail"] }
                    //         },
                    //         else: {
                    //             album_path: null,
                    //             album_thumbnail: null
                    //         }
                    //     }
                    // },
                    // album_comment_paths: {
                    //     $cond: {
                    //         if: { $eq: ["$noti_for", "commented_album"] },
                    //         then: {
                    //             album_comment_path: { $concat: [process.env.BUCKET_URL, "$album_detail_for_comment.album_path"] },
                    //             album_comment_thumbnail: { $concat: [process.env.BUCKET_URL, "$album_detail_for_comment.album_thumbnail"] }
                    //         },
                    //         else: {
                    //             album_comment_path: null,
                    //             album_comment_thumbnail: null
                    //         }
                    //     }
                    // },
                    contest_comment: {
                        $cond: {
                            if: { $eq: ["$noti_for", "commented_contest"] },
                            then: "$contest_comment_detail.comment_text",
                            else: null
                        }
                    },
                    comment_contest_url: {
                        $cond: {
                            if: { $eq: ["$noti_for", "commented_contest"] },
                            then: { $concat: [process.env.BUCKET_URL, "$comment_contest_detail.contest_thumbnail"] },
                            else: null
                        }
                    },
                    join_contest_url: {
                        $cond: {
                            if: { $eq: ["$noti_for", "joined_contest"] },
                            then: { $concat: [process.env.BUCKET_URL, "$comment_contest_detail.contest_thumbnail"] },
                            else: null
                        }
                    },
                    admin_contest_url: {
                        $cond: {
                            if: { $eq: ["$noti_for", "admin_create_contest"] },
                            then: { $concat: [process.env.BUCKET_URL, "$contest_detail.contest_thumbnail"] },
                            else: null
                        }
                    },
                    chat_room_id: {
                        $cond: {
                            if: { $eq: ["$noti_for", "accept_match_request"] },
                            then: "$user_chat_room_data._id",
                            else: null
                        }
                    },
                    is_follow_back: {
                        $cond: {
                            if: {
                                $and: [
                                    { $eq: ["$noti_for", "following"] },
                                    { $gt: [{ $size: "$user_following_data" }, 0] },
                                ]
                            },
                            then: true,
                            else: false
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 1,
                    sender_id: 1,
                    receiver_id: 1,
                    profile_comment_id: 1,
                    contest_comment_id: 1,
                    album_comment_id: 1,
                    album_id: 1,
                    contest_id: 1,
                    noti_title: 1,
                    noti_msg: 1,
                    noti_for: 1,
                    noti_date: 1,
                    is_accepted: 1,
                    user_name: "$user_detail.full_name",
                    user_profile: 1,
                    profile_comment: 1,
                    contest_url: 1,
                    admin_contest_url: 1,
                    contest_comment: 1,
                    comment_contest_url: 1,
                    join_contest_url: 1,
                    album_comment: 1,
                    album_path: 1,
                    album_thumbnail: 1,
                    album_comment_path: 1,
                    album_comment_thumbnail: 1,
                    is_follow_back: 1,
                    chat_room_id: 1,
                }
            }
        ]);

        let notification_list_count = await notifications.countDocuments({
            is_deleted: false,
            $or: [
                { receiver_id: userObjectId },
                {
                    $and: [
                        { noti_for: "admin_create_contest" },
                        { noti_date: { $gt: req.user.createdAt } }
                    ]
                }
            ]
        });

        await users.updateOne(
            {
                _id: userObjectId,
            },
            {
                $set: {
                    notification_badge: 0
                }
            }
        );

        return multiSuccessRes(res, res.__("Notification list get successfully"), notification_list_count, notification_list);

    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const changeFullName = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { full_name, ln } = req.body;
        i18n.setLocale(req, ln);

        await users.updateOne(
            {
                _id: user_id
            },
            {
                $set: {
                    full_name: full_name
                }
            }
        );

        return successRes(res, res.__("Full name changed successfully"), []);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const addReview = async (req, res) => {
    try {
        const user_id = req.user._id;

        const { reviewed_user_id, rating, review, ln } = req.body;
        i18n.setLocale(req, ln);

        if (user_id.toString() === reviewed_user_id.toString()) {
            return errorRes(res, res.__("You cannot review yourself."));
        }

        const existingReview = await findExistingReview(user_id, reviewed_user_id);
        if (existingReview) {
            return errorRes(res, res.__("You have already reviewed this user."));
        }

        const newReview = await user_reviews.create({ user_id, reviewed_user_id, rating, review });

        return successRes(res, res.__("Review added successfully."), newReview);
    } catch (error) {
        console.log("Error: ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const editReview = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { review_id, rating, review, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_review = await findReview(review_id);
        if (!find_review) {
            return errorRes(res, res.__("Review not found."));
        }

        const find_own_review = await findOwnReview(user_id, review_id);
        if (!find_own_review) {
            return errorRes(res, res.__("You don't have permission to edit this review."));
        }

        await user_reviews.updateOne(
            { _id: review_id },
            {
                $set: {
                    rating: rating,
                    review: review
                }
            }
        );

        const updatedReview = await findReview(review_id);

        return successRes(res, res.__("Review updated successfully."), updatedReview);
    } catch (error) {
        console.log("Error: ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const deleteReview = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { review_id, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_review = await findReview(review_id);
        if (!find_review) {
            return errorRes(res, res.__("Review not found."));
        }

        const find_own_review = await findOwnReview(user_id, review_id);
        if (!find_own_review) {
            return errorRes(res, res.__("You don't have permission to delete this review."));
        }

        await user_reviews.deleteOne({ _id: review_id });

        return successRes(res, res.__("Review deleted successfully."), []);
    } catch (error) {
        console.log("Error: ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const getUserReview = async (req, res) => {
    try {
        const { reviewed_user_id, ln } = req.body;
        i18n.setLocale(req, ln);

        const reviewObjectId = await objectId(reviewed_user_id);

        const result = await user_reviews.aggregate([
            {
                $match: { reviewed_user_id: reviewObjectId }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (!result.length) {
            return successRes(res, res.__("No reviews found."));
        }

        const res_data = {
            average_rating: Number(result[0].averageRating).toFixed(1),
            total_review: result[0].totalReviews,
        };

        return successRes(res, res.__("Reviews fetched successfully."), res_data);
    } catch (error) {
        console.log("Error: ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const userReviewList = async (req, res) => {
    try {
        const { reviewed_user_id, page, limit, ln } = req.body;
        i18n.setLocale(req, ln);

        const reviewObjectId = await objectId(reviewed_user_id);

        const result = await user_reviews.aggregate([
            {
                $match: { reviewed_user_id: reviewObjectId }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_details",
                },
            },
            {
                $unwind: {
                    path: "$user_details",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $skip: (parseInt(page) - 1) * parseInt(limit),
            },
            {
                $limit: parseInt(limit),
            },
            {
                $lookup: {
                    from: "user_albums",
                    let: { localId: "$user_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$localId"] },
                                        { $eq: ["$album_type", "image"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "user_media",
                }
            },
            {
                $addFields: {
                    user_profile: {
                        $cond: {
                            if: { $gt: [{ $size: "$user_media" }, 0] },
                            then: { $concat: [process.env.BUCKET_URL, { $arrayElemAt: ["$user_media.album_path", 0] }] },
                            else: null
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    user_profile: 1,
                    full_name: "$user_details.full_name",
                    rating: {
                        $toString: {
                            $round: [{ $ifNull: ["$rating", 0] }, 1]
                        }
                    },
                    review: 1,
                    createdAt: 1,
                    updatedAt: 1,
                }
            }
        ]);

        let result_count = await user_reviews.countDocuments({
            reviewed_user_id: reviewObjectId,
        });

        return multiSuccessRes(res, res.__("Reviews list fetched successfully"), result_count, result);
    } catch (error) {
        console.log("Error: ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const userReviewDetail = async (req, res) => {
    try {
        const { reviewed_user_id, ln } = req.body;
        i18n.setLocale(req, ln);

        const reviewObjectId = await objectId(reviewed_user_id);

        const find_user = await findUser(reviewObjectId);
        const user_album = await findUserAlbum(find_user._id);

        const result = await user_reviews.aggregate([
            {
                $match: { reviewed_user_id: reviewObjectId }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const res_data = {
            ...find_user._doc,
            user_profile: user_album ? process.env.BUCKET_URL + user_album : null,
            average_rating: Number(result[0].averageRating).toFixed(1) ? Number(result[0].averageRating).toFixed(1) : 0,
            total_review: result[0].totalReviews ? result[0].totalReviews : 0,
        };

        return successRes(res, res.__("Reviews detail fetched successfully"), res_data);
    } catch (error) {
        console.log("Error: ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const faqListing = async (req, res) => {
    try {
        const { ln } = req.body;
        i18n.setLocale(req, ln);

        const list_faq = await faqs.aggregate([
            {
                $match: {
                    is_active: true,
                }
            },
            {
                $sort: { createdAt: 1 },
            },
            {
                $project: {
                    _id: 1,
                    question: 1,
                    answer: 1,
                }
            }
        ]);

        return successRes(res, res.__("Faq list get successfully"), list_faq);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const uploadSocketMedia = async (req, res) => {
    try {
        const { album_type, ln } = req.body;
        let { album, thumbnail } = req.files;
        i18n.setLocale(req, ln);

        const folder_name = "socket_media";
        const folder_name_thumbnail = "video_thumbnail";

        if (!Array.isArray(album)) {
            album = [album];
        }

        if (thumbnail && !Array.isArray(thumbnail)) {
            thumbnail = [thumbnail];
        }

        let albumType = [];
        if (album_type) {
            albumType = JSON.parse(album_type);
        }

        const uploadedFiles = [];

        for (let i = 0; i < albumType.length; i++) {
            const album_type_i = albumType[i];
            const media = album[i];
            const content_type = media.type;

            const res_upload_file = await uploadMediaIntoS3Bucket(media, folder_name, content_type);

            if (res_upload_file.status) {
                if (album_type_i == "image") {
                    const file_name = res_upload_file.file_name;
                    const user_image_path = `${folder_name}/${file_name}`;
                    let thumbnail_image_path = null;

                    uploadedFiles.push({
                        file_type: album_type_i,
                        file_name: file_name,
                        file_path: user_image_path,
                        thumbnail: thumbnail_image_path
                    });
                }

                if (album_type_i == "video") {
                    const file_name = res_upload_file.file_name;
                    const user_image_path = `${folder_name}/${file_name}`;
                    let thumbnail_image_path = null;

                    if (thumbnail && thumbnail[i]) {
                        const res_upload_thumb = await uploadMediaIntoS3Bucket(
                            thumbnail[i],
                            folder_name_thumbnail,
                            thumbnail[i].type
                        );

                        if (res_upload_thumb.status) {
                            thumbnail_image_path = `${folder_name_thumbnail}/${res_upload_thumb.file_name}`;

                            uploadedFiles.push({
                                file_type: album_type_i,
                                file_name: file_name,
                                file_path: user_image_path,
                                thumbnail: thumbnail_image_path
                            });
                        }
                    }
                }
            } else {
                return errorRes(res, res.__("Media upload failed for one of the files"));
            }
        }

        return successRes(res, res.__("All media uploaded successfully"), uploadedFiles);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }

};

const userUpdatedData = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { ln } = req.body;
        i18n.setLocale(req, ln);

        const find_user = await findUser(user_id);
        const user_album = await findUserAlbum(find_user._id);
        const album_id = await findUserAlbumId(find_user._id);

        const res_data = {
            ...find_user._doc,
            user_profile: user_album ? process.env.BUCKET_URL + user_album : null,
            album_id: album_id,
        };

        return successRes(res, res.__("Successfully updated user data"), res_data);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

module.exports = {
    guestSession,
    checkEmailAddress,
    checkMobileNumber,
    signUp,
    signIn,
    changePassword,
    forgotPassword,
    verifyOtp,
    resetPassword,
    logout,
    deleteAccount,
    uploadMedia,
    removeMedia,
    notificationsList,
    changeFullName,
    addReview,
    editReview,
    deleteReview,
    getUserReview,
    userReviewList,
    userReviewDetail,
    faqListing,
    uploadSocketMedia,
    userUpdatedData,
};
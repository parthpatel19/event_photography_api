const { mongoose, i18n } = require("../../utils/modules");

const { dateTime } = require("../../utils/date_formats");

const { user_sessions, chats, chat_rooms } = require("../../api/models/index");

const { multiNotificationSend } = require("../../utils/send_notifications");

const { socketSuccessRes, socketErrorRes } = require("../../utils/response_functions");

const { findUser, findMessage, findDeviceTokenForSendMsg, findUserAlbum, escapeRegex } = require("../../utils/user_function");

const {
    removeMediaFromS3Bucket,
} = require('../../utils/bucket_manager');

module.exports = {
    setSocketId: async (data) => {
        try {
            const { user_id, device_token, socket_data, ln = "en" } = data;

            i18n.setLocale(ln);

            const userObjectId = new mongoose.Types.ObjectId(user_id);

            const find_user = await findUser(user_id);

            if (find_user) {
                await user_sessions.updateOne(
                    {
                        user_id: user_id,
                        device_token: device_token,
                    },
                    {
                        $set: {
                            socket_id: socket_data,
                            is_active: true,
                        },
                    }
                );

                var [find_user_session] = await user_sessions.aggregate([
                    {
                        $match: {
                            user_id: userObjectId,
                            device_token: device_token,
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "user_id",
                            foreignField: "_id",
                            as: "users",
                        },
                    },
                    {
                        $unwind: {
                            path: "$users",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            user_type: 1,
                            device_token: 1,
                            auth_token: 1,
                            device_type: 1,
                            socket_id: 1,
                            user_id: 1,
                            is_login: 1,
                            is_active: 1,
                            user_name: "$users.user_name",
                            email_address: "$users.email_address",
                        },
                    },
                ]);

                return socketSuccessRes(i18n.__("Socket id set successfully!"), find_user_session);
            }
        } catch (error) {
            console.log("setSocketId Error EMIT:", error.message);
            return socketErrorRes(i18n.__("Something went wrong"));
        }
    },

    createRoom: async (data) => {
        try {
            let { user_id, other_user_id, ln = "en" } = data;

            i18n.setLocale(ln);

            const cond1 = { user_id: user_id, other_user_id: other_user_id };
            const cond2 = { user_id: other_user_id, other_user_id: user_id };

            const find_chat_room = await chat_rooms.findOne({
                $or: [cond1, cond2],
            });

            if (!find_chat_room) {
                const insert_data = { user_id: user_id, other_user_id: other_user_id };
                const create_chat_room = await chat_rooms.create(insert_data);

                if (create_chat_room) {
                    return socketSuccessRes(i18n.__("Chatroom created"), create_chat_room);
                } else {
                    return socketErrorRes(i18n.__("Failed to create chatroom"));
                }
            } else {
                return socketSuccessRes(i18n.__("Chatroom already exists"), find_chat_room);
            }
        } catch (error) {
            console.log("createRoom Error EMIT:", error.message);
            return socketErrorRes(i18n.__("Something went wrong!"));
        }
    },

    sendMessage: async (data) => {
        try {
            let { chat_room_id, sender_id, receiver_id, message, message_type, media_file, ln = 'en' } = data;
            i18n.setLocale(ln);
            const currentDateTime = await dateTime();

            let insert_data = {
                chat_room_id: chat_room_id,
                sender_id: sender_id,
                receiver_id: receiver_id,
                message_time: currentDateTime,
                message: message,
                message_type: message_type,
            };

            var media_file_array = [];

            if (message_type == "image" || message_type == "video" || message_type == "voice_note" || message_type == "audio") {
                // for (const value of media_file) {
                var files = {
                    file_type: media_file[0].album_type,
                    file_path: media_file[0].album_path,
                };

                if (message_type == "video") {
                    files = {
                        ...files,
                        thumbnail: media_file[0].thumbnail,
                    }
                } else {
                    files = {
                        ...files,
                        thumbnail: null,
                    }
                }
                media_file_array.push(files);
                // }
            }

            if (media_file_array.length > 0) {
                insert_data = {
                    ...insert_data,
                    media_file: media_file_array,
                };
            }

            const store_chat = await chats.create(insert_data);

            const [findMessage] = await chats.aggregate([
                {
                    $match: {
                        _id: store_chat._id,
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "sender_id",
                        foreignField: "_id",
                        as: "sender",
                    },
                },
                {
                    $unwind: { path: "$sender", preserveNullAndEmptyArrays: true },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "receiver_id",
                        foreignField: "_id",
                        as: "receiver",
                    },
                },
                {
                    $unwind: { path: "$receiver", preserveNullAndEmptyArrays: true },
                },
                {
                    $addFields: {
                        file_path: {
                            $cond: [
                                {
                                    $and: [
                                        { $isArray: "$media_file" },
                                        { $gt: [{ $size: "$media_file" }, 0] },
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: [
                                                        "$media_file",
                                                        0,
                                                    ],
                                                },
                                                false,
                                            ],
                                        },
                                    ],
                                },
                                {
                                    $concat: [
                                        process.env.BUCKET_URL,
                                        {
                                            $arrayElemAt: ["$media_file.file_path", 0],
                                        },
                                    ],
                                },
                                null,
                            ],
                        },
                        thumbnail: {
                            $cond: [
                                {
                                    $and: [
                                        { $isArray: "$media_file" },
                                        { $gt: [{ $size: "$media_file" }, 0] },
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: [
                                                        "$media_file",
                                                        0,
                                                    ],
                                                },
                                                false,
                                            ],
                                        },
                                    ],
                                },
                                {
                                    $concat: [
                                        process.env.BUCKET_URL,
                                        {
                                            $arrayElemAt: ["$media_file.thumbnail", 0],
                                        },
                                    ],
                                },
                                null,
                            ],
                        },
                    }
                },
                {
                    $project: {
                        _id: 1,
                        chat_room_id: 1,
                        sender_id: 1,
                        receiver_id: 1,
                        message_time: 1,
                        message: 1,
                        message_type: 1,
                        is_edited: 1,
                        file_path: 1,
                        thumbnail: 1,
                        sender_user_name: { $ifNull: ["$sender.user_name", null] },
                        receiver_user_name: { $ifNull: ["$receiver.user_name", null] },
                        createdAt: 1,
                        updatedAt: 1,
                    },
                },
            ]);

            if (findMessage) {
                const senderObjectId = new mongoose.Types.ObjectId(sender_id);
                const receiverObjectId = new mongoose.Types.ObjectId(receiver_id);
                const chatRoomObjectId = new mongoose.Types.ObjectId(chat_room_id);

                let notiData = {};

                const userAlbumData = await findUserAlbum(senderObjectId);

                const deviceTokenData = await findDeviceTokenForSendMsg(chatRoomObjectId, receiverObjectId);
                const find_sender = await findUser(senderObjectId);

                const msgMapping = {
                    "text": message,
                    "image": "Image",
                    "video": "Video",
                    "voice_note": "Voice Note",
                    "audio": "Audio",
                    "gift": "Gift",
                };

                var noti_msg = `${msgMapping[message_type]}`;
                let noti_title = `${find_sender.user_name}`;
                let noti_for = "chat_noti";
                let noti_image = process.env.BUCKET_URL + userAlbumData;

                notiData = {
                    noti_msg,
                    noti_title,
                    noti_for,
                    noti_image,
                    device_token: deviceTokenData,
                    id: chatRoomObjectId,
                };

                if (deviceTokenData.length > 0) {
                    multiNotificationSend(notiData);
                }

                return socketSuccessRes(i18n.__("Message sent successfully"), findMessage);
            }
        } catch (error) {
            console.log("sendMessage Error EMIT:", error);
            return socketErrorRes(i18n.__("Something went wrong!"));
        }
    },

    getAllMessage: async (data) => {
        try {
            const { chat_room_id, user_id, page, limit, ln = 'en' } = data;
            i18n.setLocale(ln);

            const chatRoomObjectId = new mongoose.Types.ObjectId(chat_room_id);
            const userObjectId = new mongoose.Types.ObjectId(user_id);

            const findAllMessages = await chats.aggregate([
                {
                    $match: {
                        chat_room_id: chatRoomObjectId,
                        is_deleted: { $ne: "deleted_for_all" },
                        $or: [
                            { sender_id: userObjectId, is_deleted: { $ne: "deleted_for_sender" } },
                            { receiver_id: userObjectId, is_deleted: { $ne: "deleted_for_receiver" } },
                        ]
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $skip: (parseInt(page) - 1) * parseInt(limit)
                },
                {
                    $limit: parseInt(limit)
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "sender_id",
                        foreignField: "_id",
                        as: "sender",
                    },
                },
                {
                    $unwind: { path: "$sender", preserveNullAndEmptyArrays: true },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "receiver_id",
                        foreignField: "_id",
                        as: "receiver",
                    },
                },
                {
                    $unwind: { path: "$receiver", preserveNullAndEmptyArrays: true },
                },
                {
                    $addFields: {
                        file_path: {
                            $cond: [
                                {
                                    $and: [
                                        { $isArray: "$media_file" },
                                        { $gt: [{ $size: "$media_file" }, 0] },
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: [
                                                        "$media_file",
                                                        0,
                                                    ],
                                                },
                                                false,
                                            ],
                                        },
                                    ],
                                },
                                {
                                    $concat: [
                                        process.env.BUCKET_URL,
                                        {
                                            $arrayElemAt: ["$media_file.file_path", 0],
                                        },
                                    ],
                                },
                                null,
                            ],
                        },
                        thumbnail: {
                            $cond: [
                                {
                                    $and: [
                                        { $isArray: "$media_file" },
                                        { $gt: [{ $size: "$media_file" }, 0] },
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: [
                                                        "$media_file",
                                                        0,
                                                    ],
                                                },
                                                false,
                                            ],
                                        },
                                    ],
                                },
                                {
                                    $concat: [
                                        process.env.BUCKET_URL,
                                        {
                                            $arrayElemAt: ["$media_file.thumbnail", 0],
                                        },
                                    ],
                                },
                                null,
                            ],
                        },
                    }
                },
                {
                    $project: {
                        _id: 1,
                        chat_room_id: 1,
                        sender_id: 1,
                        receiver_id: 1,
                        message_time: 1,
                        message: 1,
                        message_type: 1,
                        is_edited: 1,
                        file_path: 1,
                        thumbnail: 1,
                        sender_user_name: { $ifNull: ["$sender.user_name", null] },
                        receiver_user_name: { $ifNull: ["$receiver.user_name", null] },
                        createdAt: 1,
                        updatedAt: 1,
                    },
                },
            ]);

            if (findAllMessages?.length > 0) {
                return socketSuccessRes(i18n.__("Messages get successfully"), findAllMessages);
            } else {
                return socketSuccessRes(i18n.__("Messages get successfully"), []);
            }
        } catch (error) {
            console.log("getAllMessage Error EMIT:", error.message);
            return socketErrorRes(i18n.__("Something went wrong!"));
        }
    },

    editMessage: async (data) => {
        try {
            const { chat_id, chat_room_id, user_id, message, ln = 'en' } = data;
            i18n.setLocale(ln);

            const chatObjectId = new mongoose.Types.ObjectId(chat_id);
            const chatRoomObjectId = new mongoose.Types.ObjectId(chat_room_id);
            const userObjectId = new mongoose.Types.ObjectId(user_id);

            const find_message = await findMessage(chatObjectId);

            if (find_message.sender_id.toString() !== userObjectId.toString()) {
                return socketErrorRes(i18n.__("You do not have permission to edit this message"));
            }

            await chats.updateOne(
                {
                    _id: chatObjectId,
                    chat_room_id: chatRoomObjectId,
                    sender_id: userObjectId,
                },
                {
                    $set: {
                        message: message,
                        is_edited: true,
                    }
                }
            );

            const edited_message = await findMessage(chatObjectId);

            return socketSuccessRes(i18n.__("Message edited successfully"), edited_message);

        } catch (error) {
            console.log("editMessage Error EMIT:", error.message);
            return socketErrorRes(i18n.__("Something went wrong!"));
        }
    },

    deleteMessage: async (data) => {
        try {
            const { chat_id, user_id, ln = 'en' } = data;
            i18n.setLocale(ln);

            const chatObjectId = new mongoose.Types.ObjectId(chat_id);
            const userObjectId = new mongoose.Types.ObjectId(user_id);

            const find_message = await findMessage(chatObjectId);

            if (find_message.receiver_id.toString() == userObjectId.toString()) {
                if (find_message.is_deleted === "deleted_for_sender" || find_message.is_deleted === "deleted_for_all") {
                    find_message.is_deleted = "deleted_for_all";
                } else {
                    find_message.is_deleted = "deleted_for_receiver";
                }

                await find_message.save();
                const find_deleted_message = await findMessage(chatObjectId);

                if (find_deleted_message.is_deleted == "deleted_for_all") {
                    if (find_deleted_message.message_type == "image" || find_deleted_message.message_type == "video" || find_deleted_message.message_type == "voice_note" || find_deleted_message.message_type == "audio") {
                        const removable_file = find_deleted_message.media_file[0].file_path;
                        if (removable_file) {
                            await removeMediaFromS3Bucket(removable_file);
                        }

                        if (find_deleted_message.message_type == "video") {
                            const removable_thumbnail_file = find_deleted_message.media_file[0].thumbnail;
                            if (removable_thumbnail_file) {
                                await removeMediaFromS3Bucket(removable_thumbnail_file);
                            }
                        }
                    }
                }

                const response = {
                    _id: chat_id,
                    is_delete_for_all: false
                }
                return socketSuccessRes(i18n.__("Message deleted successfully"), response);
            }

            if (find_message.sender_id.toString() == userObjectId.toString()) {
                find_message.is_deleted = "deleted_for_all";

                await find_message.save();
                const find_deleted_message = await findMessage(chatObjectId);

                if (find_deleted_message.is_deleted == "deleted_for_all") {
                    if (find_deleted_message.message_type == "image" || find_deleted_message.message_type == "video" || find_deleted_message.message_type == "voice_note" || find_deleted_message.message_type == "audio") {
                        const removable_file = find_deleted_message.media_file[0].file_path;
                        if (removable_file) {
                            await removeMediaFromS3Bucket(removable_file);
                        }

                        if (find_deleted_message.message_type == "video") {
                            const removable_thumbnail_file = find_deleted_message.media_file[0].thumbnail;
                            if (removable_thumbnail_file) {
                                await removeMediaFromS3Bucket(removable_thumbnail_file);
                            }
                        }
                    }
                }

                const response = {
                    _id: chat_id,
                    is_delete_for_all: true
                }
                return socketSuccessRes(i18n.__("Message deleted successfully"), response);
            }
        } catch (error) {
            console.log("deleteMessage Error EMIT:", error.message);
            return socketErrorRes(i18n.__("Something went wrong!"));
        }
    },

    readMessage: async (data) => {
        try {
            const { chat_room_id, user_id, ln = 'en' } = data;
            i18n.setLocale(ln);

            const chatRoomObjectId = new mongoose.Types.ObjectId(chat_room_id);
            const userObjectId = new mongoose.Types.ObjectId(user_id);

            await chats.updateMany(
                {
                    chat_room_id: chatRoomObjectId,
                    receiver_id: userObjectId,
                    is_read: false,
                },
                {
                    $set: {
                        is_read: true
                    }
                }
            );

            return socketSuccessRes(i18n.__("Messages read successfully"));
        } catch (error) {
            console.log("readMessage Error EMIT:", error.message);
            return socketErrorRes(i18n.__("Something went wrong!"));
        }
    },

    chatUserList: async (data) => {
        try {
            const { user_id, search, ln = 'en' } = data;
            i18n.setLocale(ln);

            const escapedSearch = search ? await escapeRegex(search) : null;

            const userObjectId = new mongoose.Types.ObjectId(user_id);

            const findAllRooms = await chat_rooms.aggregate([
                {
                    $match: {
                        $or: [{ user_id: userObjectId }, { other_user_id: userObjectId }],
                        is_deleted: false,
                    },
                },
                {
                    $addFields: {
                        userId: {
                            $cond: [
                                { $eq: ["$user_id", userObjectId] },
                                "$user_id",
                                "$other_user_id"
                            ]
                        },
                        otherId: {
                            $cond: [
                                { $eq: ["$user_id", userObjectId] },
                                "$other_user_id",
                                "$user_id"
                            ]
                        },
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true,
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "otherId",
                        foreignField: "_id",
                        as: "other"
                    }
                },
                {
                    $unwind: {
                        path: "$other",
                        preserveNullAndEmptyArrays: true,
                    }
                },
                {
                    $lookup: {
                        from: "user_albums",
                        let: {
                            userId: "$otherId",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$user_id", "$$userId"] },
                                            { $eq: ["$album_type", "image"] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "other_album"
                    }
                },
                {
                    $match: escapedSearch
                        ? {
                            $or: [
                                { "other.user_name": { $regex: escapedSearch, $options: "i" } },
                            ]
                        }
                        : {},
                },
                {
                    $lookup: {
                        from: "chats",
                        let: {
                            receiverUser: userObjectId, chatRoomId: "$_id",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$chat_room_id", "$$chatRoomId"] },
                                            { $eq: ["$receiver_id", "$$receiverUser"] },
                                            { $eq: ["$is_read", false] },
                                            { $ne: ["$is_deleted", "deleted_for_all"] },
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "unread_messages",
                    }
                },
                {
                    $lookup: {
                        from: "chats",
                        let: {
                            receiverUser: userObjectId, chatRoomId: "$_id",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$chat_room_id", "$$chatRoomId"] },
                                            { $ne: ["$is_deleted", "deleted_for_all"] },
                                            {
                                                $or: [
                                                    {
                                                        $and: [
                                                            { $eq: ["$sender_id", "$$receiverUser"] },
                                                            { $ne: ["$is_deleted", "deleted_for_sender"] }
                                                        ]
                                                    },
                                                    {
                                                        $and: [
                                                            { $eq: ["$receiver_id", "$$receiverUser"] },
                                                            { $ne: ["$is_deleted", "deleted_for_receiver"] }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                },
                            },
                            {
                                $sort: {
                                    createdAt: -1,
                                }
                            },
                            { $limit: 1 }
                        ],
                        as: "last_message",
                    }
                },
                {
                    $unwind: {
                        path: "$last_message",
                        preserveNullAndEmptyArrays: true,
                    }
                },
                {
                    $addFields: {
                        unread_message_count: { $size: "$unread_messages" },
                        other_profile_picture: {
                            $cond: [
                                {
                                    $and: [
                                        { $isArray: "$other_album" },
                                        { $gt: [{ $size: "$other_album" }, 0] },
                                        {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: [
                                                        "$other_album.album_path",
                                                        0,
                                                    ],
                                                },
                                                false,
                                            ],
                                        },
                                    ],
                                },
                                {
                                    $concat: [
                                        process.env.BUCKET_URL,
                                        { $arrayElemAt: ["$other_album.album_path", 0] },
                                    ],
                                },
                                null,
                            ],
                        },
                        last_message: { $ifNull: ["$last_message.message", null] },
                        last_message_type: { $ifNull: ["$last_message.message_type", null] },
                        last_message_time: { $ifNull: ["$last_message.message_time", null] },
                    }
                },
                {
                    $project: {
                        _id: 1,
                        user_id: "$user._id",
                        other_user_id: "$other._id",
                        name: "$other.user_name",
                        other_profile_picture: 1,
                        unread_message_count: 1,
                        last_message: 1,
                        last_message_type: 1,
                        last_message_time: 1,
                    }
                },
                {
                    $sort: {
                        last_message_time: -1
                    }
                }
            ]);

            return socketSuccessRes(i18n.__("User list get successfully"), findAllRooms);
        } catch (error) {
            console.log("chatUserList Error EMIT:", error.message);
            return socketErrorRes(i18n.__("Something went wrong!"));
        }
    },

    deleteChat: async (data) => {
        try {
            const { chat_room_id, user_id, ln = 'en' } = data;
            i18n.setLocale(ln);

            const chatRoomObjectId = new mongoose.Types.ObjectId(chat_room_id);
            const userObjectId = new mongoose.Types.ObjectId(user_id);

            //receiving msg
            await chats.updateMany(
                {
                    chat_room_id: chatRoomObjectId,
                    receiver_id: userObjectId,
                    is_deleted: "not_deleted"
                },
                {
                    $set: {
                        is_deleted: "deleted_for_receiver",
                        is_read: true
                    }
                }
            );

            await chats.updateMany(
                {
                    chat_room_id: chatRoomObjectId,
                    receiver_id: userObjectId,
                    is_deleted: "deleted_for_sender"
                },
                {
                    $set: {
                        is_deleted: "deleted_for_all",
                        is_read: true
                    }
                }
            );

            //sending msg
            await chats.updateMany(
                {
                    chat_room_id: chatRoomObjectId,
                    sender_id: userObjectId,
                    is_deleted: "not_deleted"
                },
                {
                    $set: {
                        is_deleted: "deleted_for_sender"
                    }
                }
            );

            await chats.updateMany(
                {
                    chat_room_id: chatRoomObjectId,
                    sender_id: userObjectId,
                    is_deleted: "deleted_for_receiver"
                },
                {
                    $set: {
                        is_deleted: "deleted_for_all"
                    }
                }
            );

            return socketSuccessRes(i18n.__("Chat deleted successfully"), []);

        } catch (error) {
            console.log("deleteMessage Error EMIT:", error.message);
            return socketErrorRes(i18n.__("Something went wrong!"));
        }
    },

    setChatRoomId: async (data) => {
        try {
            const { chat_room_id, device_token, user_id, ln = 'en' } = data;
            i18n.setLocale(ln);

            await user_sessions.findOneAndUpdate(
                {
                    user_id: user_id,
                    device_token: device_token,
                },
                {
                    $set: {
                        chat_room_id: chat_room_id
                    }
                },
                { new: true }
            );

            return socketSuccessRes(i18n.__("Chat room id set successfully"), []);
        } catch (error) {
            console.log("deleteMessage Error EMIT:", error.message);
            return socketErrorRes(i18n.__("Something went wrong!"));
        }
    },

    unsetChatRoomId: async (data) => {
        try {
            const { device_token, user_id, ln = 'en' } = data;
            i18n.setLocale(ln);

            await user_sessions.findOneAndUpdate(
                {
                    user_id: user_id,
                    device_token: device_token,
                },
                {
                    $set: {
                        chat_room_id: null
                    }
                },
                { new: true }
            );

            return socketSuccessRes(i18n.__("Chat room id unset successfully"), []);
        } catch (error) {
            console.log("deleteMessage Error EMIT:", error.message);
            return socketErrorRes(i18n.__("Something went wrong!"));
        }
    },
};
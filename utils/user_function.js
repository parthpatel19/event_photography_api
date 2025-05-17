const { users, faqs, user_albums, pets, pet_albums, pet_likes, guests, user_sessions, user_reviews, chats, chat_rooms, email_verifications, app_contents, notifications } = require("../api/models/index");

const { InternalErrorRes } = require("../utils/response_functions");
const { mongoose } = require("../utils/modules");

const findGuestUser = async (device_token) => {
    try {
        const user_data = await guests.findOne({
            device_token: device_token
        });

        return user_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findUser = async (user_id) => {
    try {
        const user_data = await users.findOne({
            _id: user_id
        });

        return user_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findBlockUser = async (user_id) => {
    try {
        const user_data = await users.findOne({
            _id: user_id,
            is_blocked_by_admin: true,
        });

        return user_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findUserAlbum = async (user_id) => {
    try {
        const user_album_data = await user_albums.find({
            user_id: user_id,
            album_type: "image"
        });

        return user_album_data[0]?.album_path;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findUserAlbumId = async (user_id) => {
    try {
        const user_album_data = await user_albums.find({
            user_id: user_id,
            album_type: "image"
        });

        return user_album_data[0]?._id;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findAlbumById = async (album_id, user_id) => {
    try {
        const album_data_by_id = await user_albums.findOne({
            _id: album_id,
            user_id: user_id
        });

        return album_data_by_id;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findDeviceToken = async (user_id) => {
    try {
        const device_token_data = await user_sessions.find({
            user_id: user_id,
            user_type: "user",
        }).distinct("device_token");

        return device_token_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findEmailAddress = async (email_address) => {
    try {
        const email_address_data = await users.findOne({
            email_address: email_address,
            is_deleted: false
        });

        return email_address_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findSocialEmailAddress = async (email_address) => {
    try {
        const email_address_data = await users.findOne({
            email_address: email_address,
            is_social_login: true,
            is_deleted: false,
        });

        return email_address_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findSocialBlockUser = async (email_address) => {
    try {
        const user_data = await users.findOne({
            email_address: email_address,
            is_social_login: true,
            is_blocked_by_admin: true,
            is_deleted: false,
        });

        return user_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findMobileNumber = async (mobile_number) => {
    try {
        const mobile_number_data = await users.findOne({
            mobile_number: mobile_number,
            is_deleted: false
        });

        return mobile_number_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findVerifyEmailAddress = async (email_address) => {
    try {
        const verify_email_address_data = await email_verifications.findOne({
            email_address: email_address,
            is_email_verified: true,
            is_deleted: false
        });

        return verify_email_address_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findContentByType = async (content_type) => {
    try {
        const content_data = await app_contents.findOne({
            content_type: content_type,
            is_deleted: false,
        });

        return content_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findContent = async (content_id) => {
    try {
        const content_data = await app_contents.findOne({
            _id: content_id,
            is_deleted: false,
        });

        return content_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findNotification = async (notification_id) => {
    try {
        const notification_data = await notifications.findOne({
            _id: notification_id,
            is_deleted: false,
        });

        return notification_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const incNotificationBadge = async (user_id) => {
    try {
        const update_data = await users.updateOne(
            {
                _id: user_id,
                is_deleted: false,
            },
            {
                $inc: {
                    notification_badge: 1
                }
            }
        );

        return update_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findMessage = async (chat_id) => {
    try {
        const chat_data = await chats.findOne({
            _id: chat_id,
        });

        return chat_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findChatRoom = async (chat_room_id) => {
    try {
        const chat_room_data = await chat_rooms.findOne({
            _id: chat_room_id,
        });

        return chat_room_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findDeviceTokenForSendMsg = async (chat_room_id, receiver_id) => {
    try {
        const session_data = await user_sessions.find({
            user_id: receiver_id,
            user_type: "user",
            chat_room_id: { $ne: chat_room_id }
        }).distinct("device_token");

        return session_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findAllUserDeviceToken = async () => {
    try {
        const session_data = await user_sessions.find({
            user_type: "user",
        }).distinct("device_token");

        return session_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findReview = async (review_id) => {
    try {
        const review_data = await user_reviews.findOne({
            _id: review_id,
        });

        return review_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findOwnReview = async (user_id, review_id) => {
    try {
        const review_data = await user_reviews.findOne({
            _id: review_id, user_id: user_id,
        });

        return review_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findExistingReview = async (user_id, reviewed_user_id) => {
    try {
        const review_data = await user_reviews.findOne({
            user_id: user_id, reviewed_user_id: reviewed_user_id,
        });

        return review_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findFaqByName = async (question) => {
    try {
        const faq_data = await faqs.findOne({
            question: question,
        });

        return faq_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findFaq = async (faq_id) => {
    try {
        const faq_data = await faqs.findOne({
            _id: faq_id,
        });

        return faq_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findPet = async (pet_id) => {
    try {
        const pet_data = await pets.findOne({
            _id: pet_id,
            is_deleted: false
        });

        return pet_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findUsersPet = async (user_id, pet_id) => {
    try {
        const pet_data = await pets.findOne({
            _id: pet_id,
            user_id: user_id,
            is_deleted: false
        });

        return pet_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findPetAlbum = async (user_id, pet_id) => {
    try {
        const user_album_data = await pet_albums.find({
            user_id: user_id,
            pet_id: pet_id,
            album_type: "image"
        });

        return user_album_data[0]?.album_path;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findPetAlbumById = async (album_id, user_id) => {
    try {
        const album_data_by_id = await pet_albums.findOne({
            _id: album_id,
            user_id: user_id
        });

        return album_data_by_id;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findPetAlbums = async (user_id, pet_id) => {
    try {
        const pet_data = await pet_albums.find({
            user_id: user_id,
            pet_id: pet_id,
        });

        return pet_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const findPetLike = async (user_id, pet_id) => {
    try {
        const pet_data = await pet_likes.findOne({
            user_id: user_id,
            pet_id: pet_id,
        });

        return pet_data;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const escapeRegex = async (text) => {
    try {
        return text.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

const objectId = async (id) => {
    try {
        const object_id = new mongoose.Types.ObjectId(id)
        return object_id;
    } catch (error) {
        console.log("Error : ", error);
        return InternalErrorRes();
    }
};

module.exports = {
    findGuestUser,
    findUser,
    findBlockUser,
    findUserAlbum,
    findUserAlbumId,
    findAlbumById,
    findDeviceToken,
    findEmailAddress,
    findSocialEmailAddress,
    findSocialBlockUser,
    findMobileNumber,
    findVerifyEmailAddress,
    findContentByType,
    findContent,
    findNotification,
    incNotificationBadge,
    findMessage,
    findChatRoom,
    findDeviceTokenForSendMsg,
    findAllUserDeviceToken,
    findReview,
    findOwnReview,
    findExistingReview,
    findFaqByName,
    findFaq,
    findPet,
    findUsersPet,
    findPetAlbum,
    findPetAlbumById,
    findPetAlbums,
    findPetLike,
    escapeRegex,
    objectId
};
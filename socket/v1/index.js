const {
    setSocketId,
    createRoom,
    sendMessage,
    getAllMessage,
    editMessage,
    deleteMessage,
    readMessage,
    chatUserList,
    deleteChat,
    setChatRoomId,
    unsetChatRoomId,
} = require("./chat");

const { i18n } = require("../../utils/modules");

const { socketErrorRes } = require("../../utils/response_functions");

const { user_sessions } = require("../../api/models/index");

module.exports = function (io) {
    var v1version = io.of("/v1");
    v1version.on("connection", (socket) => {
        console.log("Socket connected  v1.....", socket.id);

        socket.on("disconnect", async (data) => {
            try {
                let { ln = 'en' } = data;
                i18n.setLocale(ln);

                const find_user = await user_sessions.findOne({
                    socket_id: socket.id,
                });

                if (find_user) {
                    await user_sessions.updateOne(
                        {
                            socket_id: socket.id,
                            user_id: find_user.user_id,
                        },
                        {
                            $set: {
                                socket_id: null,
                                chat_room_id: null
                            },
                        }
                    );
                }
            } catch (error) {
                console.log("disconnect Error ON:", error.message);
                return socketErrorRes(i18n.__("Something went wrong!"));
            }
        });

        socket.on("setSocketId", async (data) => {
            try {
                console.log("setSocketId  on :: ", data);
                var socket_data = socket.id;

                let { ln = 'en' } = data;
                i18n.setLocale(ln);

                data = {
                    ...data,
                    socket_data,
                };

                let setSocketData = await setSocketId(data);

                socket.emit("setSocketId", setSocketData);
            } catch (error) {
                console.log("setSocketId Error ON:", error.message);
                return socketErrorRes(i18n.__("Something went wrong!"));
            }
        });

        socket.on("createRoom", async (data) => {
            try {
                console.log("createRoom  on :: ", data);
                var create_room = await createRoom(data);

                let { ln = 'en' } = data;
                i18n.setLocale(ln);

                socket.join(create_room.data._id.toString());

                v1version.to(create_room.data._id.toString()).emit("createRoom", create_room);
            } catch (error) {
                console.log("createRoom Error ON:", error.message);
                return socketErrorRes(i18n.__("Something went wrong!"));
            }
        });

        socket.on("sendMessage", async (data) => {
            try {
                console.log("sendMessage  on :: ", data);
                const { ln = 'en' } = data;
                i18n.setLocale(ln);

                socket.join(data.chat_room_id);
                let newMessage = await sendMessage(data);
                v1version.to(data.chat_room_id).emit("sendMessage", newMessage);

                let senderChatListData = await chatUserList({ user_id: data.sender_id });
                socket.to(data.sender_id).emit("chatUserList", senderChatListData);

                let receiverChatListData = await chatUserList({ user_id: data.receiver_id });
                socket.to(data.receiver_id).emit("chatUserList", receiverChatListData);
            } catch (error) {
                console.log("sendMessage Error ON:", error.message);
                return socketErrorRes(i18n.__("Something went wrong!"));
            }
        });

        socket.on("getAllMessage", async (data) => {
            try {
                console.log("getAllMessage  on :: ", data);
                socket.join(data.chat_room_id);

                let { ln = 'en' } = data;
                i18n.setLocale(ln);

                const find_chats = await getAllMessage(data);
                socket.emit("getAllMessage", find_chats);
            } catch (error) {
                console.log("getAllMessage Error ON:", error.message);
                return socketErrorRes(i18n.__("Something went wrong!"));
            }
        });

        socket.on("editMessage", async (data) => {
            try {
                console.log("editMessage  on :: ", data);
                socket.join(data.chat_room_id);

                let { ln = 'en' } = data;
                i18n.setLocale(ln);

                const find_edited_message = await editMessage(data);
                socket.emit("editMessage", find_edited_message);
                socket.to(data.chat_room_id).emit("editMessage", find_edited_message);
            } catch (error) {
                console.log("editMessage Error ON:", error.message);
                return socketErrorRes(i18n.__("Something went wrong!"));
            }
        });

        socket.on("deleteMessage", async (data) => {
            try {
                console.log("deleteMessage  on :: ", data);
                socket.join(data.chat_room_id);

                let { ln = 'en' } = data;
                i18n.setLocale(ln);

                const find_deleted_message = await deleteMessage(data);
                socket.emit("deleteMessage", find_deleted_message);

                if (find_deleted_message.data.is_delete_for_all == true || find_deleted_message.data.is_delete_for_all == "true") {
                    socket.to(data.chat_room_id).emit("deleteMessage", find_deleted_message);
                }
            } catch (error) {
                console.log("deleteMessage Error ON:", error.message);
                return socketErrorRes(i18n.__("Something went wrong!"));
            }
        });

        socket.on("readMessage", async (data) => {
            try {
                console.log("readMessage  on :: ", data);
                socket.join(data.chat_room_id);

                let { ln = 'en' } = data;
                i18n.setLocale(ln);

                const find_read_message = await readMessage(data);
                v1version.to(data.chat_room_id).emit("readMessage", find_read_message);

                let userChatListData = await chatUserList({ user_id: data.user_id });
                socket.to(data.user_id).emit("chatUserList", userChatListData);
            } catch (error) {
                console.log("readMessage Error ON:", error.message);
                return socketErrorRes(i18n.__("Something went wrong!"));
            }
        });

        socket.on("chatUserList", async (data) => {
            try {
                console.log("chatUserList  on :: ", data);
                let { ln = 'en' } = data;
                i18n.setLocale(ln);

                socket.join(data.user_id);

                const find_user_list = await chatUserList(data);
                socket.emit("chatUserList", find_user_list);
            } catch (error) {
                console.log("chatUserList Error ON:", error.message);
                return socketErrorRes(i18n.__("Something went wrong!"));
            }
        });

        socket.on("deleteChat", async (data) => {
            try {
                console.log("deleteChat  on :: ", data);
                let { ln = 'en' } = data;
                i18n.setLocale(ln);

                const delete_chat = await deleteChat(data);
                socket.emit("deleteChat", delete_chat);

                let userChatListData = await chatUserList({ user_id: data.user_id });
                socket.to(data.user_id).emit("chatUserList", userChatListData);
            } catch (error) {
                console.log("deleteChat Error ON:", error.message);
                return socketErrorRes(i18n.__("Something went wrong!"));
            }
        });

        socket.on("setChatRoomId", async (data) => {
            try {
                console.log("setChatRoomId  on :: ", data);
                const {
                    ln = 'en'
                } = data;
                i18n.setLocale(ln);

                const set_chat_room_id = await setChatRoomId(data);
                socket.emit("setChatRoomId", set_chat_room_id);
            } catch (error) {
                console.log("setChatRoomId Error ON:", error.message);
                return socketErrorRes(i18n.__("Something went wrong!"));
            }
        });

        socket.on("unsetChatRoomId", async (data) => {
            try {
                console.log("unsetChatRoomId  on :: ", data);
                const {
                    ln = 'en'
                } = data;
                i18n.setLocale(ln);

                const unset_chat_room_id = await unsetChatRoomId(data);
                socket.emit("unsetChatRoomId", unset_chat_room_id);

            } catch (error) {
                console.log("unsetChatRoomId Error ON:", error.message);
                return socketErrorRes(i18n.__("Something went wrong!"));
            }
        });
    });
};

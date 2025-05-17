const serviceAccount = require("../serviceAccount.json");
const { axios, firebase_admin } = require("./modules");
const { google } = require("googleapis");
const projectId = process.env.PROJECT_ID;

async function getAccessToken(serviceAccount) {
    const scopes = ["https://www.googleapis.com/auth/firebase.messaging"];
    const jwtClient = new google.auth.JWT(
        serviceAccount.client_email,
        null,
        serviceAccount.private_key,
        scopes
    );

    return new Promise((resolve, reject) => {
        jwtClient.authorize((err, tokens) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
}

firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount),
});

const subscribeToTopic = async (deviceTokens, topic) => {
    try {
        const response = await firebase_admin
            .messaging()
            .subscribeToTopic(deviceTokens, topic);
        console.log(`Successfully subscribed ${response.successCount} tokens to topic: ${topic}`);
        return { success: true, count: response.successCount };
    } catch (error) {
        console.log("Error subscribing to topic:", error.message);
        return { success: false, error: error.message };
    }
};

const unsubscribeFromTopic = async (deviceTokens, topic) => {
    try {
        const response = await firebase_admin
            .messaging()
            .unsubscribeFromTopic(deviceTokens, topic);
        console.log(`Successfully unsubscribed ${response.successCount} tokens from topic: ${topic}`);
        if (response.failureCount > 0) {
            console.log(`Failed to unsubscribe ${response.failureCount} tokens from topic: ${topic}`);
        }
        return { success: true, count: response.successCount };
    } catch (error) {
        console.log("Error unsubscribing from topic:", error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    singleNotificationSend: async (notification_data) => {
        const accessToken = await getAccessToken(serviceAccount);
        const {
            device_token,
            noti_title,
            noti_msg,
            noti_for,
            id,
            noti_image,
            details,
            sound_name,
        } = notification_data;

        let messageBody = {
            title: noti_title,
            body: noti_msg,
            noti_for: noti_for,
            id: id,
            sound: sound_name + '.caf',
        };

        if (details != undefined) {
            messageBody.details = details;
        }

        let noti_payload = {
            title: noti_title,
            body: noti_msg,
            // sound: sound_name + '.caf',
        };

        if (noti_image != undefined) {
            noti_payload.image = noti_image;
        }

        const message = {
            message: {
                token: device_token,
                notification: noti_payload,
                data: messageBody,
            },
        };

        try {
            const response = await axios.post('https://fcm.googleapis.com/v1/projects/' + projectId + '/messages:send', message,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                });

            return response;
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    },

    multiNotificationSend: async (notification_data) => {
        const accessToken = await getAccessToken(serviceAccount);
        const {
            device_token,
            noti_title,
            noti_msg,
            noti_for,
            id,
            noti_image,
            // details,
            sound_name,
        } = notification_data;

        let topic = Math.floor(1000 + Math.random() * 8999) + "_" + Date.now().toString();

        if (Array.isArray(device_token) && device_token.length > 0) {
            const subscribeResult = await subscribeToTopic(device_token, topic);
            if (!subscribeResult.success) {
                return {
                    success: false,
                    message: "Subscription failed",
                    error: subscribeResult.error,
                };
            }

            const messageBody = {
                title: noti_title,
                body: noti_msg,
                noti_for: noti_for,
                id: id,
                // sound: sound_name + '.caf',
            };


            const noti_payload = {
                title: noti_title,
                body: noti_msg,
                image: noti_image,
                // sound: sound_name ? sound_name + '.caf' : 'default',
            };

            const message = {
                message: {
                    topic: topic,
                    notification: noti_payload,
                    data: messageBody,
                    android: {
                        notification: {
                            sound: sound_name && (sound_name.toLowerCase() == "none") ? '' : (sound_name ? `${sound_name}.wav` : 'default'),
                            channel_id: sound_name && (sound_name.toLowerCase() == "none") ? 'none' : (sound_name ? `${sound_name}` : 'default'),
                            // channel_id: sound_name ? `${sound_name}` : 'default',
                        },
                    },
                    apns: {
                        payload: {
                            aps: {
                                sound: sound_name && (sound_name.toLowerCase() == "none") ? '' : (sound_name ? `${sound_name}.caf` : 'default'),
                                // sound: sound_name ? `${sound_name}.caf` : 'default',
                            },
                        },
                    },
                },
            };

            try {
                await axios.post(
                    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
                    message,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                console.log("Notification sent to topic:", topic);
            } catch (error) {
                console.error("Error sending notification to topic", error.response ? error.response.data : error.message);
            }

            const unsubscribeResult = await unsubscribeFromTopic(device_token, topic);
            if (!unsubscribeResult.success) {
                return {
                    success: false,
                    message: "Unsubscription failed",
                    error: unsubscribeResult.error,
                };
            }

            return {
                success: true,
                message: "Notification sent and tokens unsubscribed",
            };
        } else {
            return {
                success: false,
                message: "Device token must be a non-empty array.",
            };
        }
    },

    multiNotificationSendOld: async (notification_data) => {
        const accessToken = await getAccessToken(serviceAccount);
        const {
            device_token,
            noti_title,
            noti_msg,
            noti_for,
            id,
            noti_image,
            details,
            sound_name,
        } = notification_data;

        for (const value of device_token) {
            let messageBody = {
                title: noti_title,
                body: noti_msg,
                noti_for: noti_for,
                id: id,
                // sound: sound_name + '.caf',
            };

            if (details != undefined) {
                messageBody.details = details;
            }

            let noti_payload = {
                title: noti_title,
                body: noti_msg,
                // sound: sound_name ? sound_name + '.caf' : 'default',
            };

            if (noti_image != undefined) {
                noti_payload.image = noti_image;
            }

            // const message = {
            //   message: {
            //     token: value,
            //     notification: noti_payload,
            //     data: messageBody,
            //   },
            // };

            // const message = {
            //   message: {
            //     token: value,
            //     notification: noti_payload,
            //     data: messageBody,
            //     android: {
            //       notification: {
            //         sound: sound_name ? `${sound_name}.wav` : 'default',
            //         channel_id: sound_name ? `${sound_name}` : 'default',
            //       },
            //     },
            //     apns: {
            //       payload: {
            //         aps: {
            //           sound: sound_name ? `${sound_name}.caf` : 'default',
            //         },
            //       },
            //     },
            //   },
            // };

            const message = {
                message: {
                    token: value,
                    notification: noti_payload,
                    data: messageBody,
                    android: {
                        notification: {
                            sound: sound_name && (sound_name.toLowerCase() == "none") ? '' : (sound_name ? `${sound_name}.wav` : 'default'),
                            channel_id: sound_name && (sound_name.toLowerCase() == "none") ? 'none' : (sound_name ? `${sound_name}` : 'default'),
                            // channel_id: sound_name ? `${sound_name}` : 'default',
                        },
                    },
                    apns: {
                        payload: {
                            aps: {
                                sound: sound_name && (sound_name.toLowerCase() == "none") ? '' : (sound_name ? `${sound_name}.caf` : 'default'),
                                // sound: sound_name ? `${sound_name}.caf` : 'default',
                            },
                        },
                    },
                },
            };

            try {
                await axios.post('https://fcm.googleapis.com/v1/projects/' + projectId + '/messages:send', message,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                    });
                console.log("Notification sent to:", value);
            } catch (error) {
                console.error("Error sending notification to", value, error.response ? error.response.data : error.message);
            }
        }
    },
};

const { jwt } = require("../../utils/modules");
const { users, user_sessions } = require("../models/index");

const { errorRes, authFailRes } = require("../../utils/response_functions");

const verifyToken = async (req, res, next) => {
    try {
        const bearerHeader = req.headers["authorization"];

        if (!bearerHeader) {
            return errorRes(res, `A token is required for authentication.`);
        }

        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];

        const findUsersSession = await user_sessions.findOne({
            auth_token: bearerToken
        });

        if (!findUsersSession) {
            return await authFailRes(res, "Authentication failed.");
        }

        const { id } = jwt.verify(bearerToken, process.env.TOKEN_KEY);

        const findUsers = await users.findOne({
            _id: id,
            is_deleted: false,
        });

        if (!findUsers) {
            return await authFailRes(res, "Authentication failed.");
        }
        if (findUsers.is_blocked_by_admin == true || findUsers.is_blocked_by_admin == "true") {
            return await authFailRes(res, "Your account has been blocked by the admin.");
        }
        req.user = findUsers;
        req.user.token = bearerToken;
        next();
    } catch (error) {
        if (error.message == "jwt malformed") {
            return await authFailRes(res, "Authentication failed.");
        }

        console.log("jwt::::::::::", error.message);
        return await errorRes(res, "Internal server error");
    }
};

const verifyTokenCreateProfile = async (req, res, next) => {
    try {
        const bearerHeader = req.headers["authorization"];

        if (!bearerHeader) {
            return errorRes(res, `A token is required for authentication.`);
        }

        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];

        const { id } = jwt.verify(bearerToken, process.env.TOKEN_KEY);

        const findUsers = await users.findOne({
            _id: id,
            is_deleted: false,
        });

        if (!findUsers) {
            return await authFailRes(res, "Authentication failed.");
        }
        if (findUsers.is_blocked_by_admin == true || findUsers.is_blocked_by_admin == "true") {
            return await authFailRes(res, "Your account has been blocked by the admin.");
        }
        req.user = findUsers;
        req.user.token = bearerToken;
        next();
    } catch (error) {
        if (error.message == "jwt malformed") {
            return await authFailRes(res, "Authentication failed.");
        }

        console.log("jwt::::::::::", error.message);
        return await errorRes(res, "Internal server error");
    }
};

const verifyTokenLogout = async (req, res, next) => {
    try {
        const bearerHeader = req.headers["authorization"];

        if (!bearerHeader) {
            return errorRes(res, `A token is required for authentication.`);
        }

        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];

        const findUsersSession = await user_sessions.findOne({
            auth_token: bearerToken
        });

        if (!findUsersSession) {
            return await authFailRes(res, "Authentication failed.");
        }

        const { id } = jwt.verify(bearerToken, process.env.TOKEN_KEY);

        const findUsers = await users.findOne({
            _id: id,
            is_deleted: false,
        });

        if (!findUsers) {
            return await authFailRes(res, "Authentication failed.");
        }

        req.user = findUsers;
        req.user.token = bearerToken;
        next();
    } catch (error) {
        if (error.message == "jwt malformed") {
            return await authFailRes(res, "Authentication failed.");
        }

        console.log("jwt::::::::::", error.message);
        return await errorRes(res, "Internal server error");
    }
};

module.exports = {
    userAuth: verifyToken,
    userAuthLogout: verifyTokenLogout,
    userAuthCreateProfile: verifyTokenCreateProfile,
};
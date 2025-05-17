const { i18n } = require("../../../../utils/modules");

const { userToken } = require("../../../../utils/token");

const { users, user_sessions, email_verifications } = require("../../../models/index");

const { errorRes, successRes } = require("../../../../utils/response_functions");

const { sendOtpForgotPasswordAdmin } = require("../../../../utils/send_mail");

const { findVerifyEmailAddress, findEmailAddress, findUser } = require("../../../../utils/user_function");

const {
    securePassword,
    comparePassword,
} = require("../../../../utils/secure_password");

const adminSignUp = async (req, res) => {
    try {
        const { email_address, password, device_type, device_token, ln } = req.body;
        i18n.setLocale(req, ln);

        const check_admin_email = await findVerifyEmailAddress(email_address);

        if (check_admin_email) {
            return errorRes(res, res.__("This email address is already registered. Please use a different email or log in to your existing account."));
        }

        const hashedPassword = await securePassword(password);

        const insert_admin_data = {
            email_address,
            password: hashedPassword,
            user_type: "admin",
        };

        await email_verifications.create({
            email_address: email_address,
            is_email_verified: true,
        });
        const create_admin = await users.create(insert_admin_data);
        const token = await userToken(create_admin);

        const insert_admin_session_data = {
            device_token,
            device_type,
            auth_token: token,
            user_id: create_admin._id,
            user_type: "admin",
            is_login: true,
        };

        await user_sessions.create(insert_admin_session_data);

        const response_data = {
            ...create_admin._doc,
            token: token,
        }

        return successRes(res, res.__("Admin account created successfully."), response_data);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const adminSignIn = async (req, res) => {
    try {
        const { email_address, password, device_type, device_token, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_admin = await findEmailAddress(email_address);

        if (!find_admin) {
            return errorRes(res, res.__("No account found associated with this email address."));
        }

        const password_verify = await comparePassword(password, find_admin.password);

        if (!password_verify) {
            return errorRes(res, res.__("The password you entered is incorrect. Please try again."));
        }

        const token = await userToken(find_admin);

        const insert_admin_session_data = {
            device_token,
            device_type,
            auth_token: token,
            user_id: find_admin._id,
            user_type: "admin",
            is_login: true,
        };

        await user_sessions.create(insert_admin_session_data);

        delete find_admin.password;

        const response_data = {
            ...find_admin._doc,
            token: token,
        }

        return successRes(res, res.__("Admin logged in successfully."), response_data);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const adminChangePassword = async (req, res) => {
    try {
        const { old_password, new_password, ln } = req.body;
        const { _id, password, token } = req.user;

        i18n.setLocale(req, ln);

        const password_verify = await comparePassword(old_password, password);

        if (!password_verify) {
            return errorRes(
                res,
                res.__("The old password you entered is incorrect. Please try again.")
            );
        }

        const hashedPassword = await securePassword(new_password);

        const find_admin = await findUser(_id);

        if (find_admin.password == hashedPassword) {
            return errorRes(
                res,
                res.__("The new password is too similar to the old password. Please choose a different one.")
            );
        }

        const update_data = {
            password: hashedPassword,
        };

        await users.findByIdAndUpdate(_id, update_data);
        await user_sessions.deleteMany(
            {
                user_id: _id,
                auth_token: { $ne: token }
            },
        );

        return successRes(res, res.__("Your password has been successfully changed."));
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const adminSendOtpForgotPassword = async (req, res) => {
    try {
        const { email_address, ln } = req.body;
        i18n.setLocale(req, ln);

        const login_data = await findEmailAddress(email_address);

        if (!login_data) {
            return errorRes(res, res.__("No account associated with this email address was found."));
        }

        const otp = Math.floor(1000 + Math.random() * 8000);

        const data = {
            otp,
            emailAddress: email_address,
        };

        await sendOtpForgotPasswordAdmin(data);

        const update_data = {
            otp,
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

        return successRes(
            res,
            res.__("An OTP has been successfully sent to your email."),
            otp
        );
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const adminVerifyOtp = async (req, res) => {
    try {
        const { email_address, otp, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_admin = await findVerifyEmailAddress(email_address);

        if (!find_admin) {
            return errorRes(res, res.__("No account associated with this email address was found."));
        }

        if (find_admin.otp == otp) {
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

            return successRes(res, res.__("OTP verified successfully."));
        } else {
            return errorRes(res, res.__("Please enter a valid OTP."));
        }
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const adminResetPassword = async (req, res) => {
    try {
        const { email_address, password, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_admin = await findEmailAddress(email_address);

        if (!find_admin) {
            return errorRes(res, res.__("No account found with the provided email address."));
        }

        const hashedPassword = await securePassword(password);

        const update_data = {
            password: hashedPassword,
        };

        await users.findByIdAndUpdate(find_admin._id, update_data, {
            new: true,
        });

        return successRes(res, res.__("Your password has been successfully reset."));
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const adminLogout = async (req, res) => {
    try {
        const user_id = req.user._id;

        const { ln } = req.body;
        const { token } = req.user;
        i18n.setLocale(req, ln);

        const find_admin = await findUser(user_id);

        if (!find_admin) {
            return errorRes(res, res.__("User not found."));
        } else {
            await user_sessions.deleteMany({ user_id: user_id, auth_token: token });

            return successRes(res, res.__("You have successfully logged out."), []);
        }
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const dashboard = async (req, res) => {
    try {
        const { ln } = req.body;
        i18n.setLocale(req, ln);

        const adminDashboard = {
            users: 0,
        };

        const [
            find_user_count,
        ] = await Promise.all([
            users.countDocuments({ user_type: "user", is_deleted: false }),
        ]);

        const res_data = {
            ...adminDashboard,
            users: find_user_count,
        };

        return successRes(res, res.__("Data has been successfully loaded."), res_data);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

module.exports = {
    adminSignUp,
    adminSignIn,
    adminChangePassword,
    adminSendOtpForgotPassword,
    adminVerifyOtp,
    adminResetPassword,
    adminLogout,
    dashboard,
};
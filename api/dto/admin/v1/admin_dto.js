const { joi } = require("./../../../../utils/modules");

const adminSignUpDto = joi.object().keys({
    email_address: joi.string().email().required().label("Email address"),
    password: joi.string().allow().label("Password"),
    device_type: joi.string().required().valid("web").label("Device type"),
    device_token: joi.string().allow().label("Device token"),
    ln: joi.string().allow().label("Ln"),
});

const adminSignInDto = joi.object().keys({
    email_address: joi.string().email().required().label("Email address"),
    password: joi.string().allow().label("Password"),
    device_type: joi.string().required().valid("web").label("Device type"),
    device_token: joi.string().allow().label("Device token"),
    ln: joi.string().allow().label("Ln"),
});

const adminChangePasswordDto = joi.object().keys({
    old_password: joi.string().allow().label("Old password"),
    new_password: joi.string().allow().label("New password"),
    ln: joi.string().allow().label("Ln"),
});

const adminSendOtpForgotPasswordDto = joi.object().keys({
    email_address: joi.string().email().required().label("Email address"),
    ln: joi.string().allow().label("Ln"),
});

const adminVerifyOtpDto = joi.object().keys({
    email_address: joi.string().email().required().label("Email address"),
    otp: joi.allow().label("Otp"),
    ln: joi.string().allow().label("Ln"),
});

const adminResetPasswordDto = joi.object().keys({
    email_address: joi.string().email().required().label("Email address"),
    password: joi.string().allow().label("Password"),
    ln: joi.string().allow().label("Ln"),
});

const adminLogoutDto = joi.object().keys({
    ln: joi.string().allow().label("Ln"),
});

const dashboardDto = joi.object().keys({
    ln: joi.string().allow().label("Ln"),
});

module.exports = {
    adminSignUpDto,
    adminSignInDto,
    adminChangePasswordDto,
    adminSendOtpForgotPasswordDto,
    adminVerifyOtpDto,
    adminResetPasswordDto,
    adminLogoutDto,
    dashboardDto,
};
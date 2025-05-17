const { joi } = require("./../../../../utils/modules");

const guestSessionDto = joi.object().keys({
    device_token: joi.string().allow().label("Device token"),
    device_type: joi.string().allow().label("Device type"),
    ln: joi.string().allow().label("Ln"),
});

const checkEmailAddressDto = joi.object().keys({
    email_address: joi.string().required().label("Email address"),
    ln: joi.string().allow().label("Ln"),
});

const checkMobileNumberDto = joi.object().keys({
    mobile_number: joi.string().required().label("Mobile number"),
    ln: joi.string().allow().label("Ln"),
});

const signUpDto = joi.object().keys({
    full_name: joi.string().allow().label("Full name"),
    email_address: joi.string().allow().label("Email address"),
    country_code: joi.string().allow().label("Country code"),
    country_string_code: joi.string().allow().label("Country string code"),
    mobile_number: joi.string().allow().label("Mobile number"),
    is_social_login: joi.string().allow().label("Is social login"),
    social_id: joi.string().allow().label("Social id"),
    social_platform: joi.string().allow().label("Social platform"),
    device_token: joi.string().allow().label("Device token"),
    device_type: joi.string().allow().label("Device type"),
    password: joi.string().allow().label("Password"),
    ln: joi.string().allow().label("Ln"),
});

const signInDto = joi.object().keys({
    email_address: joi.string().allow().label("Email address"),
    device_token: joi.string().allow().label("Device token"),
    full_name: joi.string().allow().label("Full name"),
    device_type: joi.string().allow().label("Device type"),
    is_social_login: joi.string().allow().label("Is social login"),
    social_id: joi.string().allow().label("Social id"),
    social_platform: joi.string().allow().label("Social platform"),
    password: joi.string().allow().label("Password"),
    ln: joi.string().allow().label("Ln"),
});

const changePasswordDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    old_password: joi.string().allow().label("Old password"),
    new_password: joi.string().allow().label("New password"),
    ln: joi.string().allow().label("Ln"),
});

const forgotPasswordDto = joi.object().keys({
    email_address: joi.string().allow().label("Email address"),
    ln: joi.string().allow().label("Ln"),
});

const verifyOtpDto = joi.object().keys({
    email_address: joi.string().allow().label("Email address"),
    otp: joi.string().allow().label("Otp"),
    ln: joi.string().allow().label("Ln"),
});

const resetPasswordDto = joi.object().keys({
    email_address: joi.string().allow().label("Email address"),
    mobile_number: joi.string().allow().label("Mobile number"),
    new_password: joi.string().allow().label("New password"),
    ln: joi.string().allow().label("Ln"),
});

const logoutDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    logout_user_id: joi.allow().label("Logout user id"),
    device_token: joi.string().allow().label("Device token"),
    ln: joi.string().allow().label("Ln"),
});

const deleteAccountDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    device_token: joi.string().allow().label("Device token"),
    ln: joi.string().allow().label("Ln"),
});

const uploadMediaDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    album_type: joi.string().allow().label("Album type"),
    ln: joi.string().allow().label("Ln"),
});

const removeMediaDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    album_id: joi.string().allow().label("Album Id"),
    ln: joi.string().allow().label("Ln"),
});

const notificationsListDto = joi.object().keys({
    page: joi.allow().label("Page"),
    limit: joi.allow().label("Limit"),
    ln: joi.string().allow().label("Ln"),
});

const changeFullNameDto = joi.object().keys({
    full_name: joi.string().required().label("Full name"),
    ln: joi.string().allow().label("Ln"),
});

const addReviewDto = joi.object().keys({
    reviewed_user_id: joi.string().required().label("Reviewed user id"),
    rating: joi.required().label("Rating"),
    review: joi.required().label("Review"),
    ln: joi.string().allow().label("Ln"),
});

const editReviewDto = joi.object().keys({
    review_id: joi.string().required().label("Review id"),
    rating: joi.required().label("Rating"),
    review: joi.required().label("Review"),
    ln: joi.string().allow().label("Ln"),
});

const deleteReviewDto = joi.object().keys({
    review_id: joi.string().required().label("Review id"),
    ln: joi.string().allow().label("Ln"),
});

const getUserReviewDto = joi.object().keys({
    reviewed_user_id: joi.string().required().label("Reviewed user id"),
    ln: joi.string().allow().label("Ln"),
});

const userReviewListDto = joi.object().keys({
    reviewed_user_id: joi.string().required().label("Reviewed user id"),
    page: joi.allow().label("Page"),
    limit: joi.allow().label("Limit"),
    ln: joi.string().allow().label("Ln"),
});

const userReviewDetailDto = joi.object().keys({
    reviewed_user_id: joi.string().required().label("Reviewed user id"),
    ln: joi.string().allow().label("Ln"),
});

const faqListingDto = joi.object().keys({
    ln: joi.string().allow().label("Ln"),
});

const userUpdatedDataDto = joi.object().keys({
    ln: joi.string().allow().label("Ln"),
});

module.exports = {
    guestSessionDto,
    checkEmailAddressDto,
    checkMobileNumberDto,
    signUpDto,
    signInDto,
    changePasswordDto,
    forgotPasswordDto,
    verifyOtpDto,
    resetPasswordDto,
    logoutDto,
    deleteAccountDto,
    uploadMediaDto,
    removeMediaDto,
    notificationsListDto,
    changeFullNameDto,
    addReviewDto,
    editReviewDto,
    deleteReviewDto,
    getUserReviewDto,
    userReviewListDto,
    userReviewDetailDto,
    faqListingDto,
    userUpdatedDataDto,
};
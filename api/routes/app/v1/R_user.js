const { app_router, multipartMiddleware } = require("./../../../../utils/modules")
const { userAuth, userAuthLogout } = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");

const {
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
} = require("./../../../controller/app/v1/C_user");

const {
    guestSessionDto,
    checkEmailAddressDto,
    checkMobileNumberDto,
    signUpDto,
    // signInDto,
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
} = require("./../../../dto/app/v1/user_dto");

app_router.post("/guest_session", multipartMiddleware, validateRequest(guestSessionDto), guestSession);
app_router.post("/check_email_address", multipartMiddleware, validateRequest(checkEmailAddressDto), checkEmailAddress);
app_router.post("/check_mobile_number", multipartMiddleware, validateRequest(checkMobileNumberDto), checkMobileNumber);
app_router.post("/sign_up", multipartMiddleware, validateRequest(signUpDto), signUp);
app_router.post("/sign_in", multipartMiddleware, signIn);
app_router.post("/change_password", multipartMiddleware, userAuth, validateRequest(changePasswordDto), changePassword);
app_router.post("/forgot_password", multipartMiddleware, validateRequest(forgotPasswordDto), forgotPassword);
app_router.post("/verify_otp", multipartMiddleware, validateRequest(verifyOtpDto), verifyOtp);
app_router.post("/reset_password", multipartMiddleware, validateRequest(resetPasswordDto), resetPassword);
app_router.post("/logout", userAuthLogout, multipartMiddleware, validateRequest(logoutDto), logout);
app_router.post("/delete_account", multipartMiddleware, userAuth, validateRequest(deleteAccountDto), deleteAccount);
app_router.post("/upload_media", userAuth, multipartMiddleware, validateRequest(uploadMediaDto), uploadMedia);
app_router.post("/remove_media", userAuth, multipartMiddleware, validateRequest(removeMediaDto), removeMedia);
app_router.post("/notification_list", userAuth, multipartMiddleware, validateRequest(notificationsListDto), notificationsList);
app_router.post("/change_full_name", userAuth, multipartMiddleware, validateRequest(changeFullNameDto), changeFullName);
app_router.post("/add_review", userAuth, multipartMiddleware, validateRequest(addReviewDto), addReview);
app_router.post("/edit_review", userAuth, multipartMiddleware, validateRequest(editReviewDto), editReview);
app_router.post("/delete_review", userAuth, multipartMiddleware, validateRequest(deleteReviewDto), deleteReview);
app_router.post("/user_review", userAuth, multipartMiddleware, validateRequest(getUserReviewDto), getUserReview);
app_router.post("/user_review_list", userAuth, multipartMiddleware, validateRequest(userReviewListDto), userReviewList);
app_router.post("/user_review_detail", userAuth, multipartMiddleware, validateRequest(userReviewDetailDto), userReviewDetail);
app_router.post("/faq_listing", userAuth, multipartMiddleware, validateRequest(faqListingDto), faqListing);
app_router.post("/upload_socket_media", multipartMiddleware, uploadSocketMedia);
app_router.post("/get_user_data", userAuth, multipartMiddleware, validateRequest(userUpdatedDataDto), userUpdatedData);

module.exports = app_router;

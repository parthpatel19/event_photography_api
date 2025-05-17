const { admin_router, multipartMiddleware } = require("./../../../../utils/modules")
const { userAuth } = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");

const {
    adminSignUp,
    adminSignIn,
    adminChangePassword,
    adminSendOtpForgotPassword,
    adminVerifyOtp,
    adminResetPassword,
    adminLogout,
    dashboard,
} = require("./../../../controller/admin/v1/C_admin");

const {
    adminSignUpDto,
    adminSignInDto,
    adminChangePasswordDto,
    adminSendOtpForgotPasswordDto,
    adminVerifyOtpDto,
    adminResetPasswordDto,
    adminLogoutDto,
    dashboardDto,
} = require("./../../../dto/admin/v1/admin_dto");

admin_router.post("/sign_up", multipartMiddleware, validateRequest(adminSignUpDto), adminSignUp);
admin_router.post("/sign_in", multipartMiddleware, validateRequest(adminSignInDto), adminSignIn);
admin_router.post("/change_password", userAuth, multipartMiddleware, validateRequest(adminChangePasswordDto), adminChangePassword);
admin_router.post("/send_otp_forgot_password", multipartMiddleware, validateRequest(adminSendOtpForgotPasswordDto), adminSendOtpForgotPassword);
admin_router.post("/verify_otp", multipartMiddleware, validateRequest(adminVerifyOtpDto), adminVerifyOtp);
admin_router.post("/reset_password", multipartMiddleware, validateRequest(adminResetPasswordDto), adminResetPassword);
admin_router.post("/logout", userAuth, multipartMiddleware, validateRequest(adminLogoutDto), adminLogout);
admin_router.post("/dashboard", userAuth, multipartMiddleware, validateRequest(dashboardDto), dashboard);

module.exports = admin_router;
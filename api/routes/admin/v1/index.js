const { admin_router } = require("./../../../../utils/modules")

admin_router.use("/admin", require("./R_admin"));
admin_router.use("/app_content", require("./R_app_content"));
admin_router.use("/faq", require("./R_faq"));

module.exports = admin_router;
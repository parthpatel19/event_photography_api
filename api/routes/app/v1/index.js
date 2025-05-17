const { app_router } = require("./../../../../utils/modules")

app_router.use("/app_version", require("./R_app_version"));
app_router.use("/pet", require("./R_pet"));
app_router.use("/user", require("./R_user"));

module.exports = app_router;
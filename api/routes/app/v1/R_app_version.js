const { app_router, multipartMiddleware } = require("./../../../../utils/modules");
const validateRequest = require("../../../middlewares/validation");

const {
    addAppVersion,
    appVersionCheck,
} = require("../../../controller/app/v1/C_app_version");

const {
    addAppVersionDto,
    appVersionCheckDto,
} = require("./../../../dto/app/v1/app_version_dto");

app_router.post("/add_app_version", multipartMiddleware, validateRequest(addAppVersionDto), addAppVersion);
app_router.post("/update_app_version", multipartMiddleware, validateRequest(appVersionCheckDto), appVersionCheck);

module.exports = app_router;
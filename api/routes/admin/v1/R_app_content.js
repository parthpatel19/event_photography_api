const { admin_router, multipartMiddleware } = require("../../../../utils/modules")
const { userAuth } = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");

const {
    addContent,
    editContent,
    deleteContent,
    getContent
} = require("../../../controller/admin/v1/C_app_content");

const {
    addContentDto,
    editContentDto,
    deleteContentDto,
    getContentDto,
} = require("./../../../dto/admin/v1/app_content_dto");

admin_router.post("/add_content", userAuth, multipartMiddleware, validateRequest(addContentDto), addContent);
admin_router.post("/edit_content", userAuth, multipartMiddleware, validateRequest(editContentDto), editContent);
admin_router.post("/delete_content", userAuth, multipartMiddleware, validateRequest(deleteContentDto), deleteContent);
admin_router.post("/get_content", userAuth, multipartMiddleware, validateRequest(getContentDto), getContent);

module.exports = admin_router;
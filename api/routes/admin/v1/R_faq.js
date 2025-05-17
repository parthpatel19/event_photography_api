const { admin_router, multipartMiddleware } = require("./../../../../utils/modules")
const { userAuth } = require("../../../middlewares/auth");
const validateRequest = require("../../../middlewares/validation");

const {
    addFaq,
    editFaq,
    deleteFaq,
    listFaq,
    activeDeactiveFaq,
} = require("./../../../controller/admin/v1/C_faq");

const {
    addFaqDto,
    editFaqDto,
    deleteFaqDto,
    listFaqDto,
    activeDeactiveFaqDto,
} = require("./../../../dto/admin/v1/faq_dto");

admin_router.post("/add_faq", userAuth, multipartMiddleware, validateRequest(addFaqDto), addFaq);
admin_router.post("/edit_faq", userAuth, multipartMiddleware, validateRequest(editFaqDto), editFaq);
admin_router.post("/delete_faq", userAuth, multipartMiddleware, validateRequest(deleteFaqDto), deleteFaq);
admin_router.post("/list_faq", userAuth, multipartMiddleware, validateRequest(listFaqDto), listFaq);
admin_router.post("/active_deactive_faq", userAuth, multipartMiddleware, validateRequest(activeDeactiveFaqDto), activeDeactiveFaq);

module.exports = admin_router;
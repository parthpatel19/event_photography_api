const { joi } = require("./../../../../utils/modules");

const addFaqDto = joi.object().keys({
    question: joi.string().allow().label("Question"),
    answer: joi.string().allow().label("Answer"),
    ln: joi.string().allow().label("Ln"),
});

const editFaqDto = joi.object().keys({
    faq_id: joi.string().allow().label("Faq id"),
    question: joi.string().allow().label("Question"),
    answer: joi.string().allow().label("Answer"),
    ln: joi.string().allow().label("Ln"),
});

const deleteFaqDto = joi.object().keys({
    faq_id: joi.string().allow().label("Faq id"),
    ln: joi.string().allow().label("Ln"),
});

const listFaqDto = joi.object().keys({
    search: joi.string().allow("").label("Search"),
    page: joi.allow().label("Page"),
    limit: joi.allow().label("Limit"),
    ln: joi.string().allow().label("Ln"),
});

const activeDeactiveFaqDto = joi.object().keys({
    faq_id: joi.string().allow().label("Faq id"),
    is_active: joi.allow().label("Is active"),
    ln: joi.string().allow().label("Ln"),
});

module.exports = {
    addFaqDto,
    editFaqDto,
    deleteFaqDto,
    listFaqDto,
    activeDeactiveFaqDto,
};
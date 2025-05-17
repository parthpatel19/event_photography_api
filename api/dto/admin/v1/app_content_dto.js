const { joi } = require("./../../../../utils/modules");

const addContentDto = joi.object().keys({
    content_type: joi.string().required().label("Content type"),
    content: joi.string().allow().label("Content"),
    ln: joi.string().allow().label("Ln"),
});

const editContentDto = joi.object().keys({
    content_id: joi.string().allow().label("Content id"),
    content_type: joi.string().allow().label("Content type"),
    content: joi.string().allow().label("Content"),
    ln: joi.string().allow().label("Ln"),
});

const deleteContentDto = joi.object().keys({
    content_id: joi.string().allow().label("Content id"),
    ln: joi.string().allow().label("Ln"),
});

const getContentDto = joi.object().keys({
    ln: joi.string().allow().label("Ln"),
});

module.exports = {
    addContentDto,
    editContentDto,
    deleteContentDto,
    getContentDto,
};
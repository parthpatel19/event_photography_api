const { i18n } = require("../../../../utils/modules");

const { app_contents } = require("../../../models/index");

const { errorRes, successRes } = require("../../../../utils/response_functions");

const { findContentByType, findContent } = require("../../../../utils/user_function");

const addContent = async (req, res) => {
    try {
        const { content_type, content, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_content = await findContentByType(content_type);

        if (find_content) {
            return errorRes(res, res.__("The content already exists."));
        }

        const insert_data = {
            content_type,
            content
        }

        const create_content = await app_contents.create(insert_data);

        return successRes(res, res.__("The content has been successfully created."), create_content);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const editContent = async (req, res) => {
    try {
        const { content_id, content, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_content = await findContent(content_id);

        if (!find_content) {
            return errorRes(res, res.__("Content not found."));
        }

        const update_data = {
            content
        }

        await app_contents.findByIdAndUpdate(
            {
                _id: content_id,
            },
            {
                $set: update_data
            });

        const find_updated_content = await findContent(content_id);

        return successRes(res, res.__("The content has been successfully updated."), find_updated_content);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const deleteContent = async (req, res) => {
    try {
        const { content_id, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_content = await findContent(content_id);

        if (!find_content) {
            return errorRes(res, res.__("Content not found."));
        }

        const update_data = {
            is_deleted: true,
        }

        await app_contents.findByIdAndUpdate(
            {
                _id: content_id,
            },
            {
                $set: update_data
            });

        return successRes(res, res.__("The content has been successfully deleted."), []);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const getContent = async (req, res) => {
    try {
        const { ln } = req.body;
        i18n.setLocale(req, ln);

        const find_content = await app_contents.find({
            is_deleted: false
        });

        if (!find_content) {
            return errorRes(res, res.__("Content not found"));
        }

        return successRes(res, res.__("The content has been successfully retrieved."), find_content);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

module.exports = {
    addContent,
    editContent,
    deleteContent,
    getContent,
};
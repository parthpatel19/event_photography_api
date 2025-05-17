const { i18n } = require("../../../../utils/modules");

const { faqs } = require("../../../models/index");

const { errorRes, successRes, multiSuccessRes } = require("../../../../utils/response_functions");

const { findFaqByName, escapeRegex, findFaq } = require("../../../../utils/user_function");

const addFaq = async (req, res) => {
    try {
        const { question, answer, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_faq = await findFaqByName(question);

        if (find_faq) {
            return errorRes(res, res.__("The FAQ already exists."));
        }

        const create_faq = await faqs.create({
            question: question,
            answer: answer,
        });

        return successRes(res, res.__("The FAQ has been successfully added."), create_faq);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const editFaq = async (req, res) => {
    try {
        const { faq_id, question, answer, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_faq = await findFaq(faq_id);

        if (!find_faq) {
            return errorRes(res, res.__("The FAQ was not found."));
        }

        const find_exists_faq = await faqs.findOne({
            _id: { $ne: faq_id },
            question: question,
        });

        if (find_exists_faq) {
            return errorRes(res, res.__("The FAQ already exists."));
        }

        await faqs.updateOne(
            {
                _id: faq_id,
            },
            {
                $set: {
                    question: question,
                    answer: answer,
                }
            }
        );

        const find_updated_faq = await findFaq(faq_id);

        return successRes(res, res.__("The FAQ has been successfully updated."), find_updated_faq);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const deleteFaq = async (req, res) => {
    try {
        const { faq_id, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_faq = await findFaq(faq_id);

        if (!find_faq) {
            return errorRes(res, res.__("The FAQ was not found."));
        }

        await faqs.deleteOne({ _id: faq_id });

        return successRes(res, res.__("The FAQ has been successfully deleted."), []);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const listFaq = async (req, res) => {
    try {
        const { search, page, limit, ln } = req.body;
        i18n.setLocale(req, ln);

        const escapedSearch = search ? await escapeRegex(search) : null;

        const list_faq = await faqs.aggregate([
            {
                $match: search
                    ? {
                        $or: [
                            { question: { $regex: escapedSearch, $options: "i" } },
                            { answer: { $regex: escapedSearch, $options: "i" } },
                        ]
                    }
                    : {},
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: (parseInt(page) - 1) * parseInt(limit),
            },
            {
                $limit: parseInt(limit),
            },
            {
                $project: {
                    _id: 1,
                    question: 1,
                    answer: 1,
                    is_active: 1,
                    createdAt: 1,
                    updatedAt: 1,
                }
            }
        ]);

        const faq_list_count = await faqs.countDocuments({
            $or: [
                { question: { $regex: escapedSearch, $options: "i" } },
                { answer: { $regex: escapedSearch, $options: "i" } },
            ]
        });

        return multiSuccessRes(res, res.__("The FAQ list has been successfully retrieved."), faq_list_count, list_faq);
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const activeDeactiveFaq = async (req, res) => {
    try {
        const { faq_id, is_active, ln } = req.body;
        i18n.setLocale(req, ln);

        const find_faq = await findFaq(faq_id);

        if (!find_faq) {
            return errorRes(res, res.__("The FAQ was not found."));
        }

        if (is_active == true || is_active == "true") {
            if (find_faq.is_active == true || find_faq.is_active == "true") {
                return successRes(res, res.__("The FAQ is already activated."), []);
            } else {
                await faqs.updateOne(
                    {
                        _id: faq_id
                    },
                    {
                        $set: {
                            is_active: true
                        }
                    }
                );

                return successRes(res, res.__("The FAQ has been successfully activated."), []);
            }
        }

        if (is_active == false || is_active == "false") {
            if (find_faq.is_active == false || find_faq.is_active == "false") {
                return successRes(res, res.__("The FAQ is already deactivated."), []);
            } else {
                await faqs.updateOne(
                    {
                        _id: faq_id
                    },
                    {
                        $set: {
                            is_active: false
                        }
                    }
                );

                return successRes(res, res.__("The FAQ has been successfully deactivated."), []);
            }
        }
    } catch (error) {
        console.log("Error : ", error);
        return errorRes(res, res.__("Internal server error"));
    }
};

module.exports = {
    addFaq,
    editFaq,
    deleteFaq,
    listFaq,
    activeDeactiveFaq,
};
const { i18n } = require("../../../../utils/modules");

const { app_versions, app_contents } = require("../../../models/index");

const { errorRes, successRes } = require("../../../../utils/response_functions");

const addAppVersion = async (req, res) => {
    try {
        const {
            app_version,
            is_maintenance,
            app_update_status,
            app_platform,
            app_url,
            api_base_url,
            is_live,
            ln
        } = req.body;

        i18n.setLocale(req, ln);

        const insert_qry = await app_versions.create({
            app_version,
            is_maintenance,
            app_update_status,
            app_platform,
            app_url,
            api_base_url,
            is_live,
        });

        return successRes(res, res.__("App version added successfully"), insert_qry);
    } catch (error) {
        console.log(error);
        return errorRes(res, res.__("Internal server error"));
    }
};

const appVersionCheck = async (req, res) => {
    try {
        const {
            app_version,
            app_platform,
            ln
        } = req.body;

        i18n.setLocale(req, ln);

        var result = [];

        let check_version = await app_versions.findOne({
            app_version: app_version,
            is_live: true,
            app_platform: app_platform,
            is_deleted: false,
        });

        var app_update_status = "";

        if (check_version) {
            if (check_version.app_version != app_version) {
                app_update_status = check_version.app_update_status;

                if (app_update_status == "is_force_update") {
                    result = {
                        ...result,
                        is_need_update: true,
                        is_force_update: true,
                    };
                } else {
                    result = {
                        ...result,
                        is_need_update: true,
                        is_force_update: false,
                    };
                }
            } else {
                result = {
                    ...result,
                    is_need_update: false,
                    is_force_update: false,
                };
            }

            result["is_maintenance"] = check_version.is_maintenance;
        } else {
            let check_version = await app_versions.findOne({
                is_live: true,
                app_platform: app_platform,
                is_deleted: false,
            });

            app_update_status = check_version?.app_update_status;

            if (app_update_status == "is_force_update") {
                result = { ...result, is_need_update: true, is_force_update: true };
            } else {
                result = {
                    ...result,
                    is_need_update: true,
                    is_force_update: false,
                };
            }
            result["is_maintenance"] = check_version?.is_maintenance;
        }

        const find_terms_and_condition = await app_contents.findOne({
            content_type: "terms_and_condition",
            is_deleted: false,
        });

        const find_privacy_policy = await app_contents.findOne({
            content_type: "privacy_policy",
            is_deleted: false,
        });

        const find_about = await app_contents.findOne({
            content_type: "about",
            is_deleted: false,
        });

        const result_data = {
            ...result,
            terms_and_condition: find_terms_and_condition.content,
            privacy_policy: find_privacy_policy.content,
            about: find_about.content,
        }

        return successRes(res, res.__("App version updated successfully"), result_data);
    } catch (error) {
        console.log(error);
        return errorRes(res, res.__("Internal server error"));
    }
};

module.exports = {
    addAppVersion,
    appVersionCheck,
};
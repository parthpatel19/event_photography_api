const successRes = async (res, msg, data) => {
    return res.send({
        success: true,
        statuscode: 1,
        message: msg,
        data: data,
    });
};

const warningRes = async (res, msg) => {
    return res.send({
        success: false,
        statuscode: 2,
        message: msg,
    });
};

const multiSuccessRes = async (res, msg, total_count, data) => {
    return res.send({
        success: true,
        statuscode: 1,
        message: msg,
        total_number_of_data: total_count,
        data: data,
    });
};

const tokenSuccessRes = async (res, msg, token, data) => {
    return res.send({
        success: true,
        statuscode: 1,
        message: msg,
        token: token,
        data: data,
    });
};

const manyMultiSuccessRes = async (res, msg, data, total_count, page_count) => {
    return res.send({
        success: true,
        statuscode: 1,
        message: msg,
        total_number_of_data: total_count,
        page_no_count: page_count,
        data: data,
    });
};

const errorRes = async (res, msg) => {
    return res.send({
        success: false,
        statuscode: 0,
        message: msg,
    });
};

const authFailRes = async (res, msg) => {
    return res.status(401).json({
        success: false,
        statuscode: 101,
        message: msg,
    });
};

const webAuthFailRes = async (res, msg) => {
    return res.send({
        success: false,
        statuscode: 101,
        message: msg,
    });
};

///////////////////////////////// Socket responses ////////////////////////////////
const socketSuccessRes = async (msg, data) => {
    return {
        success: true,
        statuscode: 1,
        message: msg,
        data: data,
    };
};

const socketMultiSuccessRes = async (msg, total_count, data) => {
    return {
        success: true,
        statuscode: 1,
        message: msg,
        total_number_of_data: total_count,
        data: data,
    };
};

const socketErrorRes = async (msg) => {
    return {
        success: false,
        statuscode: 0,
        message: msg,
        data: []
    };
};

const InternalErrorRes = async () => {
    return {
        success: false,
        statuscode: 0,
        message: "Internal server error",
        data: []
    };
};

module.exports = {
    successRes,
    warningRes,
    multiSuccessRes,
    tokenSuccessRes,
    manyMultiSuccessRes,
    errorRes,
    authFailRes,
    webAuthFailRes,
    socketSuccessRes,
    socketMultiSuccessRes,
    socketErrorRes,
    InternalErrorRes,
};

const { crypto } = require("./modules");

const algorithm = process.env.ALGORITHM;

// generate 16 bytes of random data
const initVector = process.env.INITVECTOR;

// secret key generate 32 bytes of random data
const securityKey = process.env.SECURITYKEY;

const securePassword = async (password) => {
    const cipher = await crypto.createCipheriv(
        algorithm,
        securityKey,
        initVector
    );
    let encryptedData = await cipher.update(password, "utf-8", "hex");

    encryptedData += await cipher.final("hex");

    return encryptedData;
};

const comparePassword = async (password, dbPassword) => {
    const originalPwd = await decryptPassword(dbPassword);

    if (originalPwd == password) {
        return true;
    } else {
        return false;
    }
};

const decryptPassword = async (password) => {
    const decipher = crypto.createDecipheriv(algorithm, securityKey, initVector);
    let decryptedData = decipher.update(password, "hex", "utf-8");

    decryptedData += decipher.final("utf8");

    return decryptedData;
};

module.exports = {
    securePassword,
    comparePassword,
    decryptPassword
};

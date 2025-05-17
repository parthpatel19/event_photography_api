const { fs } = require("./modules");

const removeFile = (data) => {
    try {
        const filepath = "./uploads/" + data;

        if (Array.isArray(data)) {
            data.map((images) => {
                const filepath = "./uploads/" + images;
                fs.unlink(filepath, function (error) {
                    if (error) return error;
                });
            });
        } else {
            // Delete file here if error occurred.
            fs.unlink(filepath, function (error) {
                if (error) return error;
            });
        }
    } catch (error) {
        console.log("Error :", error);        
    }
};

module.exports = { removeFile };

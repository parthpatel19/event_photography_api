const { fs } = require("./modules");

const {
    s3Client,
    PutObjectCommand,
    DeleteObjectCommand
} = require("./../config/bucket_config");

const uploadMediaIntoS3Bucket = async (media_file, folder_name, content_type) => {
    try {
        let contenttype = content_type;
        let file_extension = media_file.originalFilename.split(".").pop().toLowerCase();

        if (file_extension == "avif") {
            file_extension = "jpg"
            contenttype = "image/jpeg"
        }

        if (file_extension == "mov") {
            file_extension = "mp4"
            contenttype = "video/mp4"
        }

        const file_name = Math.floor(1000 + Math.random() * 8000) + "_" + Date.now() + "." + file_extension;
        const oldPath = media_file.path;
        const newPath = process.env.BUCKET_ENV + `${folder_name}/` + file_name;

        const fileStream = fs.createReadStream(oldPath);

        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: newPath,
            Body: fileStream,
            ContentType: contenttype,
            ACL: 'private'
        };

        const upload_media_file_into_s3_bucket_params = new PutObjectCommand(params);
        const uploaded_file_res = await s3Client.send(upload_media_file_into_s3_bucket_params);

        if (uploaded_file_res) {
            return { status: true, file_name };
        } else {
            return { status: false, file_name: null };
        }
    } catch (error) {
        console.log("Error from the uploadMediaIntoS3Bucket:", error);
        return { status: false, file_name: null };
    }
};

const removeMediaFromS3Bucket = async (media_file) => {
    try {
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: process.env.BUCKET_ENV + media_file
        };

        const command = new DeleteObjectCommand(params);

        const data = await s3Client.send(command);

        if (data) {
            return { status: true, file_name: null };
        }

    } catch (error) {
        console.error('Error from the removeMediaFromS3Bucket:', error);
        return { status: false, file_name: null };
    }
};

module.exports = {
    uploadMediaIntoS3Bucket,
    removeMediaFromS3Bucket,
};
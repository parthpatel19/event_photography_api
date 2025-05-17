const { S3Client, PutObjectCommand, DeleteObjectsCommand, DeleteObjectCommand, GetObjectCommand } = require("./../utils/modules");

const s3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY
    },
    useAccelerateEndpoint: true,
});

module.exports = {
    s3Client,
    PutObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    DeleteObjectCommand
}
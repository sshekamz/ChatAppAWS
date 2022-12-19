const S3 = require('aws-sdk/clients/s3');

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.IAM_USER_KEY;
const secretAccessKey = process.env.IAM_USER_SECRET;

// intialize instance of s3 object
const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
});

exports.uploadToS3 = (data, filename) => {
    const params = {
        Bucket: bucketName,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    }

    return new Promise((resolve, reject) => {
        s3.upload(params, (err, s3response) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log('success', s3response);
                resolve(s3response.Location);
            }
        })
    })
}
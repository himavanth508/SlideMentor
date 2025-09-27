const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
// console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(storage)),process.env);
module.exports = {
  bucket: storage.bucket(process.env.BUCKET_NAME)
};

const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  newPipeline
} = require('@azure/storage-blob');

const { v4: uuidv4 } = require('uuid');

const containerName = 'images';

const sharedKeyCredential = new StorageSharedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT_NAME,
  process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY);
const pipeline = newPipeline(sharedKeyCredential);
const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  pipeline
);

module.exports = async function (context, req) {
  const base64 = req.body.image.split(',')[1];
  const decode = new Buffer.from(base64,'base64');

  const blobName = uuidv4() + '.jpg';
  const containerClient = blobServiceClient.getContainerClient(containerName);;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(decode, decode.length);
  context.res = {
    body: {
      accountname: process.env.AZURE_STORAGE_ACCOUNT_NAME,
      filename: blobName
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
};

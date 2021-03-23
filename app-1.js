const { MongoClient } = require("mongodb");
const mongodb = require('mongodb');
const fs = require('fs');
const assert = require('assert');

const uri = "mongodb://localhost:27017";

async function execute() {
  const client = new MongoClient(uri);
  await client.connect();
  if (client.err) throw err;
    getAll(client);
    // upload(client)
    // download(client)
  };

async function getAll(client) {
    const database = client.db("upload-medias");
    const chunks =  database.collection('fs.chunks');
    const files =  database.collection('fs.files');
    console.log(chunks,files );
    client.close();
}

async function upload(client) {
    const database = client.db("upload-medias");
    const name = "Mongo File Uploa.mp4"
    var bucket = new mongodb.GridFSBucket(database);
    fs.createReadStream(`./uploads/${name}`).
    pipe(bucket.openUploadStream('Mongo File Uploa.mp4')).
    on('error', function(error) {
      assert.ifError(error);
    }).
    on('finish', function() {
      console.log('Upload file done!');
      process.exit(0);
    });
}

async function download(client) {
  const database = client.db("upload-medias");
  var bucket = new mongodb.GridFSBucket(database);
  const name = "Mongo File Uploa.mp4"
  bucket.openDownloadStreamByName(name).
  pipe(fs.createWriteStream(`./output/${name}`)).
  on('error', function(error) {
    assert.ifError(error);
  }).
  on('finish', function() {
    console.log('download file done!');
    client.close();
  });
}

execute();
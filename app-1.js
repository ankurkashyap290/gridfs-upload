const { MongoClient } = require("mongodb");
const fs = require('fs');
const assert = require('assert');

const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function getAll() {
  try {
    await client.connect();
    const database = client.db("upload-medias");
    const medias = database.collection("medias");
    const mediaList = await medias.find({});
    console.log(mediaList);
  } finally {
    await client.close();
  }
}
getAll().catch(console.dir);

async function upload() {
  try {
    await client.connect();
    const database = client.db("upload-medias");
    var bucket = new mongodb.GridFSBucket(db);

    var writestream = fs.createReadStream('./meistersinger.mp3').
    pipe(bucket.openUploadStream('meistersinger.mp3')).
    on('error', function(error) {
      assert.ifError(error);
    }).
    on('finish', function() {
      fs.createReadStream(__dirname + "/uploads/" + name).pipe(writestream);
      console.log('done!');
      process.exit(0);
    });
    // const medias = database.collection("medias");
    // const newMedia = { name: "Red", town: "kanto" };
    // const result = await medias.insertOne(newMedia);
    // console.log(
    //   `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
    // );
  } finally {
    await client.close();
  }
}
upload().catch(console.dir);

async function download() {
  try {
    await client.connect();
    const database = client.db("upload-medias");
    var bucket = new mongodb.GridFSBucket(db);

    bucket.openDownloadStreamByName('meistersinger.mp3').
    pipe(fs.createWriteStream('./output.mp3')).
    on('error', function(error) {
      assert.ifError(error);
    }).
    on('finish', function() {
      console.log('done!');
      process.exit(0);
    });
  } finally {
    await client.close();
  }
}
download().catch(console.dir);

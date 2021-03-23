const express = require("express");
const app = express();
const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

// Middlewares
app.use(express.json());
app.set("view engine", "ejs");

// DB
const mongoURI = "mongodb://localhost:27017/upload-medias";

// connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// init gfs
let gfs;
conn.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });
});

// For Db Storage
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename =file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({
  storage
});

// For Local Storage
const diskstorage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, path.join(__dirname + '/uploads/'));
  },
  filename: function(req, file, cb) {
      cb(null, file.originalname);
  }
});
const diskupload = multer({ storage: diskstorage });

function fileUpload(req, res, next) {
  upload.single('file')(req, res, next);
  diskupload.single('file')(req, res, next);
  next();
}

// get 
app.get("/", (req, res) => {
  if(!gfs) {
    console.log("some error occured, check connection to db");
    res.send("some error occured, check connection to db");
    process.exit(0);
  }
  gfs.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.render("index", {
        files: false
      });
    } else {
      const f = files
        .map(file => {
          if (
            file.contentType === "image/png" ||
            file.contentType === "image/jpeg"
          ) {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
          return file;
        })
        .sort((a, b) => {
          return (
            new Date(b["uploadDate"]).getTime() -
            new Date(a["uploadDate"]).getTime()
          );
        });

      return res.render("index", {
        files: f
      });
    }

    // return res.json(files);
  });
});

app.post("/upload", fileUpload, async(req, res) => {
  res.redirect("/");
});

app.get("/files", (req, res) => {
  gfs.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "no files exist"
      });
    }
    return res.json(files);
  });
});

app.get("/files/:filename", (req, res) => {
  gfs.find(
    {
      filename: req.params.filename
    },
    (err, file) => {
      if (!file) {
        return res.status(404).json({
          err: "no files exist"
        });
      }

      return res.json(file);
    }
  );
});

app.get("/download/:filename", (req, res) => {
  const file = gfs
    .find({
      filename: req.params.filename
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist"
        });
      }
      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
});

app.post("/files/del/:id", (req, res) => {
  gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
    if (err) return res.status(404).json({ err: err.message });
    res.redirect("/");
  });
});

const port = 5001;

app.listen(port, () => {
  console.log("server started on " + port);
});
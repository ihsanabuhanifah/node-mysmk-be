const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinaryPPDB = require("../config/cloudinary");

const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    cb("Please upload only excel file.", false);
  }
};
const photoFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb("Please upload a valid image file", false);
  }
};
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/public/data/uploads/");
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
  },
});

const ppdbStorage = new CloudinaryStorage({
  cloudinary: cloudinaryPPDB,
  params: {
    folder: "/Home/ppdb",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

var uploadFile = multer({ storage: storage, fileFilter: excelFilter });
const uploadFoto = multer({ storage: ppdbStorage, fileFilter: photoFilter });
module.exports = {
  uploadFile,
  uploadFoto,
};

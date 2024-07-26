const multer = require("multer");
const path = require('path')

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/data/uploads/");
  },
  filename: (req, file, cb) => {

    console.log('file', file)
    const originalExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now()+originalExtension);
  },
});
const upload = multer({ storage: storage });

module.exports = upload;

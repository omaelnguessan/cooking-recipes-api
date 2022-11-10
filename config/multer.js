const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  cb(
    null,
    ["image/png", "image/jpg", "image/jpeg", "image/webp"].includes(
      file.mimetype
    )
  );
};

module.exports = { fileStorage, fileFilter };

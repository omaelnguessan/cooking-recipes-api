const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
const categoryController = require("../controllers/category");

router.get("/", categoryController.getAllCategory);

router.post(
  "/",
  body("name").trim().isLength({ min: 5 }),
  body("description").trim().isLength({ min: 5 }),
  categoryController.createCategory
);

router.get("/:categoryId", categoryController.getCategory);

router.put(
  "/:categoryId",
  body("name").trim().isLength({ min: 5 }),
  body("description").trim().isLength({ min: 5 }),
  categoryController.updateCategory
);

router.delete("/:categoryId", categoryController.deleteCategory);

module.exports = router;

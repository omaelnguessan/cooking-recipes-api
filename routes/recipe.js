const express = require("express");
const { body } = require("express-validator");

const authMiddleware = require("../middleware/auth");
const Category = require("../models/Category");
const recipeController = require("../controllers/recipe");

const router = express.Router();

router.get("/", recipeController.getAllRecipe);

router.post(
  "/",
  body("title").isString().isLength({ min: 3 }),
  body("description").isString().isLength({ min: 3 }),
  body("categoryId")
    .notEmpty()
    .custom((value, { req }) => {
      return Category.findById(value).then((categoryDoc) => {
        if (!categoryDoc) {
          return Promise.reject("Category not found!");
        }
      });
    })
    .withMessage(""),
  authMiddleware,
  recipeController.createRecipe
);

router.get("/:recipeId", recipeController.getRecipe);

router.put("/:recipeId", authMiddleware, recipeController.updateRecipe);

router.delete("/:recipeId", authMiddleware, recipeController.deleteRecipe);

module.exports = router;

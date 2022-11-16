const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");

const { clearImage, clearPath } = require("../helpers/image");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const Category = require("../models/Category");

exports.getAllRecipe = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 100;
  try {
    const totalRecipe = await Recipe.find().countDocuments();
    const recipes = await Recipe.find()
      .populate("category")
      .populate("author")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      message: "Recipes fetched",
      recipes: recipes,
      totalRecipe: totalRecipe,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getRecipe = async (req, res, next) => {
  const { recipeId } = req.params;

  try {
    const recipe = await Recipe.findById(recipeId)
      .populate("category")
      .populate("author");

    if (!recipe) {
      const error = new Error(`Recipe with id ${recipeId} Not found`);
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Categorie fetch",
      recipe: { ...recipe._doc, _id: recipe._id.toString() },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createRecipe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("validation failed, entered data is incorrect.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    if (!req.file) {
      const error = new Error("Invalid or missing image.");
      error.statusCode = 422;
      throw error;
    }

    const { title, description, ingredients, steps, categoryId } = req.body;

    const categorie = await Category.findById(categoryId);
    if (!categorie) {
      const error = new Error("Category not found.");
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("Unauthorized .");
      error.statusCode = 401;
      throw error;
    }

    if (!req.file) {
      const error = new Error("Category not found.");
      error.statusCode = 422;
      throw error;
    }

    const imageUrl = clearPath(req.file.path);

    const ingredientList = ingredients.map((item) => {
      return { name: item };
    });

    const stepsList = steps.map((step) => {
      return { num: step.num, name: step.name };
    });

    const recipe = new Recipe({
      title: title,
      description: description,
      steps: stepsList,
      imageUrl: imageUrl,
      ingredients: ingredientList,
      category: categorie._id,
      author: req.userId,
    });

    await recipe.save();

    categorie.recipes.push(recipe);

    await categorie.save();

    user.recipes.push(recipe);

    await user.save();

    return res.json({
      message: "Recipe add success",
      recipe: { ...recipe._doc, author: { _id: user._id, name: user.name } },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateRecipe = async (req, res, next) => {
  const { recipeId } = req.params;
  const errors = validationResult(req);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("validation failed, entered data is incorrect.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const { title, description, ingredients, steps } = req.body;
    let imageUrl = req.body.image;
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      const error = new Error(`Recipe with id ${recipeId} Not found`);
      error.statusCode = 404;
      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user || req.userId.toString() !== recipe.author._id.toString()) {
      const error = new Error("Unauthorized .");
      error.statusCode = 401;
      throw error;
    }

    if (req.file) {
      imageUrl = clearPath(req.file.path);
    }

    if (!imageUrl) {
      const error = new Error("No file picked");
      error.statusCode = 422;
      throw error;
    }

    const ingredientList = ingredients.map((item) => {
      return { name: item };
    });

    const stepsList = steps.map((step) => {
      return { num: step.num, name: step.name };
    });

    recipe.title = title;
    recipe.description = description;
    recipe.steps = stepsList;
    recipe.ingredients = ingredientList;
    recipe.imageUrl = imageUrl;

    await recipe.save();

    res.json({
      message: "Recipe updated successfully!",
      recipe: {
        ...recipe._doc,
        author: { _id: user._id.toString(), name: user.name },
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deleteRecipe = async (req, res, next) => {
  const { recipeId } = req.params;

  try {
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      const error = new Error(`Recipe with id ${recipeId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (recipe.author._id.toString() !== req.userId.toString()) {
      const error = new Error("Unauthorized.");
      error.statusCode = 401;
      throw error;
    }

    const categorie = await Category.findById(recipe.category._id);
    if (!categorie) {
      const error = new Error("Category not found.");
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("Unauthorized.");
      error.statusCode = 401;
      throw error;
    }

    await recipe.deleteOne();

    categorie.recipes.pull(recipeId);
    await categorie.save();

    user.recipes.pull(recipeId);
    await user.save();

    res.status(200).json({
      message: "recipe deleted successfully",
      recipe: { ...recipe._doc },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

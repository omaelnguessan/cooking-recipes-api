const { validationResult } = require("express-validator");
const Category = require("../models/Category");

/**
 * get all category with paginate
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * @returns Category[]
 */
exports.getAllCategory = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 100;
  try {
    const totalCategory = await Category.find().countDocuments();
    const category = await Category.find()
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      message: "Category fetched",
      category: category,
      totalCategory: totalCategory,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }

    const { name, description } = req.body;

    const category = new Category({
      name: name,
      description: description,
      recipes: [],
    });

    await category.save();

    res.status(201).json({
      message: "Category created successfully",
      category: { ...category._doc, _id: category._id.toString() },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      const error = new Error(`Category with id ${categoryId} Not found`);
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Categorie fetch",
      category: { ...category._doc, _id: category._id.toString() },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const { name, description } = req.body;

  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      const error = new Error(`Category with id ${categoryId} Not found`);
      error.statusCode = 404;
      throw error;
    }

    category.name = name;
    category.description = description;
    await category.save();

    res.status(200).json({
      message: "Category update successfully",
      category: { ...category._doc, _id: category._id.toString() },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      const error = new Error(`Category with id ${categoryId} Not found`);
      error.statusCode = 404;
      throw error;
    }
    const deleteCategory = await category.deleteOne();
    res
      .status(204)
      .json({ message: "Category deleted!", category: deleteCategory });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

import Category from "../models/category.model.js";
import { AppError, catchAsync } from "../../../../utils/errorHandling.js";

//===========================================
// Public Routes
//===========================================

// Get All Categories (Public)
export const getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ isActive: true });

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: categories,
  });
});

// Get Category By ID (Public)
export const getCategoryById = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({
    _id: req.params.id,
    isActive: true,
  });

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: category,
  });
});

//===========================================
// Admin Routes
//===========================================

// Create Category (Admin)
export const createCategory = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  // Handle file upload
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const category = await Category.create({
    name,
    description,
    image,
  });

  res.status(201).json({
    status: "success",
    data: category,
  });
});

// Update Category (Admin)
export const updateCategory = catchAsync(async (req, res, next) => {
  const { name, description, isActive } = req.body;

  // Handle file upload
  let updateData = { name, description, isActive };

  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: category,
  });
});

// Delete Category (Admin)
export const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

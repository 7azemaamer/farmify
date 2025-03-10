import Product from "../models/product.model.js";
import Category from "../../category/models/category.model.js";
import Warehouse from "../../../warehouse/models/warehouse.model.js";
import { AppError, catchAsync } from "../../../../utils/errorHandling.js";

//===========================================
// Public Routes
//===========================================

// Get All Products (Public)
export const getAllProducts = catchAsync(async (req, res, next) => {
  const { category, minPrice, maxPrice, sort } = req.query;

  // Build filter object
  const filter = { isAvailable: true };

  if (category) {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Build sort object
  let sortOption = {};

  if (sort) {
    switch (sort) {
      case "price-asc":
        sortOption = { price: 1 };
        break;
      case "price-desc":
        sortOption = { price: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "rating":
        sortOption = { averageRating: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
  } else {
    sortOption = { createdAt: -1 };
  }

  const products = await Product.find(filter)
    .sort(sortOption)
    .populate("category", "name")
    .populate("warehouse", "name location");

  res.status(200).json({
    status: "success",
    results: products.length,
    data: products,
  });
});

// Get Product By ID (Public)
export const getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isAvailable: true,
  })
    .populate("category", "name")
    .populate("warehouse", "name location");

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: product,
  });
});

// Get Products By Category (Public)
export const getProductsByCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  // Check if category exists
  const category = await Category.findById(categoryId);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  const products = await Product.find({
    category: categoryId,
    isAvailable: true,
  })
    .populate("category", "name")
    .populate("warehouse", "name location");

  res.status(200).json({
    status: "success",
    results: products.length,
    data: products,
  });
});

// Search Products (Public)
export const searchProducts = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new AppError("Search query is required", 400));
  }

  const products = await Product.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
    isAvailable: true,
  })
    .populate("category", "name")
    .populate("warehouse", "name location");

  res.status(200).json({
    status: "success",
    results: products.length,
    data: products,
  });
});

//===========================================
// User Routes
//===========================================

// Add Product Rating (User)
export const addProductRating = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;
  const { id } = req.params;
  const userId = req.user._id;

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError("Rating must be between 1 and 5", 400));
  }

  const product = await Product.findById(id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Check if user already rated this product
  const existingRatingIndex = product.ratings.findIndex(
    (r) => r.user.toString() === userId.toString()
  );

  if (existingRatingIndex !== -1) {
    // Update existing rating
    product.ratings[existingRatingIndex].rating = rating;
    product.ratings[existingRatingIndex].review =
      review || product.ratings[existingRatingIndex].review;
    product.ratings[existingRatingIndex].date = Date.now();
  } else {
    // Add new rating
    product.ratings.push({
      user: userId,
      rating,
      review,
      date: Date.now(),
    });
  }

  // Calculate average rating
  const totalRating = product.ratings.reduce(
    (sum, item) => sum + item.rating,
    0
  );
  product.averageRating = totalRating / product.ratings.length;

  await product.save();

  res.status(200).json({
    status: "success",
    data: {
      averageRating: product.averageRating,
      totalRatings: product.ratings.length,
    },
  });
});

//===========================================
// Admin Routes
//===========================================

// Create Product (Admin)
export const createProduct = catchAsync(async (req, res, next) => {
  const { role, _id } = req.user;

  const { name, description, price, category, inStock, warehouse } = req.body;

  // Handle file uploads
  const images = req.files
    ? req.files.map((file) => `/uploads/${file.filename}`)
    : [];

  // Check if warehouse exists and admin has access
  let warehouseDoc;
  console.log(warehouse);
  if (role === "superAdmin") {
    warehouseDoc = await Warehouse.findById(warehouse);
  } else {
    // warehouseAdmin can only add products to their own warehouse
    warehouseDoc = await Warehouse.findOne({ _id: warehouse, admin: _id });
  }
  console.log(warehouseDoc);

  if (!warehouseDoc) {
    return next(
      new AppError("Warehouse not found or you don't have access", 404)
    );
  }

  // Check if category exists
  const categoryDoc = await Category.findById(category);

  if (!categoryDoc) {
    return next(new AppError("Category not found", 404));
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    images,
    inStock,
    warehouse,
  });

  res.status(201).json({
    status: "success",
    data: product,
  });
});

// Update Product (Admin)
export const updateProduct = catchAsync(async (req, res, next) => {
  const { role, _id } = req.user;

  const { name, description, price, category, inStock, isAvailable } = req.body;

  // Handle file uploads
  let updateData = { name, description, price, category, inStock, isAvailable };

  // Add new images if provided
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => `/uploads/${file.filename}`);

    // Get existing product to append images
    const existingProduct = await Product.findById(req.params.id);
    if (existingProduct) {
      updateData.images = [...(existingProduct.images || []), ...newImages];
    } else {
      updateData.images = newImages;
    }
  }

  let product;

  if (role === "superAdmin") {
    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name")
      .populate("warehouse", "name location");
  } else if (role === "warehouseAdmin") {
    // Get the warehouse managed by this admin
    const warehouse = await Warehouse.findOne({ admin: _id });

    if (!warehouse) {
      return next(new AppError("Warehouse not found for this admin", 404));
    }

    product = await Product.findOneAndUpdate(
      { _id: req.params.id, warehouse: warehouse._id },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("category", "name")
      .populate("warehouse", "name location");
  } else {
    return next(
      new AppError("You don't have permission to access this resource", 403)
    );
  }

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: product,
  });
});

// Delete Product (Admin)
export const deleteProduct = catchAsync(async (req, res, next) => {
  const { role, _id } = req.user;

  let product;

  if (role === "superAdmin") {
    product = await Product.findByIdAndDelete(req.params.id);
  } else if (role === "warehouseAdmin") {
    // Get the warehouse managed by this admin
    const warehouse = await Warehouse.findOne({ admin: _id });

    if (!warehouse) {
      return next(new AppError("Warehouse not found for this admin", 404));
    }

    product = await Product.findOneAndDelete({
      _id: req.params.id,
      warehouse: warehouse._id,
    });
  } else {
    return next(
      new AppError("You don't have permission to access this resource", 403)
    );
  }

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

import Equipment from "../models/equipment.model.js";
import Warehouse from "../../warehouse/models/warehouse.model.js";
import { AppError, catchAsync } from "../../../utils/errorHandling.js";

//===========================================
// Public Routes
//===========================================

// Get All Equipments (Public)
export const getAllEquipments = catchAsync(async (req, res, next) => {
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
      default:
        sortOption = { createdAt: -1 };
    }
  } else {
    sortOption = { createdAt: -1 };
  }

  const equipments = await Equipment.find(filter)
    .sort(sortOption)
    .populate("warehouse", "name location");

  res.status(200).json({
    status: "success",
    results: equipments.length,
    data: equipments,
  });
});

// Get Equipment By ID (Public)
export const getEquipmentById = catchAsync(async (req, res, next) => {
  const equipment = await Equipment.findOne({
    _id: req.params.id,
    isAvailable: true,
  }).populate("warehouse", "name location");

  if (!equipment) {
    return next(new AppError("Equipment not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: equipment,
  });
});

// Get Equipments By Category (Public)
export const getEquipmentsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;

  const equipments = await Equipment.find({
    category,
    isAvailable: true,
  }).populate("warehouse", "name location");

  res.status(200).json({
    status: "success",
    results: equipments.length,
    data: equipments,
  });
});

// Search Equipments (Public)
export const searchEquipments = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return next(new AppError("Search query is required", 400));
  }

  const equipments = await Equipment.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { manufacturer: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } },
    ],
    isAvailable: true,
  }).populate("warehouse", "name location");

  res.status(200).json({
    status: "success",
    results: equipments.length,
    data: equipments,
  });
});

//===========================================
// Admin Routes
//===========================================

// Create Equipment (Admin)
export const createEquipment = catchAsync(async (req, res, next) => {
  const { role, _id } = req.user;

  const {
    name,
    description,
    price,
    category,
    manufacturer,
    inStock,
    specifications,
    warehouseId,
  } = req.body;

  // Handle file uploads
  const images = req.files
    ? req.files.map((file) => `/uploads/${file.filename}`)
    : [];

  let warehouse;

  if (role === "superAdmin") {
    warehouse = await Warehouse.findById(warehouseId);
  } else {
    // warehouseAdmin can only add equipment to their own warehouse
    warehouse = await Warehouse.findOne({ _id: warehouseId, admin: _id });
  }

  if (!warehouse) {
    return next(new AppError("Warehouse not found", 404));
  }

  const equipment = await Equipment.create({
    name,
    description,
    price,
    category,
    manufacturer,
    inStock,
    images,
    specifications,
    warehouse: warehouseId,
  });

  res.status(201).json({
    status: "success",
    data: equipment,
  });
});

// Update Equipment (Admin)
export const updateEquipment = catchAsync(async (req, res, next) => {
  const { role, _id } = req.user;

  const {
    name,
    description,
    price,
    category,
    manufacturer,
    inStock,
    specifications,
    isAvailable,
  } = req.body;

  // Handle file uploads
  let updateData = {
    name,
    description,
    price,
    category,
    manufacturer,
    inStock,
    specifications,
    isAvailable,
  };

  // Add new images if provided
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => `/uploads/${file.filename}`);

    // Get existing equipment to append images
    const existingEquipment = await Equipment.findById(req.params.id);
    if (existingEquipment) {
      updateData.images = [...(existingEquipment.images || []), ...newImages];
    } else {
      updateData.images = newImages;
    }
  }

  let equipment;

  if (role === "superAdmin") {
    equipment = await Equipment.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("warehouse", "name location");
  } else if (role === "warehouseAdmin") {
    // Get the warehouse managed by this admin
    const warehouse = await Warehouse.findOne({ admin: _id });

    if (!warehouse) {
      return next(new AppError("Warehouse not found for this admin", 404));
    }

    equipment = await Equipment.findOneAndUpdate(
      { _id: req.params.id, warehouse: warehouse._id },
      updateData,
      { new: true, runValidators: true }
    ).populate("warehouse", "name location");
  } else {
    return next(
      new AppError("You don't have permission to access this resource", 403)
    );
  }

  if (!equipment) {
    return next(new AppError("Equipment not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: equipment,
  });
});

// Delete Equipment (Admin)
export const deleteEquipment = catchAsync(async (req, res, next) => {
  const { role, _id } = req.user;

  let equipment;

  if (role === "superAdmin") {
    equipment = await Equipment.findByIdAndDelete(req.params.id);
  } else if (role === "warehouseAdmin") {
    // Get the warehouse managed by this admin
    const warehouse = await Warehouse.findOne({ admin: _id });

    if (!warehouse) {
      return next(new AppError("Warehouse not found for this admin", 404));
    }

    equipment = await Equipment.findOneAndDelete({
      _id: req.params.id,
      warehouse: warehouse._id,
    });
  } else {
    return next(
      new AppError("You don't have permission to access this resource", 403)
    );
  }

  if (!equipment) {
    return next(new AppError("Equipment not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

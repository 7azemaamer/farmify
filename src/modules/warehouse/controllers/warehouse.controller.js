import User from "../../user/models/user.model.js";
import Warehouse from "../models/warehouse.model.js";
import { AppError, catchAsync } from "../../../utils/errorHandling.js";

//===========================================
// Public Routes
//===========================================

// Get All Warehouses (Public)
export const getAllWarehouses = catchAsync(async (req, res, next) => {
  const warehouses = await Warehouse.find({ isActive: true })
    .select("name location capacity image")
    .populate("admin", "firstName lastName");

  res.status(200).json({
    status: "success",
    results: warehouses.length,
    data: warehouses,
  });
});

// Get Warehouse By ID (Public)
export const getWarehouseById = catchAsync(async (req, res, next) => {
  const warehouse = await Warehouse.findOne({
    _id: req.params.id,
    isActive: true,
  })
    .select("name location capacity")
    .populate("admin", "firstName lastName");

  if (!warehouse) {
    return next(new AppError("Warehouse not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: warehouse,
  });
});

//===========================================
// Admin Routes
//===========================================

// Create Warehouse (Admin)
export const createWarehouse = catchAsync(async (req, res, next) => {
  if (req.user.role !== "superAdmin") {
    return next(
      new AppError("You don't have permission to access this resource", 403)
    );
  }

  const { name, location, capacity, adminId } = req.body;

  // Handle file upload
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  // Check if admin exists and is a warehouseAdmin
  const admin = await User.findById(adminId);

  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  if (admin.role !== "warehouseAdmin") {
    return next(new AppError("User must be a warehouse admin", 400));
  }

  // Check if admin already manages a warehouse
  const existingWarehouse = await Warehouse.findOne({ admin: adminId });

  if (existingWarehouse) {
    return next(new AppError("This admin already manages a warehouse", 400));
  }

  const warehouse = await Warehouse.create({
    name,
    location,
    capacity,
    admin: adminId,
    image,
  });

  res.status(201).json({
    status: "success",
    data: warehouse,
  });
});

// Update Warehouse (Admin)
export const updateWarehouse = catchAsync(async (req, res, next) => {
  const { role, _id } = req.user;

  // Check permissions
  if (role !== "superAdmin" && role !== "warehouseAdmin") {
    return next(
      new AppError("You don't have permission to access this resource", 403)
    );
  }

  const { name, location, capacity, isActive } = req.body;

  // Handle file upload
  let updateData = { name, location, capacity, isActive };

  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }

  let warehouse;

  if (role === "superAdmin") {
    warehouse = await Warehouse.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("admin", "firstName lastName email");
  } else {
    // warehouseAdmin can only update their own warehouse
    warehouse = await Warehouse.findOneAndUpdate(
      { _id: req.params.id, admin: _id },
      updateData,
      { new: true, runValidators: true }
    ).populate("admin", "firstName lastName email");
  }

  if (!warehouse) {
    return next(new AppError("Warehouse not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: warehouse,
  });
});

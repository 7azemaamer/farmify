import User from "../../user/models/user.model.js";
import Warehouse from "../../warehouse/models/warehouse.model.js";
import Equipment from "../../equipment/models/equipment.model.js";
import { AppError, catchAsync } from "../../../utils/errorHandling.js";

//===========================================
// Dashboard Stats
//===========================================
export const getDashboardStats = catchAsync(async (req, res, next) => {
  const { role, _id } = req.user;

  let stats = {};

  // For superAdmin, get all stats
  if (role === "superAdmin") {
    const usersCount = await User.countDocuments();
    const warehousesCount = await Warehouse.countDocuments();
    const equipmentsCount = await Equipment.countDocuments();

    stats = {
      usersCount,
      warehousesCount,
      equipmentsCount,
    };
  }
  // For warehouseAdmin, get only their warehouse stats
  else if (role === "warehouseAdmin") {
    const warehouse = await Warehouse.findOne({ admin: _id });

    if (!warehouse) {
      return next(new AppError("Warehouse not found for this admin", 404));
    }

    const equipmentsCount = await Equipment.countDocuments({
      warehouse: warehouse._id,
    });

    stats = {
      warehouseId: warehouse._id,
      warehouseName: warehouse.name,
      equipmentsCount,
    };
  } else {
    return next(
      new AppError("You don't have permission to access dashboard", 403)
    );
  }

  res.status(200).json({
    status: "success",
    data: stats,
  });
});

//===========================================
// User Management
//===========================================
export const getAllUsers = catchAsync(async (req, res, next) => {
  if (req.user.role !== "superAdmin") {
    return next(
      new AppError("You don't have permission to access this resource", 403)
    );
  }

  const users = await User.find().select("-password -otp -otpExpiresAt");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users,
  });
});

export const getUserById = catchAsync(async (req, res, next) => {
  if (req.user.role !== "superAdmin") {
    return next(
      new AppError("You don't have permission to access this resource", 403)
    );
  }

  const user = await User.findById(req.params.id).select(
    "-password -otp -otpExpiresAt"
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

export const updateUserRole = catchAsync(async (req, res, next) => {
  if (req.user.role !== "superAdmin") {
    return next(
      new AppError("You don't have permission to access this resource", 403)
    );
  }

  const { role } = req.body;

  if (!role || !["user", "warehouseAdmin", "superAdmin"].includes(role)) {
    return next(new AppError("Invalid role", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select("-password -otp -otpExpiresAt");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

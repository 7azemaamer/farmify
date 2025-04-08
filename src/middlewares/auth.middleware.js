import User from "../modules/user/models/user.model.js";
import { AppError, catchAsync } from "../utils/errorHandling.js";
import jwt from "jsonwebtoken";

// Basic authentication - just checks if user exists and token is valid
export const authenticate = catchAsync(async (req, res, next) => {
  //1- get token from headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //2- check if token not provided
  if (!token) {
    return next(new AppError("Not Authorized, no token provided.", 401));
  }

  //3- verify token by checking the user id exists
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded?.id).select("-password");
  if (!user) {
    return next(new AppError("Not Authorized, user not registered", 401));
  }

  req.user = user;
  next();
});

// Check if user is verified
export const requireVerification = catchAsync(async (req, res, next) => {
  if (!req.user.isVerified) {
    return next(
      new AppError("User account not verified, please verify it", 403)
    );
  }
  next();
});

export const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to access this resource", 403)
      );
    }
    next();
  };
};

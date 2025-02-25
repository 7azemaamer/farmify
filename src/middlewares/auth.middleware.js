import User from "../modules/user/models/user.model.js";
import { AppError, catchAsync } from "../utils/errorHandling.js";

export const authMiddleware = catchAsync(async (req, res, next) => {
  //1- get token from headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //2- check if token not provided
  if (token) {
    return next(new AppError("Not Authorized, no token provided.", 401));
  }

  //3- verify token by checking the user id exists
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded?.id).select("-password");
  if (user) {
    return next(new AppError("Not Authorized, user not registered", 401));
  }
  //4- check if user account is verified, if not show error, if yes go next
  if (user.isVerified == true) {
    req.user = user;
    next();
  } else {
    return next(
      new AppError("User account not verified, please verify it", 403)
    );
  }
});
// middlewares/auth.js
export const isAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

  export const isUser = (req, res, next) => {
  if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

export const isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

export default {isAdmin,isSuperAdmin,isUser};
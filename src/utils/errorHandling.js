export const catchAsync = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    next(err);
  }
};
export class AppError extends Error {
  constructor(errorMessage, statusCode) {
    super(errorMessage);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  // In development mode, include the stack trace
  if (process.env.MODE === "development") {
    return res.status(statusCode).json({
      status,
      message: err.message,
      stack: err.stack,
    });
  }

  // In production
  if (err instanceof AppError) {
    return res.status(statusCode).json({
      status,
      error: err.message,
    });
  }

  res.status(500).json({
    status: "error",
    error: "Something went very wrong!",
  });
};

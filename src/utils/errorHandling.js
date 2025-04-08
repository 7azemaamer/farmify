export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      console.error("Async Error:", {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
      });
      next(err);
    });
  };
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  // Log the error
  console.error("Error Handler:", {
    statusCode,
    status,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    headers: req.headers,
  });

  // In development mode, include the stack trace
  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // In production
  if (err instanceof AppError) {
    return res.status(statusCode).json({
      status,
      error: err.message,
    });
  }

  return res.status(500).json({
    status: "error",
    error: "Something went very wrong!",
  });
};

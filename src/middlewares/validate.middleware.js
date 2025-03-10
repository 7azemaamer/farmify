import { AppError } from "../utils/errorHandling.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return next(new AppError(errorMessages.join(", "), 400));
    }

    next();
  };
};

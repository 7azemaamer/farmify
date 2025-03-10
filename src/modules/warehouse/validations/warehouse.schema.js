import Joi from "joi";

export const createWarehouseSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Warehouse name is required",
    "any.required": "Warehouse name is required",
  }),
  location: Joi.string().required().messages({
    "string.empty": "Warehouse location is required",
    "any.required": "Warehouse location is required",
  }),
  capacity: Joi.number().positive().required().messages({
    "number.base": "Warehouse capacity must be a number",
    "number.positive": "Warehouse capacity must be a positive number",
    "any.required": "Warehouse capacity is required",
  }),
  adminId: Joi.string().required().messages({
    "string.empty": "Admin ID is required",
    "any.required": "Admin ID is required",
  }),
});

export const updateWarehouseSchema = Joi.object({
  name: Joi.string().messages({
    "string.empty": "Warehouse name cannot be empty",
  }),
  location: Joi.string().messages({
    "string.empty": "Warehouse location cannot be empty",
  }),
  capacity: Joi.number().positive().messages({
    "number.base": "Warehouse capacity must be a number",
    "number.positive": "Warehouse capacity must be a positive number",
  }),
  isActive: Joi.boolean(),
});

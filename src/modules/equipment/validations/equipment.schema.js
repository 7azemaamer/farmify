import Joi from "joi";

export const createEquipmentSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Equipment name is required",
    "any.required": "Equipment name is required",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Equipment description is required",
    "any.required": "Equipment description is required",
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Equipment price must be a number",
    "number.positive": "Equipment price must be a positive number",
    "any.required": "Equipment price is required",
  }),
  category: Joi.string().required().messages({
    "string.empty": "Equipment category is required",
    "any.required": "Equipment category is required",
  }),
  manufacturer: Joi.string().required().messages({
    "string.empty": "Equipment manufacturer is required",
    "any.required": "Equipment manufacturer is required",
  }),
  inStock: Joi.number().min(0).default(0).messages({
    "number.base": "In stock quantity must be a number",
    "number.min": "In stock quantity cannot be negative",
  }),
  specifications: Joi.object(),
  warehouseId: Joi.string().required().messages({
    "string.empty": "Warehouse ID is required",
    "any.required": "Warehouse ID is required",
  }),
});

export const updateEquipmentSchema = Joi.object({
  name: Joi.string().messages({
    "string.empty": "Equipment name cannot be empty",
  }),
  description: Joi.string().messages({
    "string.empty": "Equipment description cannot be empty",
  }),
  price: Joi.number().positive().messages({
    "number.base": "Equipment price must be a number",
    "number.positive": "Equipment price must be a positive number",
  }),
  category: Joi.string().messages({
    "string.empty": "Equipment category cannot be empty",
  }),
  manufacturer: Joi.string().messages({
    "string.empty": "Equipment manufacturer cannot be empty",
  }),
  inStock: Joi.number().min(0).messages({
    "number.base": "In stock quantity must be a number",
    "number.min": "In stock quantity cannot be negative",
  }),
  specifications: Joi.object(),
  isAvailable: Joi.boolean(),
});

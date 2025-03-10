import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Product name is required",
    "any.required": "Product name is required",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Product description is required",
    "any.required": "Product description is required",
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Product price must be a number",
    "number.positive": "Product price must be a positive number",
    "any.required": "Product price is required",
  }),
  category: Joi.string().required().messages({
    "string.empty": "Product category is required",
    "any.required": "Product category is required",
  }),
  images: Joi.array().items(Joi.string()),
  inStock: Joi.number().min(0).default(0).messages({
    "number.base": "In stock quantity must be a number",
    "number.min": "In stock quantity cannot be negative",
  }),
  warehouse: Joi.string().required().messages({
    "string.empty": "Warehouse ID is required",
    "any.required": "Warehouse ID is required",
  }),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().messages({
    "string.empty": "Product name cannot be empty",
  }),
  description: Joi.string().messages({
    "string.empty": "Product description cannot be empty",
  }),
  price: Joi.number().positive().messages({
    "number.base": "Product price must be a number",
    "number.positive": "Product price must be a positive number",
  }),
  category: Joi.string().messages({
    "string.empty": "Product category cannot be empty",
  }),
  images: Joi.array().items(Joi.string()),
  inStock: Joi.number().min(0).messages({
    "number.base": "In stock quantity must be a number",
    "number.min": "In stock quantity cannot be negative",
  }),
  isAvailable: Joi.boolean(),
});

import Joi from "joi";

export const createCategorySchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Category name is required",
    "any.required": "Category name is required",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Category description is required",
    "any.required": "Category description is required",
  }),
  image: Joi.string().messages({
    "string.empty": "Category image cannot be empty",
  }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().messages({
    "string.empty": "Category name cannot be empty",
  }),
  description: Joi.string().messages({
    "string.empty": "Category description cannot be empty",
  }),
  image: Joi.string().messages({
    "string.empty": "Category image cannot be empty",
  }),
  isActive: Joi.boolean(),
});

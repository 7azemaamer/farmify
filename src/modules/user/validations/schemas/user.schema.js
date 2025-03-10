import Joi from "joi";

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().messages({
    "string.empty": "First name cannot be empty",
  }),
  lastName: Joi.string().messages({
    "string.empty": "Last name cannot be empty",
  }),
  phone: Joi.string().messages({
    "string.empty": "Phone number cannot be empty",
  }),
  country: Joi.string().messages({
    "string.empty": "Country cannot be empty",
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required",
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string().min(8).required().messages({
    "string.empty": "New password is required",
    "string.min": "New password must be at least 8 characters long",
    "any.required": "New password is required",
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "string.empty": "Confirm password is required",
      "any.only": "Passwords do not match",
      "any.required": "Confirm password is required",
    }),
});

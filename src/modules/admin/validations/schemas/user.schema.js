import Joi from "joi";

export const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid("user", "warehouseAdmin", "superAdmin")
    .required()
    .messages({
      "string.empty": "Role is required",
      "any.required": "Role is required",
      "any.only": "Role must be one of: user, warehouseAdmin, superAdmin",
    }),
});

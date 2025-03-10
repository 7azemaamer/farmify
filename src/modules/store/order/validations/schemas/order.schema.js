import Joi from "joi";

export const createOrderSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required().messages({
          "string.empty": "Product ID is required",
          "any.required": "Product ID is required",
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          "number.base": "Quantity must be a number",
          "number.integer": "Quantity must be an integer",
          "number.min": "Quantity must be at least 1",
          "any.required": "Quantity is required",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one product is required",
      "any.required": "Products are required",
    }),
  shippingAddress: Joi.object({
    address: Joi.string().required().messages({
      "string.empty": "Address is required",
      "any.required": "Address is required",
    }),
    city: Joi.string().required().messages({
      "string.empty": "City is required",
      "any.required": "City is required",
    }),
    postalCode: Joi.string().required().messages({
      "string.empty": "Postal code is required",
      "any.required": "Postal code is required",
    }),
    country: Joi.string().required().messages({
      "string.empty": "Country is required",
      "any.required": "Country is required",
    }),
  })
    .required()
    .messages({
      "any.required": "Shipping address is required",
    }),
  paymentMethod: Joi.string()
    .valid("stripe", "cashOnDelivery")
    .required()
    .messages({
      "string.empty": "Payment method is required",
      "any.required": "Payment method is required",
      "any.only": "Payment method must be one of: stripe, cashOnDelivery",
    }),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .required()
    .messages({
      "string.empty": "Status is required",
      "any.required": "Status is required",
      "any.only":
        "Status must be one of: pending, processing, shipped, delivered, cancelled",
    }),
});

import Cart from "../models/cart.model.js";
import Product from "../../product/models/product.model.js";
import { AppError, catchAsync } from "../../../../utils/errorHandling.js";

//===========================================
// Get User Cart
//===========================================
export const getUserCart = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name price images inStock isAvailable",
  });

  if (!cart) {
    // Create a new cart if it doesn't exist
    cart = await Cart.create({
      user: userId,
      items: [],
      totalPrice: 0,
    });
  }

  res.status(200).json({
    status: "success",
    data: cart,
  });
});

//===========================================
// Add Item to Cart
//===========================================
export const addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  // Check if product exists and is available
  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (!product.isAvailable) {
    return next(new AppError("Product is not available", 400));
  }

  if (product.inStock < quantity) {
    return next(
      new AppError(`Insufficient stock. Available: ${product.inStock}`, 400)
    );
  }

  // Find user's cart or create a new one
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      totalPrice: 0,
    });
  }

  // Check if product already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex !== -1) {
    // Update quantity if product already in cart
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
    });
  }

  // Calculate total price
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  await cart.save();

  // Populate product details
  await cart.populate({
    path: "items.product",
    select: "name price images inStock isAvailable",
  });

  res.status(200).json({
    status: "success",
    data: cart,
  });
});

//===========================================
// Update Cart Item
//===========================================
export const updateCartItem = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const { itemId } = req.params;
  const userId = req.user._id;

  // Find user's cart
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Find the item in the cart
  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return next(new AppError("Item not found in cart", 404));
  }

  // Check product stock
  const product = await Product.findById(cart.items[itemIndex].product);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (!product.isAvailable) {
    return next(new AppError("Product is not available", 400));
  }

  if (product.inStock < quantity) {
    return next(
      new AppError(`Insufficient stock. Available: ${product.inStock}`, 400)
    );
  }

  // Update item quantity
  cart.items[itemIndex].quantity = quantity;

  // Recalculate total price
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  await cart.save();

  // Populate product details
  await cart.populate({
    path: "items.product",
    select: "name price images inStock isAvailable",
  });

  res.status(200).json({
    status: "success",
    data: cart,
  });
});

//===========================================
// Remove Item from Cart
//===========================================
export const removeCartItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  // Find user's cart
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Find the item in the cart
  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return next(new AppError("Item not found in cart", 404));
  }

  // Remove item from cart
  cart.items.splice(itemIndex, 1);

  // Recalculate total price
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  await cart.save();

  // Populate product details
  await cart.populate({
    path: "items.product",
    select: "name price images inStock isAvailable",
  });

  res.status(200).json({
    status: "success",
    data: cart,
  });
});

//===========================================
// Clear Cart
//===========================================
export const clearCart = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // Find user's cart
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Clear cart items
  cart.items = [];
  cart.totalPrice = 0;

  await cart.save();

  res.status(200).json({
    status: "success",
    data: cart,
  });
});

import Order from "../models/order.model.js";
import Product from "../../product/models/product.model.js";
import Cart from "../../cart/models/cart.model.js";
import { AppError, catchAsync } from "../../../../utils/errorHandling.js";

//===========================================
// Create Order
//===========================================
export const createOrder = catchAsync(async (req, res, next) => {
  const { products: productItems, shippingAddress, paymentMethod } = req.body;
  const userId = req.user._id;

  if (!productItems || !productItems.length) {
    return next(new AppError("No products provided for the order", 400));
  }

  // Prepare order items with calculated prices
  const orderItems = [];
  let totalPrice = 0;

  // Check if products are available and have sufficient stock
  for (const item of productItems) {
    const { productId, quantity } = item;

    if (!productId) {
      return next(new AppError("Product ID is required for each item", 400));
    }

    if (!quantity || quantity <= 0) {
      return next(
        new AppError(`Invalid quantity for product ${productId}`, 400)
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      return next(new AppError(`Product with ID ${productId} not found`, 404));
    }

    if (!product.isAvailable) {
      return next(
        new AppError(`Product ${product.name} is not available`, 400)
      );
    }

    if (product.inStock < quantity) {
      return next(
        new AppError(
          `Insufficient stock for ${product.name}. Available: ${product.inStock}`,
          400
        )
      );
    }

    // Calculate item price based on product price
    const itemPrice = product.price;
    const itemTotal = itemPrice * quantity;

    // Add to order items
    orderItems.push({
      product: productId,
      quantity,
      price: itemPrice,
    });

    // Add to total price
    totalPrice += itemTotal;
  }

  // Create the order with calculated prices
  const order = await Order.create({
    user: userId,
    products: orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    status: "pending",
  });

  // Update product stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { inStock: -item.quantity },
    });
  }

  // Clear user's cart
  await Cart.findOneAndUpdate({ user: userId }, { items: [], totalPrice: 0 });

  res.status(201).json({
    status: "success",
    data: order,
  });
});

//===========================================
// Get User Orders
//===========================================
export const getUserOrders = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "products.product",
      select: "name price images",
    });

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: orders,
  });
});

//===========================================
// Get Order By ID
//===========================================
export const getOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const order = await Order.findOne({ _id: id, user: userId }).populate({
    path: "products.product",
    select: "name price images",
  });

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: order,
  });
});

//===========================================
// Cancel Order
//===========================================
export const cancelOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const order = await Order.findOne({ _id: id, user: userId });

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Only pending orders can be cancelled
  if (order.status !== "pending") {
    return next(
      new AppError(`Cannot cancel order with status: ${order.status}`, 400)
    );
  }

  // Update order status
  order.status = "cancelled";
  await order.save();

  // Restore product stock
  for (const item of order.products) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { inStock: item.quantity },
    });
  }

  res.status(200).json({
    status: "success",
    data: order,
  });
});

// import { catchAsync, AppError } from "../../../../utils/errorHandling.js";
// import Product from "../models/product.model.js";

// export const getAllProducts=catchAsync(async(req,res,next)=>
// {
//     const {category,minPrice,maxPrice}=req.query;
//     let filter={isActive:true};

//         if(category) filter.category=category;
//         if(minPrice||maxPrice) filter.price={$gte:minPrice||0,$lte:maxPrice||Infinity};

//         const products=await Product.find(filter);
//         res.json(products);
//     });

//     export const getProductsById=catchAsync(async(req,res)=>{
//         const product=await Product.findById(req.params.id);
//         if(!product)throw AppError('Product not found');
//         res.json(product);
//     });

// export const createProduct = catchAsync(async (req, res) => {
//     const newProduct = new Product(req.body);
//     await newProduct.save();
//     res.status(201).json(newProduct);
// });
// export const updateProduct = catchAsync(async (req, res, next) => {
//     const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updatedProduct) return next(new AppError('Product not found', 404));
//     res.json(updatedProduct);
// });
// export const deleteProduct = catchAsync(async (req, res, next) => {
//     const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
//     if (!product) return next(new AppError('Product not found', 404));
//     res.json({ message: 'Product soft deleted', product });
// });
// export const searchProducts = catchAsync(async (req, res) => {
//     const { query } = req.query;
//     const products = await Product.find({ $text: { $search: query }, isActive: true });
//     res.json(products);
// });
// export default{getAllProducts,getProductsById,createProduct,updateProduct,deleteProduct,searchProducts};
import { catchAsync, AppError } from "../../../../utils/errorHandling.js";
import Product from "../models/product.model.js";

export const getAllProducts = catchAsync(async (req, res, next) => {
    const { category, minPrice, maxPrice } = req.query;
    let filter = { isActive: true };

    if (category) filter.category = category;
    if (minPrice || maxPrice) filter.price = { $gte: minPrice || 0, $lte: maxPrice || Infinity };

    const products = await Product.find(filter);
    res.json(products);
});

export const getProductsById = catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError("Product not found", 404);
    res.json(product);
});

export const createProduct = catchAsync(async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
});

export const updateProduct = catchAsync(async (req, res, next) => {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return next(new AppError("Product not found", 404));
    res.json(updatedProduct);
});

export const deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return next(new AppError("Product not found", 404));
    res.json({ message: "Product soft deleted", product });
});

export const searchProducts = catchAsync(async (req, res) => {
    const { query } = req.query;
    const products = await Product.find({ $text: { $search: query }, isActive: true });
    res.json(products);
});
export default { getAllProducts, getProductsById, createProduct, updateProduct, deleteProduct, searchProducts };

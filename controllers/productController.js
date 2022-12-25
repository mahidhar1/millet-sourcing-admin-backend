const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    category,
    quantity,
    packSize,
    unit,
    price,
    discount,
    description,
  } = req.body;

  // validate the product parameters
  if (
    !name ||
    !sku ||
    !category ||
    !quantity ||
    !price ||
    !description ||
    !packSize ||
    !unit
  ) {
    res.status(400);
    throw new Error("Please fill in all the fields");
  }
  // Handle image file upload

  fileData = {};
  if (req.file) {
    // save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "inventory app",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded to cloudinary");
    }
    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Create a new product in db
  const product = await Product.create({
    userId: req.user.id,
    name,
    sku,
    category,
    quantity,
    packSize,
    unit,
    price,
    discount,
    description,
    image: fileData,
  });

  res.status(201).json(product);
});

//Get all products
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ userId: req.user.id }).sort(
    "-createdAt",
  );
  res.status(200).json(products);
});

// Get Product by id
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.userId.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authroized to view this product");
  }
  res.status(200).json(product);
});

// delete product with a given id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.userId.toString() !== req.user.id) {
    res.status(401);
    throw new Error("user not authorized to view this product");
  }
  await product.remove();
  res.status(200).json({ message: "product deleted succesfully", product });
});

const updateProduct = asyncHandler(async (req, res) => {
  //res.send(`Update Product with id ${req.params.id}`);

  const {
    name,
    category,
    quantity,
    packSize,
    unit,
    price,
    discount,
    description,
  } = req.body;
  const { id } = req.params;

  // Add validation for the product id
  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.userId.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authroized to view this product");
  }

  fileData = {};
  if (req.file) {
    // save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "inventory app",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded to cloudinary");
    }
    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    {
      _id: id,
    },
    {
      name,
      category,
      quantity,
      packSize,
      unit,
      price,
      discount,
      description,
      image: Object.keys(fileData).length === 0 ? product?.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({ message: "Updated Product", product: updatedProduct });
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
};

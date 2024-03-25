const { default: mongoose } = require("mongoose");
const { Category } = require("../models/categoryModel");
const { Product } = require("../models/productModel");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});
const uploadOptions = multer({ storage: storage });
// console.log(uploadOptions.storage)

//we cannot use upload middleware in same line with controller
exports.uploadMiddleware = uploadOptions.single("image");

exports.createNewProduct = async (req, res, next) => {
  try {
    // console.log(req)
    // console.log(req.body.category)
    // console.log(file.filename)
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        message: "Invalid Category",
        data: false,
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        message: "No image in the request",
        data: false,
      });
    }

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      // images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });
    console.log(product);
    await product
      .save()
      .then((result) => {
        res.status(200).json({
          message: "new product added successfully",
          data: true,
          result: result,
        });
      })
      .catch((error) => {
        res.status(400).json({
          message: "not added",
          data: false,
          error: error.message,
        });
      });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server error",
      data: false,
      error: error.message,
    });
  }
};

exports.getProductsList = async (req, res, next) => {
  try {
    
    let filter = {};
    if (req.query.categories) {
      filter = { category: req.query.categories.split(",") };
    }
    //if we just want to select name and image field
    // const productsList = await Product.find().select('name image');
    //this will minus _id from result mean it will now not show _id in response
    // const productsList = await Product.find().select('name image -_id');

    const productsList = await Product.find(filter).populate("category");

    if (!productsList) {
      res.status(500).json({
        message: "GOt error",
        data: false,
      });
    }
    // if(!productsList.category.name){
    //   res.status(400).json({
    //     message: "Category not found in category List",
    //     data: false,
    //   });
    // }

    res.status(200).json({
      message: "Data Fetched Successfully",
      data: true,
      result: productsList,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "GOt error",
      data: false,
    });
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const id = req.params.id;
    //we can select custom field using .select
    // const product = await Product.findById(id).select('name image');

    const product = await Product.findById(id).populate("category");
    if (!product) {
      res.status(400).json({
        message: "product not found",
        data: false,
      });
    }
    res.status(200).json({
      message: "Successfull",
      data: true,
      result: product,
    });
  } catch (error) {
    res.status(500).json({
      message: " Internal Server Error",
      error: error.message,
      data: false,
    });
  }
};

exports.updateProductById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }

    const category = await Category.findById(req.body.category);
    if (!category) {
      res.status(400).json({
        message: "Invalid Category",
        data: false,
      });
    }
    const id = req.params.id;

    const products = await Product.findById(req.params.id);
    if (!products) {
      return res.status(400).json({
        message: "Invalid Product",
        data: false,
      });
    }
    const file = req.file;
    let imagepath;
    if (file) {
      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      imagepath = `${basePath}${fileName}`;
    }

    // console.log(req.body)
    const updatedProduct = {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagepath,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    };
    // console.log(UpdatedCategory)
    const product = await Product.findByIdAndUpdate(id, updatedProduct, {
      new: true,
    });
    if (!product) {
      res.status(400).json({
        message: "product not updated",
        data: false,
      });
    }
    res.status(200).json({
      message: "Successfully updated",
      data: true,
      result: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal Server error",
      error: error.message,
      data: false,
    });
  }
};

exports.deleteProductById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      //if I didn't *return this response then server will be crashed on wrong id
      return res.status(400).json({
        message: "Invalid product Id ",
        data: false,
      });
    }

    Product.findByIdAndDelete(id).then((document) => {
      // console.log(document);
      if (document) {
        return res.status(200).json({
          message: "deleted successfully",
          data: true,
          result: document,
        });
      }
      return res.status(400).json({
        message: "Not Deleted ",
        data: false,
      });
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: "Not Deleted ",
      data: false,
    });
  }
};

exports.countProducts = async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments();
    if (!productCount) {
      return res.status(400).json({
        message: "Error in counting ",
        data: false,
      });
    }
    return res.status(200).json({
      message: "Product Counted Successfully",
      data: true,
      result: productCount,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Internal Server error ",
      data: false,
    });
  }
};

exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);
    if (!products) {
      return res.status(400).json({
        message: "Error Occured ",
        data: false,
      });
    }
    return res.status(200).json({
      message: "Featured Products Fetched successfully",
      data: true,
      result: products,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Internal Server error ",
      data: false,
    });
  }
};

exports.uploadMulitipleImagesMiddleware = uploadOptions.array("images", 10);

exports.uploadGalleryImages = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid Product Id",
        data: false,
      });
    }
    const files = req.files;
    console.log(req.body)
    let imagePaths = [];

    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagePaths.push(`${basePath}${file.filename}`);
      });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagePaths,
      },
      { new: true }
    );
    if (!product) {
      return res.status(500).json({
        message: "images cannot be updated",
        result: false,
      });
    } else {
      return res.status(200).json({
        message: "images gallery updated successfully",
        result: true,
        data: product,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "images cannot be updated",
      result: false,
      error: error.message,
    });
  }
};

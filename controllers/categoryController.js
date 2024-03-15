const { Category } = require("../models/categoryModel");

exports.createCategory = async (req, res, next) => {
  try {
    // console.log(req.body)
    let category = new Category({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    });
    await category.save().then((data) => {
      if (!data) {
        return res.status(400).json({
          message: "the category cannot be created",
          data: false,
        });
      } else {
        res.status(200).json({
          message: "created Successfully",
          data: true,
          result: data,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      data: false,
    });
  }
};

exports.deleteCategoryById = async (req, res, next) => {
  try {
    const id = req.params.id;
    Category.findByIdAndDelete(id).then((document) => {
      console.log(document);
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
    return res.status(400).json({
      error: error.message,
      message: "Not Deleted ",
      data: false,
    });
  }
};

exports.getCategoryList = async (req, res, next) => {
  try {
    const categoryList = await Category.find();
    if (!categoryList) {
      res.status(500).json({
        message: "GOt error",
        data: false,
      });
    }
    res.status(200).json({
      message: "Data Fetched Successfully",
      data: true,
      result: categoryList,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "GOt error",
      data: false,
    });
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);
    if (!category) {
      res.status(400).json({
        message: "category not found",
        data: false,
      });
    }
    res.status(200).json({
      message: "Successfull",
      data: true,
      result: category,
    });
  } catch (error) {
    res.status(500).json({
      message:" Internal Server Error",
      error: error.message,
      data: false,
    });
  }
};


exports.updateCategoryById = async (req, res, next) => {
  try {
    const id = req.params.id;
    // console.log(req.body)
    const UpdatedCategory = {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    };
    // console.log(UpdatedCategory)
    const category = await Category.findByIdAndUpdate(id, UpdatedCategory,{new:true});
    if (!category) {
      res.status(400).json({
        message: "category not updated",
        data: false,
      });
    }
    res.status(200).json({
      message: "Successfully updated",
      data: true,
      result: category,
    });
  } catch (error) {
    res.status(500).json({
        message: "internal Server error",
        error: error.message,
        data: false,
      });
    
  }
};

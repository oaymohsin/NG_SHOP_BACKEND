const { User } = require("../models/userModel");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
exports.createUser = async (req, res, next) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: hashedPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });
    user = await user.save();
    if (!user) {
      return res.status(400).json({
        message: "the user cannot be created",
        data: false,
      });
    } else {
      res.status(200).json({
        message: "created Successfully",
        data: true,
        result: user,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      data: false,
    });
  }
};

exports.getUsersList = async (req, res, next) => {
  try {
    //select -passwordHash exclude this field
    const userList = await User.find().select("-passwordHash");
    if (!userList) {
      res.status(500).json({
        message: "GOt error",
        data: false,
      });
    }
    res.status(200).json({
      message: "Data Fetched Successfully",
      data: true,
      result: userList,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "GOt error",
      data: false,
    });
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-passwordHash");
    if (!user) {
      res.status(400).json({
        message: "category not found",
        data: false,
      });
    }
    res.status(200).json({
      message: "Successfull",
      data: true,
      result: user,
    });
  } catch (error) {
    res.status(500).json({
      message: " Internal Server Error",
      error: error.message,
      data: false,
    });
  }
};

exports.updateUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userExist = await User.findById(id);
    let newPassword;
    if (req.body.password) {
      newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
      newPassword = userExist.passwordHash;
    }
    // console.log(req.body)
    const UpdatedUser = {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    };
    // console.log(UpdatedCategory)
    const user = await User.findByIdAndUpdate(id, UpdatedUser, {
      new: true,
    });
    if (!user) {
      res.status(400).json({
        message: "user not updated",
        data: false,
      });
    }
    res.status(200).json({
      message: "Successfully updated",
      data: true,
      result: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal Server error",
      error: error.message,
      data: false,
    });
  }
};

exports.userLogin = async (req, res, next) => {
  try {
    const userExist = await User.findOne({ email: req.body.email });
    // const user = await User.findById(id).select("-passwordHash");
    if (!userExist) {
      return res.status(400).json({
        message: "user not found",
        data: false,
      });
    }

    if (
      userExist &&
      bcrypt.compareSync(req.body.password, userExist.passwordHash)
    ) {
      const token = jwt.sign(
        { userId: userExist.id, isAdmin: userExist.isAdmin },
        process.env.secret,
        { expiresIn: "1d" }
      );
      return res.status(200).json({
        message: "Successfully logged In",
        data: true,
        token: token,
        result: userExist.email,
        user:userExist
      });
    } else {
      return res.status(400).json({
        message: "Wrong Credentials",
        data: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "internal Server error",
      error: error.message,
      data: false,
    });
  }
};

exports.countUsers = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    if (!userCount) {
      return res.status(400).json({
        message: "Error in counting ",
        data: false,
      });
    }
    return res.status(200).json({
      message: "User Counted Successfully",
      data: true,
      result: userCount,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Internal Server error",
      data: false,
    });
  }
};

exports.deleteUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      //if I didn't *return this response then server will be crashed on wrong id
      return res.status(400).json({
        message: "Invalid user Id ",
        data: false,
      });
    }

    User.findByIdAndDelete(id).then((document) => {
      // console.log(document);
      if (document) {
        return res.status(200).json({
          message: "deleted successfully",
          data: true,
          // result: document,
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

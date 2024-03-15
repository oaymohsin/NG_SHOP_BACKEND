const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
  color: {
    type: String,
  },
});

//This creates a virtual field named id that doesn't store data in the database but retrieves the _id (MongoDB's internal document identifier) as a string using the toHexString() method.
categorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

//This tells Mongoose to include virtual fields like id when converting documents to JSON objects.
categorySchema.set("toJSON", {
  virtuals: true,
});

exports.Category = mongoose.model("Category", categorySchema);

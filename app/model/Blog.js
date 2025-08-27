// models/Blog.js
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true },
    content: { type: String, required: true },
    image:   { type: String },
    author:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deleted: { type: Boolean, default: false } // soft delete for users
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);

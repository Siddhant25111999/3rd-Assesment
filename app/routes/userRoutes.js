// routes/userRoutes.js
const router = require("express").Router();
const User = require("../model/User");
const { isAdmin } = require("../middlewares/auth");

// Get all users (Admin only)
router.get("/", isAdmin, async (req, res) => {
  const users = await User.find();
  res.render("users", { users });
});

// Delete user (Admin only)
router.delete("/:id", isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  req.flash("success", "User deleted");
  res.redirect("/users");
});

module.exports = router;

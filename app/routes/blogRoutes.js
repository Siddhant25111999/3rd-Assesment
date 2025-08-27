const router = require("express").Router();
const Blog = require("../model/Blog");
const { isAuthenticated } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

// List all blogs (public)
router.get("/", async (req, res) => {
  const blogs = await Blog.find({ deleted: false }).populate("author");
  res.render("blogs/index", { blogs });
});

// Show create blog form (protected)
router.get("/create", isAuthenticated, (req, res) => {
  res.render("blogs/create");
});

// Show edit blog form (protected)
router.get("/edit/:id", isAuthenticated, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    req.flash("error", "Blog not found");
    return res.redirect("/blogs");
  }

  // Only author or admin can access edit form
  if (
    blog.author.toString() !== req.session.user._id &&
    req.session.user.role !== "admin"
  ) {
    req.flash("error", "Not authorized");
    return res.redirect("/blogs");
  }

  res.render("blogs/edit", { blog });
});

// View single blog (public) → ⚠️ must come AFTER /create and /edit
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("author");
  if (!blog) {
    req.flash("error", "Blog not found");
    return res.redirect("/blogs");
  }
  res.render("blogs/show", { blog });
});

// Create blog (protected)
router.post("/", isAuthenticated, upload.single("image"), async (req, res) => {
  const blog = new Blog({
    title: req.body.title,
    content: req.body.content,
    image: req.file ? "/uploads/" + req.file.filename : null,
    author: req.session.user._id,
  });
  await blog.save();
  req.flash("success", "Blog created");
  res.redirect("/blogs");
});

// Update blog (protected)
router.put("/:id", isAuthenticated, upload.single("image"), async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    req.flash("error", "Blog not found");
    return res.redirect("/blogs");
  }

  // Only author or admin
  if (
    blog.author.toString() !== req.session.user._id &&
    req.session.user.role !== "admin"
  ) {
    req.flash("error", "Not authorized");
    return res.redirect("/blogs");
  }

  blog.title = req.body.title;
  blog.content = req.body.content;
  if (req.file) blog.image = "/uploads/" + req.file.filename;

  await blog.save();
  req.flash("success", "Blog updated");
  res.redirect("/blogs");
});

// Delete blog (soft delete for user, hard delete for admin)
router.delete("/:id", isAuthenticated, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    req.flash("error", "Blog not found");
    return res.redirect("/blogs");
  }

  if (req.session.user.role === "admin") {
    await Blog.findByIdAndDelete(req.params.id);
  } else if (blog.author.toString() === req.session.user._id) {
    blog.deleted = true;
    await blog.save();
  }

  req.flash("success", "Blog deleted");
  res.redirect("/blogs");
});

module.exports = router;

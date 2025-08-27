const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcrypt");

// ----------------- REGISTER (Browser - EJS) -----------------
router.get("/register", (req, res) => {
  res.render("auth/register", {
    flashError: req.flash("error"),
    flashSuccess: req.flash("success")
  });
});

// ----------------- LOGIN (Browser - EJS) -----------------
router.get("/login", (req, res) => {
  res.render("auth/login", {
    flashError: req.flash("error"),
    flashSuccess: req.flash("success")
  });
});

// ----------------- REGISTER (POST) -----------------
router.post("/register", async (req, res) => {
  try {
    let { username, email, password } = req.body;

    // Normalize email
    email = email.toLowerCase();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email already registered");
      return res.redirect("/register");
    }

    // Save user (password will be hashed automatically via pre-save hook)
    const user = new User({ username, email, password });
    await user.save();

    console.log("Registered User:", user);

    req.flash("success", "Registered successfully, please login");
    res.redirect("/login");
  } catch (err) {
    console.error("Register Error:", err);
    req.flash("error", "Registration failed");
    res.redirect("/register");
  }
});

// ----------------- LOGIN (POST) -----------------
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    // Normalize email
    email = email.toLowerCase();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Login failed: User not found");
      req.flash("error", "Invalid credentials");
      return res.redirect("/login");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);
    if (!isMatch) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/login");
    }

    // Save session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    console.log("Login success:", req.session.user);
    req.flash("success", `Welcome back, ${user.username}!`);
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Login Error:", err);
    req.flash("error", "Login failed");
    res.redirect("/login");
  }
});

// ----------------- LOGOUT -----------------
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    if (!req.originalUrl.startsWith("/api")) return res.redirect("/login");
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;

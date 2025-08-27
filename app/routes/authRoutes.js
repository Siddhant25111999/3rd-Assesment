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

// ----------------- REGISTER (API) -----------------
// router.post("/register", async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: "Email already registered" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({ username, email, password: hashedPassword });
//     await user.save();

//     res.status(201).json({ message: "Registered successfully", user: { id: user._id, email: user.email } });
//   } catch (err) {
//     console.error("Register Error:", err);
//     res.status(500).json({ error: "Registration failed" });
//   }
// });
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email already registered");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    req.flash("success", "Registered successfully, please login");
    res.redirect("/login"); // 🔹 Redirect to login page
  } catch (err) {
    console.error("Register Error:", err);
    req.flash("error", "Registration failed");
    res.redirect("/register");
  }
});


// ----------------- LOGIN (API) -----------------
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ error: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

//     req.session.user = user;
//     res.json({ message: `Welcome back, ${user.username}!`, user: { id: user._id, email: user.email } });
//   } catch (err) {
//     console.error("Login Error:", err);
//     res.status(500).json({ error: "Login failed" });
//   }
// });
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    req.flash("error", "Invalid credentials");
    return res.redirect("/login");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    req.flash("error", "Invalid credentials");
    return res.redirect("/login");
  }
  req.session.user = user;
  req.flash("success", `Welcome back, ${user.username}!`);
  res.redirect("/dashboard");
});



// ----------------- LOGOUT -----------------
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    // If browser → redirect
    if (!req.originalUrl.startsWith("/api")) return res.redirect("/login");
    // If API → return JSON
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;

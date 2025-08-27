// app.js
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const methodOverride = require("method-override");
const connectDB = require("./app/config/db");

const authRoutes = require("./app/routes/authRoutes");
const userRoutes = require("./app/routes/userRoutes");
const blogRoutes = require("./app/routes/blogRoutes");
const { isAuthenticated } = require("./app/middlewares/auth");
const app = express();
require("dotenv").config();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(
  session({ secret: "secret123", resave: false, saveUninitialized: false })
);
app.use(flash());

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Flash + User Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.session.user || null;
  next();
});

// Routes
// app.js (after other middlewares, before app.listen)

// Home route → redirect to blogs or login


app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.session.user });
});

app.get("/", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.redirect("/login");
});


app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/blogs", blogRoutes);

// Connect DB & Start Server
connectDB();
app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);

// middlewares/auth.js

// Check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();

  // If API call → return JSON
  if (req.originalUrl.startsWith("/api")) {
    return res.status(401).json({ error: "You must login first" });
  }

  // Otherwise → browser redirect
  req.flash("error", "You must login first");
  return res.redirect("/login");
}

// Check if logged in user is admin
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") return next();

  // If API call → return JSON
  if (req.originalUrl.startsWith("/api")) {
    return res.status(403).json({ error: "Admin access only" });
  }

  // Otherwise → browser redirect
  req.flash("error", "Admin access only");
  return res.redirect("/dashboard");
}

module.exports = { isAuthenticated, isAdmin };

export function adminAuth(req, res, next) {
  const token = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    return next();
  }

  if (token !== expected) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized admin access",
      data: null,
    });
  }

  req.adminUser = req.headers["x-admin-user"] || "admin";
  next();
}

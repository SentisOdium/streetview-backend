export function adminAuth(req, res, next) {
  const token = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    console.error("CRITICAL SECURITY ERROR: ADMIN_TOKEN environment variable is not configured. Access denied.");
    return res.status(500).json({
      success: false,
      message: "Server authentication misconfigured. Denying access.",
      data: null,
    });
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

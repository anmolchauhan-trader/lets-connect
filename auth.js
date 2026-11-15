import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    req.user = jwt.verify(req.cookies?.token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    next();
  } catch {
    // API calls get JSON, page requests get sent to the login page
    if (req.originalUrl.startsWith("/api")) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.redirect("/");
  }
}
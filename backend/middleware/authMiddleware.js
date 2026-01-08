import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); 

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`Auth check: ${req.method} ${req.path}`);
    console.log(`Authorization header: ${authHeader ? 'Present' : 'Missing'}`);
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
      message: "Access denied. No token provided.",
      path: req.path,
      method: req.method,
    });
  }

  const token = authHeader.split(" ")[1]; 

  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables!");
      return res.status(500).json({
        message: "Server configuration error.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userId) {
      req.userId = decoded.userId;
      next(); 
    } else {
      return res.status(403).json({
        message: "Invalid token. User not authorized.",
      });
    }
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(403).json({
      message: "Invalid or expired token.",
      error: error.message,
    });
  }
};

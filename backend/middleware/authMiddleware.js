import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); 

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

 
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1]; 

  try {
   
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
    });
  }
};

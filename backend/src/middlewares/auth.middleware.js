import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyuser = async (req, res, next) => {
  try {
    // Try Authorization header first, then fall back to cookie
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(decodedToken.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

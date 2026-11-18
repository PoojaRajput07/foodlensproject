import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, language } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const user = await User.create({ name, email, password, language });

    // Auto-login after signup: generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    };
    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
        profileCompleted: user.profileCompleted,
        healthProfile: user.healthProfile,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    if (!password) return res.status(400).json({ success: false, message: "Password is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const cookieOptions = { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" };

    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
        profileCompleted: user.profileCompleted,
        healthProfile: user.healthProfile,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.refreshToken = null;
    await user.save();

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const cookieOptions = { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" };
    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({ success: true, message: "Token refreshed", accessToken, refreshToken });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
        role: user.role,
        profileCompleted: user.profileCompleted,
        healthProfile: user.healthProfile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

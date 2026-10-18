
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const User = require("../model/Schema");
const { authMiddleware } = require("../controller/auth");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WebP images are allowed."));
    }
  }
});

const getProfileImage = (user) => {
  if (user.profileImageData && user.profileImageContentType) {
    return `data:${user.profileImageContentType};base64,${user.profileImageData.toString("base64")}`;
  }

  return user.profileImage || "";
};

const getUserResponse = (user) => ({
  name: user.username,
  email: user.email,
  profileImage: getProfileImage(user)
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Invalid user ID." });
    }

    const user = await User.findById(userId).select(
      "username email profileImage profileImageData profileImageContentType"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      user: getUserResponse(user)
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      message: "Failed to load profile."
    });
  }
});

router.put("/", authMiddleware, (req, res, next) => {
  upload.single("profileImage")(req, res, (error) => {
    if (error) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "Profile image must be 200 KB or smaller."
          : error.message || "Image upload failed.";

      return res.status(400).json({ message });
    }

    next();
  });
}, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Invalid user ID." });
    }

    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        message: "Name cannot be empty."
      });
    }

    if (name.length > 60) {
      return res.status(400).json({
        message: "Name cannot exceed 60 characters."
      });
    }

    const updateFields = {
      username: name
    };

    if (req.file) {
      updateFields.profileImageData = req.file.buffer;
      updateFields.profileImageContentType = req.file.mimetype;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      {
        returnDocument: "after",
        runValidators: true
      }
    ).select(
      "username email profileImage profileImageData profileImageContentType"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: getUserResponse(user)
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      message: "Failed to update profile."
    });
  }
});

module.exports = router;

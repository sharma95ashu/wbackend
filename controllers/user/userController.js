const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function to check for missing fields
const validateFields = (fields) => {
  for (const [field, value] of Object.entries(fields)) {
    if (!value) {
      return `${field} is required`;
    }
  }
  return null;
};

// Controller to login or create a new user
const loginCreateUser = async (req, res, next) => {
  try {
    const { user_phone, user_password, user_otp, user_email } = req.body;

    // Validation: Check for required fields
    const missingField = validateFields({ user_phone, user_password });
    if (missingField) {
      return res.status(400).json({ message: missingField });
    }

    const userData = await User.findOne(
      user_email ? { email: user_email } : { phone: user_phone }
    );

    if (!userData) {
      const plainPassword = user_password;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      const newUser = await User.create({
        name: "Test",
        email: user_email,
        phone: user_phone,
        password: hashedPassword,
        role: "subscriber",
      });

      return res.status(200).json({ created: true, user: newUser });
    } else {
      const isPasswordValid = await bcrypt.compare(
        user_password,
        userData.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Wrong Credentials!" });
      } else {
        const token = jwt.sign(
          {
            id: userData._id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRY_TIME }
        );

        res.status(200).json({
          message: "Login successful",
          token,
          user: userData,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

// GET all users with pagination and search
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, searchTerm = "" } = req.query;

    const regex = new RegExp(searchTerm, "i");

    const query = {
      $or: [{ name: { $regex: regex } }, { email: { $regex: regex } }],
    };

    // If searchTerm is numeric, also include phone in search
    if (!isNaN(searchTerm)) {
      query.$or.push({ phone: Number(searchTerm) });
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      total,
      page: Number(page),
      pageSize: Number(limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Controller to get a user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const singleUser = await User.findById(id).select("-password");
    if (!singleUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(singleUser);
  } catch (error) {
    next(error);
  }
};

// Controller to update a user by ID
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (updatedData.password) {
      if (updatedData.password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(updatedData.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated", updatedUser });
  } catch (error) {
    next(error);
  }
};

// Controller to delete a user by ID
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginCreateUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};

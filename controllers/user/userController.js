const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Calling the middlewares
dotenv.config();

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
    const { phone, password, user_otp, email } = req.body;

    // Validation: Check for required fields
    const missingField = validateFields(
      email ? { email, password } : { phone, password }
    );
    if (missingField) {
      return res.status(400).json({ message: missingField });
    }

    const userData = await User.findOne(
      email ? { email: email } : { phone: phone }
    );

    if (!userData) {
      const plainPassword = password;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      const newUser = await User.create({
        name: "Test",
        email: email,
        phone: phone,
        password: hashedPassword,
        role: "subscriber",
      });

      return res.status(200).json({ created: true, user: newUser });
    } else {
      const isPasswordValid = await bcrypt.compare(password, userData.password);

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
          data: token,
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
    const { page = 1, pageSize = 10, searchTerm = "" } = req.query;

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
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize))
      .sort({ createdAt: -1 });

    res.status(200).json({
      total_count: total,
      page: Number(page),
      pageSize: Number(pageSize),
      data: users,
      success: true,
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

    res.status(200).json({ success: true, data: singleUser });
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

// Controller to add a new user
const addUser = async (req, res, next) => {
  try {
    const { name, phone, email, password, role, address } = req.body;

    // 1. Basic validation
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email && !phone) {
      return res
        .status(400)
        .json({ message: "Either email or phone is required" });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this phone no. already exists" });
    }

    // 3. Hash password if provided
    let hashedPassword = "";
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // 4. Create user object
    const newUser = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      role: role,
      address,
    });

    // 5. Save to DB
    await newUser.save();

    res
      .status(200)
      .json({ message: "User created successfully", success: true });
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
  addUser,
};

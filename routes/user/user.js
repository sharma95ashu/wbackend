const express = require("express");
const router = express.Router();
const {
  loginCreateUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  addUser,
} = require("../../controllers/user/userController"); // Adjust path if needed

// Login or Create user
router.post("/login-or-create", loginCreateUser);

// CRUD Routes
router.get("/", getAllUsers); // ?page=1&limit=10&searchTerm=test
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/create", addUser);

module.exports = router;

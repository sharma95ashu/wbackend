const express = require("express");
const router = express.Router();
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require("../../controllers/role/Role");

// Create
router.post("/", createRole);

// Read (All + Search + Pagination)
router.get("/", getAllRoles);

// Read by ID
router.get("/:id", getRoleById);

// Update
router.put("/:id", updateRole);

// Delete
router.delete("/:id", deleteRole);

module.exports = router;

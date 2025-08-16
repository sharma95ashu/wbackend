const express = require("express");
const router = express.Router();
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require("../../controllers/expense/Expense");

// Create
router.post("/", createExpense);

// Read (All + Search + Pagination)
router.get("/", getAllExpenses);

// Read by ID
router.get("/:id", getExpenseById);

// Update
router.put("/:id", updateExpense);

// Delete
router.delete("/:id", deleteExpense);

module.exports = router;

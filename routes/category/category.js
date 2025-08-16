const express = require("express");
const router = express.Router();

// Middlewares
const { authentication } = require("../../middlewares/authentication");

// Controller functions
const {
  create,
  read,
  update,
  remove,
  list,
  getSubs,
} = require("../../controllers/category/category");

// Routes
router.post("/add", authentication, create); //! Create a new category (admin only)
// router.post("/add", authentication, create); //! Create a new category (admin only)

router.get("/get-all", list); // List all categories
router.get("/:slug", read); // Get a category by slug
router.put("/:slug", authentication, update); //! Update a category (admin only)
// router.put("/:slug", authentication, update); //! Update a category (admin only)

router.delete("/:slug", authentication, remove); //! Delete a category (admin only)
// router.delete("/:slug", authentication, remove); //! Delete a category (admin only)

router.get("/subs/:_id", getSubs); // Get subcategories by parent ID

module.exports = router;

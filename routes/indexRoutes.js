const express = require("express");
const router = express.Router();
const genericRoutes = require("./generic/genericRoutes");
const categoryRoutes = require("./category/category");
const productRoutes = require("./product/product");
const userRoutes = require("./user/user");
const roleRoutes = require("./role/roleRoutes");
const expenseRoutes = require("./expense/expenseRoute");
router.use("/generic", genericRoutes);
router.use("/category", categoryRoutes);
router.use("/product", productRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/expense", expenseRoutes);

module.exports = router;

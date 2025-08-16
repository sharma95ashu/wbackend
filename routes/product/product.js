const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); // Handle form-data using Multer
// middlewares
const { adminCheck } = require("../../middlewares/authentication");

// controller
const {
  create,
  listAll,
  remove,
  read,
  update,
  list,
  productsCount,
  productStar,
  listRelated,
  searchFilters,
  uploadProduct,
} = require("../../controllers/product/product");

// routes
router.post("/product", upload.none(), adminCheck, create);
router.get("/products/total", productsCount);

router.get("/products/:count", listAll); // products/100
router.delete("/product/:slug", remove);
router.get("/product/:slug", read);
router.put("/product/:slug", update);

router.post("/products", list);
// rating
router.put("/product/star/:productId", productStar);
// related
router.get("/product/related/:productId", listRelated);
// search
router.post("/search/filters", searchFilters);

router.post("/upload", upload.single("image"), uploadProduct);
module.exports = router;

const router = require("express").Router();
const {
  verifyTokenAndAdmin,
} = require("../../services/verifyToken");
const productController = require("../controllers/productController");

// All admin product routes are mounted under /api/admin/products
router.post("/", verifyTokenAndAdmin, productController.createProduct);
router.put("/:id", verifyTokenAndAdmin, productController.updateProduct);
router.delete("/:id", verifyTokenAndAdmin, productController.deleteProduct);

module.exports = router;

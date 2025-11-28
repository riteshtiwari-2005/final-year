const router = require("express").Router();
const {
  verifyTokenAndAdmin,
} = require("../../services/verifyToken");
const serviceController = require("../controllers/serviceController");

// All admin service routes are mounted under /api/admin/services
router.post("/", verifyTokenAndAdmin, serviceController.createService);
router.put("/:id", verifyTokenAndAdmin, serviceController.updateService);
router.delete("/:id", verifyTokenAndAdmin, serviceController.deleteService);

module.exports = router;

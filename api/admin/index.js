const router = require("express").Router();

// Admin sub-routes
router.use("/products", require("./routes/product"));
router.use("/services", require("./routes/service"));
router.use("/workers", require("./routes/worker"));

module.exports = router;

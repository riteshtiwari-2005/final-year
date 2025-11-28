const router = require("express").Router();
const { verifyTokenAndAdmin } = require("../../services/verifyToken");
const workerController = require("../controllers/workerController");

// Admin routes for worker management
router.post("/", verifyTokenAndAdmin, workerController.createWorker);
// list workers
router.get("/", verifyTokenAndAdmin, workerController.listWorkers);
// delete worker by id
router.delete("/:id", verifyTokenAndAdmin, workerController.deleteWorker);

module.exports = router;

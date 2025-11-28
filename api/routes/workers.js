const router = require("express").Router();
const User = require("../models/User");

// Public workers listing (used by frontend to show available professionals)
// Optional query param: serviceId — when provided, return only workers assigned to that service
router.get("/", async (req, res) => {
  try {
    const { serviceId } = req.query;
    const filter = { type: "worker" };
    if (serviceId) filter.service = serviceId;
    const workers = await User.find(filter).select("firstname surname img maker license service");
    res.status(200).json(workers);
  } catch (err) {
    console.error("workers list error", err);
    res.status(500).json({ error: "Failed to load workers" });
  }
});

module.exports = router;

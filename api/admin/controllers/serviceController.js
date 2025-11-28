const Service = require("../../models/Service");

// Admin controller for services
exports.createService = async (req, res) => {
  try {
    const newService = new Service(req.body);
    const saved = await newService.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("createService error:", err);
    res.status(500).json(err);
  }
};

exports.updateService = async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    console.error("updateService error:", err);
    res.status(500).json(err);
  }
};

exports.deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Service deleted" });
  } catch (err) {
    console.error("deleteService error:", err);
    res.status(500).json(err);
  }
};

const User = require("../../models/User");
const CryptoJS = require("crypto-js");

// Create a worker user (admin-only)
exports.createWorker = async (req, res) => {
  try {
    const {
      firstname,
      surname,
      phone,
      type = "worker",
      license = "N/A",
      maker = "N/A",
      email,
      password,
      img,
      service,
    } = req.body;

    if (!firstname || !surname || !phone || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "User with this email already exists" });

    const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.PASS_SEC || "dev-pass").toString();

    const newWorker = new User({
      firstname,
      surname,
      phone,
      type,
      license,
      maker,
      email,
      password: encryptedPassword,
      isAdmin: false,
      img,
      service,
    });

    const saved = await newWorker.save();
    const { password: pw, ...safe } = saved._doc;
    res.status(201).json(safe);
  } catch (err) {
    console.error("createWorker error:", err);
    res.status(500).json({ error: "Failed to create worker", details: err.message });
  }
};

// List all workers
exports.listWorkers = async (req, res) => {
  try {
    const workers = await User.find({ type: "worker" }).select("firstname surname email phone license maker img createdAt");
    res.status(200).json(workers);
  } catch (err) {
    console.error("listWorkers error:", err);
    res.status(500).json({ error: "Failed to list workers", details: err.message });
  }
};

// Delete a worker by id
exports.deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await User.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ error: "Worker not found" });
    res.status(200).json({ message: "Worker deleted" });
  } catch (err) {
    console.error("deleteWorker error:", err);
    res.status(500).json({ error: "Failed to delete worker", details: err.message });
  }
};

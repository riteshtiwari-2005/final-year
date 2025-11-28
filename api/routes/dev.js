const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");

// Development-only route to seed an admin user for local testing.
// Only enabled when NODE_ENV !== 'production'.
router.post("/seed-admin", async (req, res) => {
  try {
    // Allow custom credentials, but provide defaults for convenience
    const email = req.body.email || "admin@local.test";
    const password = req.body.password || "Admin123!";

    // If already exists, return existing (without password)
    let existing = await User.findOne({ email });
    if (existing) {
      const { password, ...safe } = existing._doc;
      return res.status(200).json({ message: "Admin already exists", user: safe });
    }

    const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.PASS_SEC || "dev-pass").toString();

    const newAdmin = new User({
      firstname: "Local",
      surname: "Admin",
      phone: "0000000000",
      type: "admin",
      license: "N/A",
      maker: "N/A",
      email,
      password: encryptedPassword,
      isAdmin: true,
    });

    await newAdmin.save();
    const { password: pw, ...safe } = newAdmin._doc;
    return res.status(201).json({ message: "Admin created", user: safe, credentials: { email, password } });
  } catch (err) {
    console.error("Seed admin error:", err);
    return res.status(500).json({ error: "Failed to seed admin", details: err.message });
  }
});

module.exports = router;

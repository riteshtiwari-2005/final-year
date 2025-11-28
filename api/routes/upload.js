const router = require("express").Router();
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");
const { verifyToken } = require("../services/verifyToken");

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use multer memory storage so we can stream directly to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper: upload buffer to Cloudinary using upload_stream
function uploadBufferToCloudinary(buffer, folder = "gersgarage") {
  return new Promise((resolve, reject) => {
    const upload_stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(upload_stream);
  });
}

// POST /api/upload - upload a single file (field name: "file")
// Allow any authenticated user to upload images (profile images, product images, etc.)
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    // Upload buffer to Cloudinary
    const result = await uploadBufferToCloudinary(req.file.buffer, "gersgarage");
    // Return secure URL and public_id for possible future deletes
    return res.status(201).json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

module.exports = router;

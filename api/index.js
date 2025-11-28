const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.set("strictQuery", false);
//[MONGOOSE] DeprecationWarning: Mongoose: the `strictQuery` option will be switched back to `false` by default in Mongoose 7. Use `mongoose.set('strictQuery', false);` if you want to prepare for this change. Or use `mongoose.set('strictQuery', true);` to suppress this warning.
// (Use `node --trace-deprecation ...` to show where the warning was created)

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const sericeRoute = require("./routes/service");
const appointmentRoute = require("./routes/appointment");
const slotRoute = require("./routes/slot");
const orderRoute = require("./routes/order");
const cors = require("cors");
const devRoute = require("./routes/dev");
const uploadRoute = require("./routes/upload");
const workersRoute = require("./routes/workers");
const adminRouter = require("./admin");
const path = require("path");

if (process.env.MONGO_URL) {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("DB Connection Successfull!"))
    .catch((err) => {
      console.log(err);
    });
} else {
  console.warn(
    "MONGO_URL not set. Skipping DB connection. Set MONGO_URL in api/.env to enable DB."
  );
}

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/services", sericeRoute);
app.use("/api/appointments", appointmentRoute);
app.use("/api/slots", slotRoute);
app.use("/api/orders", orderRoute); 

// Mount development helper routes only when not in production
if (process.env.NODE_ENV !== "production") {
  app.use("/api/dev", devRoute);
}

// Serve uploaded files statically from /uploads
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Upload route for admin to add images (protected)
app.use("/api/upload", uploadRoute);

// Public workers listing
app.use("/api/workers", workersRoute);

// Mount admin grouped routes under /api/admin
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}!`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Either stop the process using it or set a different PORT in api/.env.`
    );
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});

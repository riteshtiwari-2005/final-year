const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/mailer");
const crypto = require("crypto");

function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || "10", 10);

/* -----------------------------------------------------
   TRAGAGE STYLE OTP EMAIL
----------------------------------------------------- */
function buildTragageOtpEmail(otp, link) {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>OTP Verification</title>
</head>

<body style="margin:0;padding:0;background:#f3f3f3;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:40px 0;">

      <table width="480" cellpadding="0" cellspacing="0" style="
        background:#ffffff;
        border-radius:20px;
        border: 2px solid #d62828;
        padding:35px 30px;
        box-shadow:0 4px 12px rgba(0,0,0,0.18);
      ">
        <tr>
          <td style="text-align:center;">

            <h2 style="margin:10px 0 5px;color:#111;font-size:26px;">Verify Your Account</h2>
            <p style="color:#444;font-size:15px;margin-bottom:25px;">
              Use the OTP below to continue
            </p>

            <!-- OTP BOX -->
            <div style="
              background:#fceaea;
              border:2px solid #d62828;
              padding:18px 0;
              border-radius:12px;
              width:80%;
              margin:0 auto 25px;
            ">
              <p style="
                margin:0;
                font-size:36px;
                letter-spacing:10px;
                font-weight:bold;
                color:#d62828;
              ">
                {{OTP}}
              </p>
            </div>

            <p style="color:#555;font-size:14px;margin-bottom:15px;">
              OTP is valid for <b>10 minutes</b>.
            </p>

            <p style="color:#777;font-size:12px;">
              Do not share this code with anyone.
            </p>

          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>

</body>
</html>
`;

  return template.replace(/{{OTP}}/g, otp).replace(/{{LINK}}/g, link);
}

/* -----------------------------------------------------
   TRAGAGE STYLE PASSWORD RESET EMAIL
----------------------------------------------------- */
function buildTragageResetEmail(link) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background:#f3f3f3;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:40px 0;">

      <table width="480" style="
        background:#fff;
        padding:30px;
        border-radius:20px;
        border: 2px solid #d62828;
        box-shadow:0 4px 12px rgba(0,0,0,0.18);
      ">
        <tr><td style="text-align:center;">

          <h2 style="color:#111;">Password Reset Request</h2>
          <p style="color:#555;font-size:15px;">
            Click the button below to reset your password.
          </p>

          <a href="${link}" style="
            display:inline-block;
            background:#d62828;
            color:white!important;
            padding:12px 25px;
            text-decoration:none;
            font-weight:bold;
            font-size:15px;
            border-radius:22px;
            margin-top:15px;
            border: 2px solid #d62828;
          ">
            Reset Password
          </a>

          <p style="margin-top:25px;font-size:13px;color:#555;">
            If the button does not work, use this link:<br/>
            <a href="${link}" style="color:#d62828;">${link}</a>
          </p>

          <hr style="border:none;border-top:1px solid #ddd;margin:35px 0;" />

          <p style="font-size:12px;color:#777;">If you didn’t request this, ignore this email.</p>

        </td></tr>
      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
}

/* -----------------------------------------------------
   REGISTER
----------------------------------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { enteredFirstName, enteredSurname, enteredMobilePhone, enteredEmail, enteredPassword } = req.body;

    if (!enteredFirstName || !enteredSurname || !enteredMobilePhone || !enteredEmail || !enteredPassword)
      return res.json({ message: "Please enter all the details" });

    const exists = await User.findOne({ email: enteredEmail });
    if (exists) return res.status(401).json({ message: "User already exist" });

    const newUser = new User({
      firstname: enteredFirstName,
      surname: enteredSurname,
      phone: enteredMobilePhone,
      email: enteredEmail,
      password: CryptoJS.AES.encrypt(enteredPassword, process.env.PASS_SEC).toString(),
      isVerified: false,
    });

    await newUser.save();

    const otp = genOtp();
    const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await User.findOneAndUpdate({ email: enteredEmail }, { otp, otpExpiry: expiry });

    const link = `${process.env.CLIENT_URL}/verify?email=${enteredEmail}`;
    const html = buildTragageOtpEmail(otp, link);

    await sendMail({
      to: enteredEmail,
      subject: "Email Verification Code",
      html,
    });

    res.status(200).json({ message: "User created. OTP sent to email." });

  } catch (err) {
    res.status(500).json(err);
  }
});

/* -----------------------------------------------------
   VERIFY OTP
----------------------------------------------------- */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.otp || !user.otpExpiry) return res.status(400).json({ error: "No OTP pending" });

    if (new Date() > user.otpExpiry) return res.status(400).json({ error: "OTP expired" });
    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    if (purpose === "register" || !purpose) user.isVerified = true;

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    if (purpose === "login") {
      const access = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SEC, { expiresIn: "1h" });
      const { password, ...others } = user._doc;
      return res.json({ message: "Verified", access, ...others });
    }

    res.json({ message: "Verified" });
  } catch {
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

/* -----------------------------------------------------
   REQUEST PASSWORD RESET
----------------------------------------------------- */
router.post("/request-password-reset", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const raw = crypto.randomBytes(32).toString("hex");
    const hashed = CryptoJS.SHA256(raw).toString();
    const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    user.resetToken = hashed;
    user.resetTokenExpiry = expiry;

    await user.save();

    const link = `${process.env.CLIENT_URL}/password-reset?email=${email}&token=${raw}`;
    const html = buildTragageResetEmail(link);

    await sendMail({ to: email, subject: "Password Reset Request", html });

    res.json({ message: "Password reset email sent" });
  } catch {
    res.status(500).json({ error: "Failed to request password reset" });
  }
});

/* -----------------------------------------------------
   RESET PASSWORD
----------------------------------------------------- */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.resetToken || !user.resetTokenExpiry)
      return res.status(400).json({ error: "No reset token pending" });

    if (new Date() > user.resetTokenExpiry)
      return res.status(400).json({ error: "Token expired" });

    const hashed = CryptoJS.SHA256(token).toString();
    if (hashed !== user.resetToken)
      return res.status(400).json({ error: "Invalid token" });

    user.password = CryptoJS.AES.encrypt(newPassword, process.env.PASS_SEC).toString();
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

/* -----------------------------------------------------
   LOGIN → SEND OTP
----------------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { enteredEmail, enteredPassword } = req.body;

    const user = await User.findOne({ email: enteredEmail });
    if (!user) return res.status(401).json({ error: "Wrong credentials!" });

    const hashed = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
    if (hashed.toString(CryptoJS.enc.Utf8) !== enteredPassword)
      return res.status(401).json({ error: "Wrong credentials!" });

    const otp = genOtp();
    const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = expiry;

    await user.save();

    const link = `${process.env.CLIENT_URL}/login-verify?email=${enteredEmail}`;
    const html = buildTragageOtpEmail(otp, link);

    await sendMail({
      to: enteredEmail,
      subject: "Your Login Code",
      html,
    });

    res.json({ message: "OTP sent", requiresOtp: true });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;

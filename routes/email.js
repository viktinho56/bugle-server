const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const { sendContactEmail } = require("./../helpers/email");

// Create news
router.post("/sendContactEmail", async (req, res) => {
  await sendContactEmail(
    "",
    "Contact Email",
    req.body.message,
    req.body.fullName,
    req.body.phone,
    req.body.email,
    req.body.company
  );
  res.send("Mail Sent Successfully");
});

module.exports = router;

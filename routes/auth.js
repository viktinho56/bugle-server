const Joi = require("joi");
const config = require("config");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const dbTable = "users";
const db = require("../startup/db")();
const { generateAuthToken } = require("../helpers/token");
const { sendPasswordResetEmail, sendOtpEmail } = require("./../helpers/email");
const auth = require("../middleware/auth");
// const resetUrl = config.get("client_url") + "/auth/reset-password";

// Authorize users
router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const currentDateTime = new Date();
  const formattedDate = currentDateTime
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const postGroupUsersDB = "postGroupUsers";
  const postGroupDB = "postGroups";
  let groupArray = [{ id: 1, name: "General" }];
  db.query(
    `SELECT * FROM ${dbTable} WHERE email =? AND status =?`,
    [req.body.email, 0],
    async function (err, results) {
      if (results.length == 1) {
        const user = results[0];

        const validPassword = await bcrypt.compare(
          req.body.password,
          user.password
        );
        if (!validPassword)
          return res.status(400).send("Invalid email or password.");
        db.query(`UPDATE ${dbTable} SET lastLogin = ? WHERE email =?`, [
          formattedDate,
          req.body.email,
        ]);
        db.query(
          `SELECT PG.groupName,PG.id FROM ${postGroupDB} PG , ${postGroupUsersDB} PGU WHERE PGU.userId = ? AND PG.id = PGU.postGroupId`,
          [user.userId],
          async function (err, results) {
            if (results.length > 0) {
              for (let index = 0; index < results.length; index++) {
                const element = results[index];
                groupArray.push({ id: element.id, name: element.groupName });
              }
            }
            console.log(groupArray);
            user.groupArray = groupArray;
            const token = generateAuthToken(user);
            res.send(token);
          }
        );
      } else {
        return res.status(400).send("Invalid email or password.");
      }
    }
  );
});

// Deactivate User Account
router.put("/account/:id/:status", async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} where userId = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `UPDATE ${dbTable} SET status =? WHERE userId = ? `,
          [req.params.status, req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("User Account could not be Updated");
            } else {
              res.send("User Account Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The User with the given ID could not be  Found.");
      }
    }
  );
});

// Deactivate User Account
router.put("/setGeolocation", async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} where userId = ?`,
    [req.body.userId],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `UPDATE ${dbTable} SET latitude =?,longitude =? WHERE userId = ? `,
          [req.body.latitude, req.body.longitude, req.body.userId],
          function (err, results) {
            if (err) {
              res.status(500).send("User Account could not be Updated");
            } else {
              res.send("User Account Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The User with the given ID could not be  Found.");
      }
    }
  );
});

function validateUser(user) {
  const schema = {
    email: Joi.string().min(2).max(255).required(),
    password: Joi.string().min(2).max(50).required(),
  };
  return Joi.validate(user, schema);
}

module.exports = router;

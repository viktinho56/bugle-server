const Joi = require("joi");
const config = require("config");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const dbTable = "users";
const appUrl = config.get("client_url") + "/auth/reset-password";
const { generateAuthToken } = require("../helpers/token");
const auth = require("../middleware/auth");
const { sendWelcomeEmail } = require("../helpers/email");

// Show All Users
router.get("/", [auth], async (req, res) => {
  db.query(
    `SELECT U.userId,U.armedForce,U.serviceNumber,U.userRank,U.firstName,U.lastName,U.email,U.avatarUrl,U.created,U.status,U.userName,U.latitude,U.longitude,(SELECT COUNT(*) FROM posts P WHERE U.UserId = P.UserId) as postsCount
FROM 
users U ORDER BY U.userId`,
    function (err, results) {
      console.log(err);
      res.send(results);
    }
  );
});

// Show users
router.get("/pagination/", [auth], async (req, res) => {
  console.log(req.query);
  let { start, end } = req.query;
  db.query(
    `SELECT U.userId,U.armedForce,U.serviceNumber,U.userRank,U.firstName,U.lastName,U.email,U.avatarUrl,U.created,U.status,U.userName,U.latitude,U.longitude,(SELECT COUNT(*) FROM posts P WHERE U.UserId = P.UserId) as postsCount
FROM 
users U ORDER BY U.userId DESC LIMIT ${start},${end}`,
    function (err, results) {
      console.log(err);
      res.send(results);
    }
  );
});

// Show user by id
router.get("/:id", [auth], async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} WHERE userId = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res.status(404).send("The user with the given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// Show user by status
router.get("/status/:id", [auth], async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} WHERE status = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res.status(404).send("The user with the given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});
// Create users
router.post("/", [auth], async (req, res) => {
  const { error } = validateUsers(req.body);
  const currentDateTime = new Date();
  const salt = await bcrypt.genSalt(10);
  let cryptedPassword = await bcrypt.hash("@Password123", salt);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `SELECT * FROM ${dbTable} where email = ? and username = ?`,
    [req.body.email, req.body.userName],
    function (err, results) {
      if (results.length > 0) {
        return res
          .status(400)
          .send(
            "THE EMAIL ADDRESS /USERNAME IS ALREADY IN USE, PLEASE TRY AGAIN."
          );
      } else {
        let fullName = req.body.firstName + " " + req.body.lastName;
        db.query(
          `INSERT INTO ${dbTable} (userRank,armedForce,serviceNumber,userName,firstName,lastName,email,password,avatarUrl,lastLogin) VALUES(?,?,?,?,?,?,?,?,?,?)`,
          [
            req.body.rank,
            req.body.armedForce,
            req.body.serviceNumber,
            req.body.userName,
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            cryptedPassword,
            req.body.avatarUrl,
            currentDateTime.toLocaleDateString(),
          ],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("User could not be Created");
            } else {
              sendWelcomeEmail(
                req.body.email,
                "ACCOUNT CREATION",
                "Please note that your Account has been created successfully",
                fullName,
                "",
                "@Password123"
              );

              res.send("User Created Successfully");
            }
          }
        );
      }
    }
  );
});

// Update user by id
router.put("/profile/:id", [auth], async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} where userId = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `UPDATE ${dbTable} SET armedForce =? ,userRank =? ,userName =? , firstName =? , lastName =?,avatarUrl =?  WHERE userId = ? `,
          [
            req.body.armedForce,
            req.body.rank,
            req.body.userName,
            req.body.firstName,
            req.body.lastName,

            req.body.avatarUrl,
            req.params.id,
          ],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("User could not be Updated");
            } else {
              // res.send("User Updated Successfully");
              db.query(
                `SELECT * FROM ${dbTable} where userId =?`,
                [req.params.id],
                async function (err, results) {
                  if (results.length == 1) {
                    const user = results[0];
                    const token = generateAuthToken(user);
                    res.send(token);
                  } else {
                    return res.status(404).send("User Not Found.");
                  }
                }
              );
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The user with the given ID could not be  Found.");
      }
    }
  );
});

// Delete user by id
router.delete("/:id", [auth], async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} where userId = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `DELETE FROM ${dbTable}  WHERE userId = ? `,
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("User could not be Deleted");
            } else {
              res.send("User Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The User withe given ID could not be  Found.");
      }
    }
  );
});

function validateUsers(user) {
  const schema = {
    armedForce: Joi.string().min(2).max(100).required(),
    rank: Joi.string().min(2).max(100).required(),
    userName: Joi.string().min(2).max(50).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(2).max(50).required(),
    // password: Joi.string().min(2).max(500).required(),
    serviceNumber: Joi.string().min(2).max(100).required(),
    avatarUrl: Joi.allow(""),
  };
  return Joi.validate(user, schema);
}

module.exports = router;

const Joi = require("joi");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const dbTable = "conversation_reply";
const auth = require("../middleware/auth");

// Show messages by conversation_id
router.get("/:conversation_id", [auth], async (req, res) => {
  db.query(
    `SELECT U.userId,R.id,R.created,R.message,U.userName,U.firstName,U.lastName,U.email,U.avatarUrl,U.userRank, FROM users U,conversation_reply R WHERE R.conversationId = ? AND R.userId = U.userId ORDER BY R.id ASC`,
    [req.params.conversation_id],
    function (err, results) {
      res.send(results);
    }
  );
});

// Create message
router.post("/", [auth], async (req, res) => {
  const { error } = validateMessage(req.body);
  const currentDateTime = new Date();
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `INSERT INTO ${dbTable} (message,userId,conversationId) VALUES(?,?,?)`,
    [req.body.message, req.body.userId, req.body.conversationId],
    function (err, results) {
      if (err) {
        console.log(err);
        res.status(500).send("Message could not be Created");
      } else {
        res.send("Message Created Successfully");
      }
    }
  );
  // db.query(
  //   `SELECT * FROM ${dbTable} where message = ? And userId = ? And conversationId = ?`,
  //   [req.body.message, req.body.userId, req.body.conversationId],
  //   function (err, results) {
  //     if (results.length > 0) {
  //       return res.status(400).send("This message exist already");
  //     } else {
  //       db.query(
  //         `INSERT INTO ${dbTable} (message,userId,conversationId) VALUES(?,?,?)`,
  //         [req.body.message, req.body.userId, req.body.conversationId],
  //         function (err, results) {
  //           if (err) {
  //             console.log(err);
  //             res.status(500).send("Message could not be Created");
  //           } else {
  //             res.send("Message Created Successfully");
  //           }
  //         }
  //       );
  //     }
  //   }
  // );
});

// Update message by id
router.put("/:id", [auth], async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} where id = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `UPDATE ${dbTable} SET message = ? WHERE id = ? `,
          [req.body.message, req.params.id],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("Message could not be Updated");
            } else {
              res.send("Message Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The Message with the given ID could not be  Found.");
      }
    }
  );
});

// Delete message by id
router.delete("/:id", [auth], async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} where id = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `DELETE FROM ${dbTable}  WHERE id = ? `,
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("Message could not be Deleted");
            } else {
              res.send("Message Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The Message with the given ID could not be  Found.");
      }
    }
  );
});

function validateMessage(message) {
  const schema = {
    message: Joi.string().min(1).required(),
    userId: Joi.number(),
    conversationId: Joi.number(),
  };
  return Joi.validate(message, schema);
}

module.exports = router;

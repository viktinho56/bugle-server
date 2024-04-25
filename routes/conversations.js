const Joi = require("joi");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const dbTable = "conversations";
const auth = require("../middleware/auth");

// Show user conversations by id
router.get("/:id", [auth], async (req, res) => {
  db.query(
    `SELECT U.userId,C.id,C.created,U.userName,U.firstName,U.lastName,U.email,U.avatarUrl,(SELECT CR.message FROM conversation_reply CR WHERE CR.conversationId =C.id ORDER BY CR.id DESC LIMIT 0,1) as lastMessage
    ,(SELECT CR.created FROM conversation_reply CR WHERE CR.conversationId =C.id ORDER BY CR.id DESC LIMIT 0,1) as lastMessageDate
FROM users U,conversations C
WHERE 
CASE

WHEN C.senderId = ${req.params.id}
THEN C.receiverId = U.userId
WHEN C.receiverId = ${req.params.id}
THEN C.senderId = U.userId
END

AND
(C.senderId =${req.params.id} OR C.receiverId =${req.params.id}) ORDER BY C.id DESC`,
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res
          .status(404)
          .send("The conversation with the given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// Create conversation

router.post("/", [auth], async (req, res) => {
  const { error } = validateConversation(req.body);
  const currentDateTime = new Date();
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `SELECT * FROM ${dbTable} WHERE (senderId=? AND receiverId=?) OR (senderId=? AND receiverId=?)`,
    [
      req.body.senderId,
      req.body.receiverId,
      req.body.receiverId,
      req.body.senderId,
    ],
    function (err, results) {
      let conversationId = 0;
      if (results.length > 0) {
        conversationId = results[0].id;
        return res.send({
          conversationId: conversationId,
          message: "Conversation Exist Already",
        });
      } else {
        db.query(
          `INSERT INTO ${dbTable} (senderId,receiverId) VALUES(?,?)`,
          [req.body.senderId, req.body.receiverId],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("Conversation could not be Created");
            } else {
              conversationId = results.insertId;
              return res.send({
                conversationId: conversationId,
                message: "Conversation Created Successfully",
              });
              // res.send("Conversation Created Successfully");
            }
          }
        );
      }
    }
  );
});

// Delete conversation by id
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
              res.status(500).send("Conversation could not be Deleted");
            } else {
              res.send("Conversation Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The Conversation with the given ID could not be  Found.");
      }
    }
  );
});

function validateConversation(conversation) {
  const schema = {
    senderId: Joi.number().required(),
    receiverId: Joi.number().required(),
  };
  return Joi.validate(conversation, schema);
}

module.exports = router;

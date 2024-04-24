const Joi = require("joi");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const auth = require("../middleware/auth");

//Show all comments by id
router.get("/:id", [auth], async (req, res) => {
  db.query(
    "SELECT U.userId,U.userRank,U.firstName,U.lastName,U.email,U.avatarUrl,PC.postCommentId,PC.postId,PC.comments,PC.created FROM users U, posts_comments PC WHERE U.userId = PC.userId AND PC.postId = ? ORDER BY PC.postCommentId DESC",
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res.status(404).send("No record found");
      } else {
        let data = results;

        res.send(data);
      }
    }
  );
});

// Create comment
router.post("/", [auth], async (req, res) => {
  console.log(req.body);
  const { error } = validateComments(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT * FROM `posts_comments` where userId = ? AND comments = ?",
    [req.body.userId, req.body.comments],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("Duplicate Comment Found");
      } else {
        db.query(
          "INSERT INTO `posts_comments` (postId,userId,comments) VALUES(?,?,?)",
          [req.body.postId, req.body.userId, req.body.comments],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("Comment could not be Added");
            } else {
              res.status(200).send("Comment Added Successfully");
            }
          }
        );
      }
    }
  );
});

// Update comment by id
router.put("/:id", [auth], async (req, res) => {
  console.log(req.body);
  db.query(
    "SELECT * FROM `posts_comments` where postCommentId = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `posts_comments` SET `comments` =?  WHERE `postCommentId` = ?",
          [req.body.comments, req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("comment could not be Updated");
            } else {
              res.status(200).send("comment Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The comment withe given ID could not be  Found.");
      }
    }
  );
});

// Delete comment by id
router.delete("/:id", [auth], async (req, res) => {
  db.query(
    "SELECT * FROM `posts_comments` where postCommentId = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `posts_comments`  WHERE `postCommentId` = ? ",
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("comment could not be Deleted");
            } else {
              res.send("comment Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The comment withe given ID could not be  Found.");
      }
    }
  );
});

function validateComments(comments) {
  const schema = {
    userId: Joi.number().min(1).required(),
    postId: Joi.number().min(1).required(),
    comments: Joi.string().trim().min(1).required(),
  };
  return Joi.validate(comments, schema);
}

module.exports = router;

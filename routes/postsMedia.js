const Joi = require("joi");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const auth = require("../middleware/auth");

//Show all post media by id
router.get("/:id", [auth], async (req, res) => {
  db.query(
    "SELECT * FROM posts_media WHERE postId = ? ORDER BY postMediaId DESC",
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

// Create media
router.post("/", [auth], async (req, res) => {
  console.log(req.body);
  const { error } = validatePostMedia(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "INSERT INTO `posts_media` (postId,postMediaUrl,postMediaType,thumbNail) VALUES(?,?,?,?)",
    [
      req.body.postId,
      req.body.postMediaUrl,
      req.body.postMediaType,
      req.body.postMediaThumb,
    ],
    function (err, results) {
      if (err) {
        console.log(err);
        res.status(500).send("Media could not be Added");
      } else {
        res.status(200).send("Media Added Successfully");
      }
    }
  );
});

// Delete media by id
router.delete("/:id", [auth], async (req, res) => {
  db.query(
    "SELECT * FROM `posts_media` where postMediaId = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `posts_media`  WHERE `postMediaId` = ? ",
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("media could not be Deleted");
            } else {
              res.send("media Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The media withe given ID could not be  Found.");
      }
    }
  );
});

function validatePostMedia(media) {
  const schema = {
    postId: Joi.number().min(1).required(),
    postMediaUrl: Joi.string().trim().min(1).required(),
    postMediaType: Joi.number().min(1).required(),
    postMediaThumb: Joi.string().trim().allow(""),
  };
  return Joi.validate(media, schema);
}

module.exports = router;

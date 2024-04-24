const Joi = require("joi");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const auth = require("../middleware/auth");

//Show all likes by id
router.get("/:id", [auth], async (req, res) => {
  db.query(
    "SELECT U.userId,U.userRank,U.firstName,U.lastName,U.email,U.avatarUrl,PL.postId,PL.created FROM users U, posts_likes PL WHERE U.userId = PL.userId AND PL.postId = ? ORDER BY PL.postLikeId DESC",
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
  const { error } = validateLikes(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT * FROM `posts_likes` where userId = ? AND postId = ?",
    [req.body.userId, req.body.postId],
    function (err, results) {
      if (results.length > 0) {
        const { postLikeId } = results[0];
        db.query(
          "DELETE FROM `posts_likes`  WHERE `postLikeId` = ? ",
          [postLikeId],
          function (err, results) {
            if (err) {
              res.status(500).send("like could not be Deleted");
            } else {
              res.send("Deleted Successfully");
            }
          }
        );
      } else {
        db.query(
          "INSERT INTO `posts_likes` (postId,userId) VALUES(?,?)",
          [req.body.postId, req.body.userId],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("An error has occurred");
            } else {
              res.status(200).send("Post liked Successfully");
            }
          }
        );
      }
    }
  );
});

// // Update comment by id
// router.put("/:id", [auth], async (req, res) => {
//   console.log(req.body);
//   db.query(
//     "SELECT * FROM `posts_comments` where postCommentId = ?",
//     [req.params.id],
//     function (err, results) {
//       if (results.length > 0) {
//         db.query(
//           "UPDATE `posts_comments` SET `comments` =?  WHERE `postCommentId` = ?",
//           [req.body.comments, req.params.id],
//           function (err, results) {
//             if (err) {
//               res.status(500).send("comment could not be Updated");
//             } else {
//               res.status(200).send("comment Updated Successfully");
//             }
//           }
//         );
//       } else {
//         return res
//           .status(404)
//           .send("The comment withe given ID could not be  Found.");
//       }
//     }
//   );
// });

// // Delete comment by id
// router.delete("/:id", [auth], async (req, res) => {
//   db.query(
//     "SELECT * FROM `posts_comments` where postCommentId = ?",
//     [req.params.id],
//     function (err, results) {
//       if (results.length > 0) {
//         db.query(
//           "DELETE FROM `posts_comments`  WHERE `postCommentId` = ? ",
//           [req.params.id],
//           function (err, results) {
//             if (err) {
//               res.status(500).send("comment could not be Deleted");
//             } else {
//               res.send("comment Deleted Successfully");
//             }
//           }
//         );
//       } else {
//         return res
//           .status(404)
//           .send("The comment withe given ID could not be  Found.");
//       }
//     }
//   );
// });

function validateLikes(like) {
  const schema = {
    userId: Joi.number().min(1).required(),
    postId: Joi.number().min(1).required(),
  };
  return Joi.validate(like, schema);
}

module.exports = router;

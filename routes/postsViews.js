const Joi = require("joi");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const auth = require("../middleware/auth");

//Show all comments by id
router.get("/:id", [auth], async (req, res) => {
  db.query(
    "SELECT U.userId,U.userRank,U.firstName,U.lastName,U.email,U.avatarUrl,PV.postId,PV.created FROM users U, posts_views PV WHERE U.userId = PV.userId AND PV.postId = ? ORDER BY PV.postViewId DESC",
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

// Create view
router.post("/", [auth], async (req, res) => {
  console.log(req.body);
  const { error } = validateComments(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT * FROM `posts_views` where userId = ? AND postId = ?",
    [req.body.userId, req.body.postId],
    function (err, results) {
      if (results.length > 0) {
        return res.status(200).send("Success");
      } else {
        db.query(
          "INSERT INTO `posts_views` (postId,userId) VALUES(?,?)",
          [req.body.postId, req.body.userId],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("Could not be Added");
            } else {
              res.status(200).send("Added Successfully");
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

function validateViews(views) {
  const schema = {
    userId: Joi.number().min(1).required(),
    postId: Joi.number().min(1).required(),
  };
  return Joi.validate(views, schema);
}

module.exports = router;

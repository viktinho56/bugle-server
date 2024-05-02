const Joi = require("joi");
const _ = require("lodash");
const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const auth = require("../middleware/auth");

//Show all posts by id
router.get("/:id", [auth], async (req, res) => {
  db.query(
    `SELECT U.userId,U.userRank,U.firstName,U.lastName,U.email,U.avatarUrl,P.postId,P.postContent,
(SELECT COUNT(*) FROM posts_likes PL WHERE PL.postId=P.postId) AS likesCount, 
(SELECT COUNT(*) FROM posts_comments PC WHERE PC.postId=P.postId) AS commentsCount, 
(SELECT COUNT(*) FROM posts_likes PL WHERE PL.postId=P.postId AND PL.userId=?) AS userLikesCount,
(SELECT M.postMediaUrl FROM posts_media M WHERE M.postId=P.postId) AS postMediaUrl,
(SELECT M.postMediaType FROM posts_media M WHERE M.postId=P.postId) AS postMediaType,
(SELECT M.thumbNail FROM posts_media M WHERE M.postId=P.postId) AS postMediaThumbNail,
P.created, P.status FROM users U, posts P WHERE U.userId = P.userId AND p.status = ? ORDER BY P.postId DESC`,
    [req.params.id, 1],
    function (err, results) {
      let dataArray = [];
      if (results.length == 0) {
        res.send(dataArray);
      } else {
        let data = results;

        for (let index = 0; index < data.length; index++) {
          const element = data[index];
          let obj = {
            postId: element.postId,
            hashTag: "",
            rePosts: 0,
            showThread: false,
            postInfoText: "",
            post: element.postContent,
            profilePicture: element.avatarUrl,
            name: element.firstName + " " + element.lastName,
            tag: "",
            likes: element.likesCount,
            hasCheckMark: false,
            time: element.created,
            image:
              element.postMediaType == 1
                ? element.postMediaUrl
                : element.postMediaThumbNail,
            userId: element.userId,
            isUserLiked: element.userLikesCount > 0 ? true : false,
            videoLink: element.postMediaType == 2 ? element.postMediaUrl : "",
            isVideo: element.postMediaType == 2 ? true : false,
            group: "",
            relativeTime: moment(element.created).fromNow(),
            commentCount: element.commentsCount,
            comments: [],
          };
          dataArray.push(obj);
        }
        res.send(dataArray);
      }
    }
  );
});

//Show all posts by id
router.get("/user_posts/:id", [auth], async (req, res) => {
  db.query(
    `SELECT U.userId,U.userRank,U.firstName,U.lastName,U.email,U.avatarUrl,P.postId,P.postContent,
(SELECT COUNT(*) FROM posts_likes PL WHERE PL.postId=P.postId) AS likesCount, 
(SELECT COUNT(*) FROM posts_comments PC WHERE PC.postId=P.postId) AS commentsCount, 
(SELECT COUNT(*) FROM posts_likes PL WHERE PL.postId=P.postId AND PL.userId=?) AS userLikesCount,
(SELECT M.postMediaUrl FROM posts_media M WHERE M.postId=P.postId) AS postMediaUrl,
(SELECT M.postMediaType FROM posts_media M WHERE M.postId=P.postId) AS postMediaType,
(SELECT M.thumbNail FROM posts_media M WHERE M.postId=P.postId) AS postMediaThumbNail,
P.created, P.status FROM users U, posts P WHERE U.userId = P.userId AND P.userId = ? ORDER BY P.postId DESC`,
    [req.params.id, req.params.id],
    function (err, results) {
      let dataArray = [];
      if (results.length == 0) {
        res.send(dataArray);
      } else {
        let data = results;

        for (let index = 0; index < data.length; index++) {
          const element = data[index];
          let obj = {
            postId: element.postId,
            hashTag: "",
            rePosts: 0,
            showThread: false,
            postInfoText: "",
            post: element.postContent,
            profilePicture: element.avatarUrl,
            name: element.firstName + " " + element.lastName,
            tag: "",
            likes: element.likesCount,
            hasCheckMark: false,
            time: element.created,
            image:
              element.postMediaType == 1
                ? element.postMediaUrl
                : element.postMediaThumbNail,
            userId: element.userId,
            isUserLiked: element.userLikesCount > 0 ? true : false,
            videoLink: element.postMediaType == 2 ? element.postMediaUrl : "",
            isVideo: element.postMediaType == 2 ? true : false,
            group: "",
            relativeTime: moment(element.created).fromNow(),
            commentCount: element.commentsCount,
            comments: [],
          };
          dataArray.push(obj);
        }
        res.send(dataArray);
      }
    }
  );
});

//Show all posts by status
router.get("/status/:status", [auth], async (req, res) => {
  db.query(
    "SELECT U.userId,U.userRank,U.firstName,U.lastName,U.email,U.avatarUrl,P.postId,P.postContent,(SELECT COUNT(*) FROM posts_likes PL WHERE PL.postId=P.postId) AS likesCount,(SELECT COUNT(*) FROM posts_comments PC WHERE PC.postId=P.postId) AS commentsCount,P.created,P.status,M.postMediaUrl,M.postMediaType FROM users U, posts P,posts_media M  WHERE U.userId = P.userId AND M.postId = P.postId AND P.status = ? ORDER BY P.postId DESC",
    [req.params.status],
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

//Show posts by id
router.get("/:id", [auth], async (req, res) => {
  db.query(
    "SELECT * FROM posts WHERE postId = ?",
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res.status(404).send("The posts withe given ID could not be  Found.");
      } else {
        let data = results[0];
        db.query(
          `SELECT * FROM posts_media WHERE postMediaId = ?`,
          [results[0].postId],
          function (err, results) {
            console.log(results);
            data.postMedia = results;
            res.send(data);
          }
        );
        //res.send(results);
      }
    }
  );
});

//Show all posts count
router.get("/count/all", [auth], async (req, res) => {
  db.query(
    `SELECT DISTINCT (SELECT COUNT(*) FROM posts p, posts_media pm WHERE pm.postId = p.postId AND pm.postMediaType = 0 ) AS textPostCount,
 (SELECT COUNT(*) FROM posts p, posts_media pm WHERE pm.postId = p.postId AND pm.postMediaType = 1) AS mediaPostCount,
  (SELECT COUNT(*) FROM posts p WHERE p.status  = 2) AS archivedPostCount , (SELECT COUNT(*) FROM posts p WHERE p.status  = 1) AS activePostCount ,
  (SELECT COUNT(*) FROM posts p) AS totalPostCount 
FROM posts`,
    function (err, results) {
      console.log(err);
      res.send(results);
    }
  );
});

// // Create posts by id
// router.post("/", [auth], async (req, res) => {
//   console.log(req.body);
//   const { error } = validatePosts(req.body);
//   if (error) return res.status(400).send(error.details[0].message);
//   db.query(
//     "SELECT * FROM `posts` where userId = ? AND postContent = ?",
//     [req.body.userId, req.body.postContent],
//     function (err, results) {
//       if (results.length > 0) {
//         return res.status(400).send("Duplicate Posts Found");
//       } else {
//         db.query(
//           "INSERT INTO `posts` (userId,postContent,status) VALUES(?,?,?)",
//           [req.body.userId, req.body.postContent, req.body.status],
//           function (err, results) {
//             if (err) {
//               console.log(err);
//               res.status(500).send("posts could not be Created");
//             } else {
//               res.status(200).send("posts Created Successfully");
//             }
//           }
//         );
//       }
//     }
//   );
// });

// Create posts by id
router.post("/", [auth], async (req, res) => {
  console.log(req.body);
  const { error } = validatePosts(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT * FROM `posts` where userId = ? AND postContent = ?",
    [req.body.userId, req.body.postContent],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("Duplicate Posts Found");
      } else {
        db.query(
          "INSERT INTO `posts` (userId,postContent,status) VALUES(?,?,?)",
          [req.body.userId, req.body.postContent, 1],
          function (err, results) {
            let postObject = results;
            console.log(postObject.insertId);
            if (err) {
              console.log(err);
              res.status(500).send("posts could not be Created");
            } else {
              let postId = postObject.insertId;
              if (req.body.postMedia) {
                for (
                  let index = 0;
                  index < req.body.postMedia.length;
                  index++
                ) {
                  const element = req.body.postMedia[index];
                  db.query(
                    "INSERT INTO `posts_media` (postId,postMediaUrl,postMediaType,thumbNail) VALUES(?,?,?,?)",
                    [
                      postId,
                      element.mediaUrl,
                      element.mediaType,
                      element.mediaThumb,
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
                }
              }
              res.status(200).send("posts Created Successfully");
            }
          }
        );
      }
    }
  );
});

// Update posts by id
router.put("/:id", [auth], async (req, res) => {
  console.log(req.body);
  db.query(
    "SELECT * FROM `posts` where postId = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `posts` SET `userId` =? ,`postContent` =? ,  `status` =? WHERE `postId` = ?",
          [
            req.body.userId,
            req.body.postContent,
            req.body.status,
            req.params.id,
          ],
          function (err, results) {
            if (err) {
              res.status(500).send("posts could not be Updated");
            } else {
              res.status(200).send("posts Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The posts withe given ID could not be  Found.");
      }
    }
  );
});

// Update posts by status
router.put("/update-status/:id/:status", [auth], async (req, res) => {
  db.query(
    "SELECT * FROM `posts` where postId = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `posts` SET `status` =? WHERE `postId` = ?",
          [req.params.status, req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("posts could not be Updated");
            } else {
              res.status(200).send("posts Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The posts withe given ID could not be  Found.");
      }
    }
  );
});

// Delete posts by id
router.delete("/:id", [auth], async (req, res) => {
  db.query(
    "SELECT * FROM `posts` where postId = ?",
    [req.params.postId],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `posts`  WHERE `postId` = ? ",
          [req.params.postId],
          function (err, results) {
            if (err) {
              res.status(500).send("posts could not be Deleted");
            } else {
              res.send("posts Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The posts withe given ID could not be  Found.");
      }
    }
  );
});

function validatePosts(posts) {
  const schema = {
    userId: Joi.number().min(1).required(),
    postContent: Joi.string().trim().strict().min(2).required(),
    postMedia: Joi.array().items(
      Joi.object({
        mediaUrl: Joi.string().allow(""),
        mediaType: Joi.number().allow(""),
        mediaThumb: Joi.string().allow(""),
      })
    ),
    //status: Joi.number().min(1).required(),
  };
  return Joi.validate(posts, schema);
}

module.exports = router;

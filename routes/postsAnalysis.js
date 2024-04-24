const config = require("config");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const auth = require("../middleware/auth");

// // Show All Users
// router.get("/", [auth], async (req, res) => {
//   db.query(
//     `SELECT U.userId,U.userRank,U.firstName,U.lastName,U.email,U.avatarUrl,U.created,(SELECT COUNT(*) FROM posts P WHERE U.UserId = P.UserId) as postsCount
// FROM
// users U ORDER BY U.userId`,
//     function (err, results) {
//       console.log(err);
//       res.send(results);
//     }
//   );
// });

// Show users
router.get("/", [auth], async (req, res) => {
  let start = 0,
    end = 5;
  db.query(
    `SELECT U.userId,U.userRank,U.firstName,U.lastName,U.email,U.avatarUrl,U.created,(SELECT COUNT(*) FROM posts P WHERE U.UserId = P.UserId) as postsCount,(SELECT COUNT(*) FROM posts P) as totalPostsCount
FROM 
users U ORDER BY U.userId DESC LIMIT ${start},${end}`,
    function (err, results) {
      console.log(err);
      res.send(results);
    }
  );
});

module.exports = router;

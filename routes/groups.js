const Joi = require("joi");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const dbTable = "postGroups";
const auth = require("../middleware/auth");

// Show user groups by id
router.get("/", [auth], async (req, res) => {
  db.query(`SELECT * FROM ${dbTable}`, function (err, results) {
    if (results.length == 0) {
      res.status(404).send("The groups with the given ID could not be  Found.");
    } else {
      res.send(results);
    }
  });
});

router.get("/pagination/", [auth], async (req, res) => {
  console.log(req.query);
  let { start, end } = req.query;
  db.query(
    `SELECT G.id, G.groupName,G.groupDesc,(SELECT COUNT(*) FROM postGroups G) as groupsCount
FROM 
postGroups G ORDER BY G.id ASC LIMIT ${start},${end}`,
    function (err, results) {
      console.log(err);
      res.send(results);
    }
  );
});

router.get("/members/:id", [auth], async (req, res) => {
  console.log(req.query);
  db.query(
    `SELECT U.userId,U.armedForce,U.serviceNumber,U.userRank,U.firstName,U.lastName,U.email,U.avatarUrl,U.created,U.status,U.userName, G.id,(SELECT COUNT(*) FROM postGroupUsers G) as groupsCount
FROM 
postGroupUsers G,users U WHERE G.postGroupId = ?  AND G.userId = U.userId ORDER BY G.id ASC`,
    [req.params.id],
    function (err, results) {
      console.log(err);
      res.send(results);
    }
  );
});

// Create groups
router.post("/", [auth], async (req, res) => {
  const { error } = validateGroup(req.body);
  const currentDateTime = new Date();
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `INSERT INTO ${dbTable} (groupName,groupDesc) VALUES(?,?)`,
    [req.body.groupName, req.body.groupDesc],
    function (err, results) {
      if (err) {
        console.log(err);
        res.status(500).send("groups could not be Created");
      } else {
        groupsId = results.insertId;
        return res.send({
          groupsId: groupsId,
          message: "groups Created Successfully",
        });
        // res.send("groups Created Successfully");
      }
    }
  );
});

// Create groups
router.post("/add", [auth], async (req, res) => {
  db.query(
    `SELECT * FROM postGroupUsers where userId = ? AND postGroupId =?`,
    [req.body.userId, req.body.postGroupId],
    function (err, results) {
      if (results.length == 1) {
        return res.status(400).send("User has been added before");
      } else {
        db.query(
          `INSERT INTO postGroupUsers (userId,postGroupId) VALUES(?,?)`,
          [req.body.userId, req.body.postGroupId],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("Could not be Added");
            } else {
              //groupsId = results.insertId;
              //  return res.send({
              //    groupsId: groupsId,
              //    message: "groups Created Successfully",
              //  });
              res.send("User Added Successfully");
            }
          }
        );
      }
    }
  );
});

// Edit groups
router.put("/:id", [auth], async (req, res) => {
  db.query(
    `UPDATE ${dbTable} SET groupName = ?, groupDesc = ? WHERE id =?`,
    [req.body.groupName, req.body.groupDesc, req.params.id],
    function (err, results) {
      if (err) {
        res.status(500).send("group could not be Updated");
      } else {
        // groupsId = results.insertId;
        // return res.send({
        //   groupsId: groupsId,
        //   message: "groups Created Successfully",
        // });
        res.send("groups Updated Successfully");
      }
    }
  );
});

// Delete groups by id
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
              res.status(500).send("groups could not be Deleted");
            } else {
              res.send("groups Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The groups with the given ID could not be  Found.");
      }
    }
  );
});

// Delete groups by id
router.delete("/remove/:id", [auth], async (req, res) => {
  console.log(req.params.id);
  db.query(
    `SELECT * FROM postGroupUsers where id = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `DELETE FROM postGroupUsers  WHERE id = ? `,
          [req.params.id],
          function (err, results) {
            console.log(err);
            if (err) {
              res.status(500).send("group  member could not be Deleted");
            } else {
              res.send("group member Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The groups with the given ID could not be  Found.");
      }
    }
  );
});

function validateGroup(groups) {
  const schema = {
    groupName: Joi.string().required(),
    groupDesc: Joi.string().required(),
  };
  return Joi.validate(groups, schema);
}

module.exports = router;

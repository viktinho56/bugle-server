const Joi = require("joi");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const dbTable = "events";
const auth = require("../middleware/auth");

// Show events
router.get("/", [auth], async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} ORDER BY id DESC`,
    function (err, results) {
      console.log(err);
      res.send(results);
    }
  );
});

// Show event by id
router.get("/:id", [auth], async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} WHERE id = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res
          .status(404)
          .send("The event with the given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// Create event
router.post("/", [auth], async (req, res) => {
  const { error } = validateEvents(req.body);
  const currentDateTime = new Date();
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `SELECT * FROM ${dbTable} where eventName = ? and eventStartDate = ?`,
    [req.body.eventName, req.body.eventStartDate],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("This event exist already");
      } else {
        db.query(
          `INSERT INTO ${dbTable} (eventName,eventDescription,eventLocation,eventStartDate,eventStartTime,eventEndDate,eventEndTime,isAllDay) VALUES(?,?,?,?,?,?,?,?)`,
          [
            req.body.eventName,
            req.body.eventDescription,
            req.body.eventLocation,
            req.body.eventStartDate,
            req.body.eventStartTime,
            req.body.eventEndDate,
            req.body.eventEndTime,
            req.body.isAllDay,
          ],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("Event could not be Created");
            } else {
              res.send("Event Created Successfully");
            }
          }
        );
      }
    }
  );
});

// Update event by id
router.put("/:id", [auth], async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} where id = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `UPDATE ${dbTable} SET eventName = ?,eventDescription= ?,eventLocation= ?,eventStartDate= ?,eventStartTime= ?,eventEndDate= ?,eventEndTime= ?,isAllDay= ?  WHERE id = ? `,
          [
            req.body.eventName,
            req.body.eventDescription,
            req.body.eventLocation,
            req.body.eventStartDate,
            req.body.eventStartTime,
            req.body.eventEndDate,
            req.body.eventEndTime,
            req.body.isAllDay,
            req.params.id,
          ],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("Event could not be Updated");
            } else {
              res.send("Event Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The event with the given ID could not be  Found.");
      }
    }
  );
});

// Delete user by id
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
              res.status(500).send("Event could not be Deleted");
            } else {
              res.send("Event Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The Event with the given ID could not be  Found.");
      }
    }
  );
});

function validateEvents(event) {
  const schema = {
    eventName: Joi.string().min(2).max(250).required(),
    eventDescription: Joi.string().min(2).max(500).required(),
    eventStartDate: Joi.allow(""),
    eventStartTime: Joi.allow(""),
    eventEndDate: Joi.allow(""),
    eventEndTime: Joi.allow(""),
    eventLocation: Joi.string().min(2).max(250).required(),
    isAllDay: Joi.boolean().default(false),
  };
  return Joi.validate(event, schema);
}

module.exports = router;

// Requiring the module
const reader = require("xlsx");
const db = require("./startup/db")();
// Reading our test file
const file = reader.readFile("./new_data.xlsx");

let data = [];

const sheets = file.SheetNames;

for (let i = 0; i < sheets.length; i++) {
  const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
  temp.forEach((res) => {
    let data = {
      facility_name: res.FACILITY,
      facility_code: res.CODE,
      facility_state: res.STATE,
      facility_lga: res.LGA,
      is_active: 1,
    };
    insertIntoDB(data);
    // data.push(res);
  });
}
function insertIntoDB(data) {
  db.query(
    "SELECT * FROM `facility` where facility_name = ? AND facility_lga = ?  AND facility_state =?",
    [data.facility_name, data.facility_lga, data.facility_state],
    function (err, results) {
      if (results.length > 0) {
        console.log("Duplicate Facility Found.");
      } else {
        db.query(
          "INSERT INTO `facility` (facility_name,facility_code,facility_state,facility_lga,is_active) VALUES(?,?,?,?,?)",
          [
            data.facility_name,
            data.facility_code,
            data.facility_state,
            data.facility_lga,
            data.is_active,
          ],
          function (err, results) {
            if (err) {
              console.log("Facility could not be Created");
            } else {
              console.log("Facility Created Successfully");
            }
          }
        );
      }
    }
  );
}

// Printing data
console.log(data);

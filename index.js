const winston = require("winston");
const config = require("config");
const express = require("express");
const app = express();

const http = require("http").Server(app);
require("./startup/logging")();
require("./startup/cors")(app);

const socketIO = require("socket.io")(http, {
  cors: {
    origin: config.get("client_url"),
  },
});

//Add this before the app.get() block
socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  //sends the message to all the users on the server
  socket.on("message", (data) => {
    console.log(data);
    socketIO.emit("messageResponse", data);
  });
  socket.on("typing", (data) => {
    socket.broadcast.emit("typingResponse", data);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
});

require("./startup/routes")(app);
require("./startup/config")();
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
const port = process.env.PORT || config.get("port");

http.listen(port, () => {
  winston.info(`Listening on port ${port}...`);
});

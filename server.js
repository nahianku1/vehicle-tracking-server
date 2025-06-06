const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "*", // React dev server
  })
);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // React dev server
  },
});

let drivers = {}; // store driverId => { lat, lng }

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("driver:location", (data) => {
    console.log(data);

    const { driverId, lat, lng } = data;
    drivers[driverId] = { lat, lng };
    io.emit("driver:update", { driverId, lat, lng });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.get("/drivers", (req, res) => {
  res.json(drivers);
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

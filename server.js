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

const getOnlineDrivers = () => {
  let drivers = [];
  const socketIds = [...io.sockets.adapter.sids.keys()];

  for (const socketId of socketIds) {
    const socket = io.sockets.sockets.get(socketId);

    drivers.push({
      id: socket.id,
      lat: socket.lat,
      lng: socket.lng,
    });
  }
  return drivers;
};
// store driverId => { lat, lng }

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("driver:location", (data) => {
    const { lat, lng } = data;
    socket.lat = lat;
    socket.lng = lng;
    const onlineDrivers = getOnlineDrivers();
    console.log(onlineDrivers);
    
    io.emit("driver:update", onlineDrivers);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    io.emit("driver:update", getOnlineDrivers());
  });
});

app.get("/drivers", (req, res) => {
  res.json(drivers);
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: 'http://localhost:3000', // Replace with your frontend URL
      methods: ['GET', 'POST'], // Add the methods you need
      allowedHeaders: ['my-custom-header'],
      credentials: true,
    },
  });
// Room data structure
const rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinRoom', (roomId) => {
    console.log(rooms, roomId)
    socket.join(roomId);
    
    if (!rooms[roomId]) {
      rooms[roomId] = {
        bedroom: {
          light1: false,
          light2: false,
        },
        kitchen: {
          light1: false,
          light2: false,
        },
      };
    }
    io.to(roomId).emit('updateLights', rooms[roomId]);
  });

  socket.on('updateLights', (roomData) => {
    console.log(roomData);
    if (roomData && roomData.bedroom) {
        console.log("check");
        setBedroomLights({
            light1: roomData.bedroom.light1,
            light2: roomData.bedroom.light2,
        });
    }
    if (roomData && roomData.kitchen) {
        setKitchenLights({
            light1: roomData.kitchen.light1,
            light2: roomData.kitchen.light2,
        });
    }
});
socket.on('toggleLight', ({ roomId, roomType, light }) => {
    console.log("first", roomId, roomType, light)
    if (!rooms[roomId]) {
        rooms[roomId] = {};
    }
    if (!rooms[roomId][roomType]) {
        rooms[roomId][roomType] = {};
    }
    if (rooms[roomId][roomType].hasOwnProperty(light)) {
        rooms[roomId][roomType][light] = !rooms[roomId][roomType][light];
        io.to(roomId).emit('updateLights', rooms[roomId]);
    } else {
        console.error(`The property ${light} does not exist for room ${roomType}`);
    }
});

  socket.on('toggleBothLights', ({ roomId, roomType, light }) => {
    console.log("Received toggleBothLights event:", roomId, roomType, light);
    if (!rooms[roomId]) {
      rooms[roomId] = {};
    }
    if (!rooms[roomId][roomType]) {
      rooms[roomId][roomType] = {};
    }
    rooms[roomId][roomType].light1 = light.light1;
    rooms[roomId][roomType].light2 = light.light2;
    console.log("Updated rooms:", rooms);

    io.to(roomId).emit('updateLights', rooms[roomId]);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(8080, () => {
  console.log('Server running on port 8080');
});

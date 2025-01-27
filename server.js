const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let discussions = []; // Store previous discussions

// Serve static files from the "public" folder
app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send existing discussions to the client
  socket.emit('load discussions', discussions);

  // Handle creating a new discussion
  socket.on('new discussion', (topic) => {
    const discussion = { topic, messages: [] };
    discussions.push(discussion);
    io.emit('discussion created', discussion);
  });

  // Handle sending a message
  socket.on('send message', ({ topic, message }) => {
    const discussion = discussions.find(d => d.topic === topic);
    if (discussion) {
      discussion.messages.push(message);
      io.emit('receive message', { topic, message });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botname = "ChatBot";
//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Run when client connects
io.on("connection", socket => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //Welcome current user
    socket.emit("msg", formatMessage(botname, `Hello ${user.username}!`));

    //Broadcast when a user connects except user gets msg
    socket.broadcast
      .to(user.room)
      .emit(
        "msg",
        formatMessage(botname, `${user.username} has joined the chat`)
      );

    //Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  //Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "msg",
        formatMessage(botname, `${user.username} has left the chat`)
      );

      //Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });

  //Listen for chatMessage
  socket.on("chatMessage", msg => {
    const user = getCurrentUser(socket.id);

    //Broadcast to everyone
    io.to(user.room).emit("msg", formatMessage(user.username, msg));
  });

  io.emit("all", "Universal");
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

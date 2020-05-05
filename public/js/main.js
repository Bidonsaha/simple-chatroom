const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const roomUsers = document.getElementById("users");

//get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

//universal
socket.on("all", data => {
  for (let i = 0; i < 10; i++) console.log(data);
});

//join chatroom
socket.emit("joinRoom", { username, room });

//get room users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on("msg", data => {
  console.log(data);
  outputMessage(data);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", e => {
  e.preventDefault();

  //get text msg
  const msg = e.target.elements.msg.value;

  //send msg to server
  socket.emit("chatMessage", msg);

  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//output msg to DOM
function outputMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${msg.username}<span>${msg.time}</span></p>
    <p class="text">
      ${msg.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

//add user list in room
function outputUsers(users) {
  roomUsers.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join("")}
    `;
}

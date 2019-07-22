/* eslint-disable no-console */

// Create WebSocket connection using the native API
// https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API

// Server's address
const socket = new WebSocket('ws://localhost:3000/stream/');
// const socket = new WebSocket('wss://localhost:443/stream/');
// const socket = new WebSocket('wss://lifap5.univ-lyon1.fr:443/stream/');

// the global heartbeat's ID
let heartbeat_interval = null;

// Connection opened
socket.onopen = (event) => {
  // console.log('Server opening', event);
  const msg = {type : 'info', msg : "Hello server!", time: Date.now()};
  console.log(`Sent: ${JSON.stringify(msg)}`)
  socket.send(JSON.stringify(msg));

  // Set some heartbeat to the server. WebSocket native API does not support ping yet.
  // Nginx's timeout is 60s, so we take the half
  heartbeat_interval = setInterval(() => {
    const heartbeat = {type : 'heartbeat', time: Date.now()};
    console.log(`Sent: ${JSON.stringify(heartbeat)}`)
    socket.send(JSON.stringify(heartbeat));
  }, 30000)
};

// Connection closed
socket.onclose = (event) => {
  clearInterval(heartbeat_interval);
  console.log(`Server closing with code ${event.code}`);
};

// Listen for messages
socket.onmessage = (event) => {
  console.log(`Received: ${event.data}`);
  const item = document.createElement('li');
  item.appendChild(document.createTextNode(event.data));
  document.getElementById('messages').appendChild(item);
};

window.addEventListener('beforeunload', () => {
  // console.log('beforeunload');
  // here a 1005 code is sent
  clearInterval(heartbeat_interval);
  socket.close();
});

function send_message() {
  const txt = document.getElementById('input-msg').value;
  const msg = {type : 'msg', msg : txt}

  if (socket.readyState === WebSocket.OPEN){
    console.log(`Sent: "${JSON.stringify(msg)}"`);
    // See https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
    socket.send(JSON.stringify(msg));
  }
  else console.log(`Socket's state is ${socket.readyState}`);

}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  document.getElementById('btn-snd').onclick = send_message;
});

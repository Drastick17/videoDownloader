require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require('http');
const { Server } = require("socket.io");
const { RESOLVE } = require("./utils.js")

const PORT = process.env.PORT || 3002;
const app = express();

const server = http.createServer(app);
const io = new Server(server);
const sockets = {}

app.use(cors());

app.use(express.static(RESOLVE(""))); // FUNCIONO XD
app.use(express.json());

app.get("/", (req, res) => { res.sendFile(RESOLVE("index.html")) });
app.get("/mp3", (req, res) => { res.sendFile(RESOLVE("mp3.html")) });

io.on("connection", (socket) =>{
  console.log("connected")
  socket.on("connectInit", (sessionId) => {
    app.set("socketSessionId", sessionId)
    sockets[sessionId] = socket.id
    app.set("sockets", sockets)
  })
})

app.set("io", io)

app.use(require('../src/routes/v1/videoRoutes.js'))

server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
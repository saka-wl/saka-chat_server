const { Server } = require("socket.io");

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});
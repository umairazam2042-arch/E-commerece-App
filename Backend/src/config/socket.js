const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  // Client connect karte waqt access token bhejega: io(url, { auth: { token } })
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));

    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      // Agar tokens.js mein payload ki id ka naam alag hai, to yahan wohi likhein
      socket.userId = String(payload.id || payload.sub || payload._id);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Har user apne private room mein hota hai
    socket.join(`user:${socket.userId}`);
  });

  return io;
};

const emitToUser = (userId, event, payload) => {
  if (io) io.to(`user:${userId}`).emit(event, payload);
};

module.exports = { initSocket, emitToUser };
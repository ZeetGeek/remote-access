import { Server } from 'socket.io';

export async function GET(req) {
  if (globalThis.socketIoHandler) {
    return new Response("Socket.io server is already running", { status: 200 });
  }

  const io = new Server({
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // In-memory store for session data
  const sessions = {};

  io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    
    // Generate and store a unique request number for this client
    socket.on('register', (requestNumber) => {
      sessions[requestNumber] = socket.id;
      console.log(`Client ${socket.id} registered with request number: ${requestNumber}`);
    });

    // Handle connection requests
    socket.on('sendConnectionRequest', ({ targetNumber, senderNumber }) => {
      const targetSocketId = sessions[targetNumber];
      
      if (targetSocketId) {
        // Send request to target device
        io.to(targetSocketId).emit('connectionRequest', { 
          senderNumber,
          senderSocketId: socket.id 
        });
      } else {
        // Number not found
        socket.emit('requestError', { message: 'Invalid Request Number' });
      }
    });

    // Handle accept/reject responses
    socket.on('requestResponse', ({ accepted, senderSocketId }) => {
      if (senderSocketId && sessions[senderSocketId]) {
        io.to(senderSocketId).emit('connectionStatus', { 
          accepted, 
          message: accepted ? 'Connection Accepted! Access granted.' : 'Connection Rejected.'
        });
      }
    });

    // Clean up on disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Remove this socket's request number from sessions
      Object.keys(sessions).forEach(key => {
        if (sessions[key] === socket.id) {
          delete sessions[key];
        }
      });
    });
  });

  // Start the server
  const httpServer = res => {
    io.listen(3001);
    console.log('Socket.io server started on port 3001');
  };

  globalThis.socketIoHandler = httpServer;
  httpServer();

  return new Response("Socket.io server started", { status: 200 });
}

export const dynamic = 'force-dynamic';
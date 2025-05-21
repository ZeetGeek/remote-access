import { Server } from 'socket.io';

export async function GET(req) {
  if (globalThis.socketIoHandler) {
    return new Response("Socket.io server is already running", { status: 200 });
  }

  const io = new Server({
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    // Increase buffer size for WebRTC signals
    maxHttpBufferSize: 5e6
  });

  // In-memory store for session data
  const sessions = {};
  // Track active connections
  const activeConnections = {};

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
        // Find the sender's request number
        let senderRequestNumber = null;
        Object.keys(sessions).forEach(key => {
          if (sessions[key] === senderSocketId) {
            senderRequestNumber = key;
          }
        });
        
        // Find this socket's request number
        let receiverRequestNumber = null;
        Object.keys(sessions).forEach(key => {
          if (sessions[key] === socket.id) {
            receiverRequestNumber = key;
          }
        });
        
        if (accepted && senderRequestNumber && receiverRequestNumber) {
          console.log(`Accepting connection: sender=${senderRequestNumber}, receiver=${receiverRequestNumber}`);
          
          // Store the active connection
          activeConnections[receiverRequestNumber] = senderRequestNumber;
          activeConnections[senderRequestNumber] = receiverRequestNumber;
          
          // Send acceptance with the receiver's request number for peer-to-peer connection
          io.to(senderSocketId).emit('connectionStatus', { 
            accepted: true, 
            message: 'Connection Accepted! Access granted.',
            connectedTo: receiverRequestNumber,
            isController: true // The requester controls the remote screen
          });
          
          // Notify the acceptor to prepare for being controlled
          socket.emit('prepareForRemoteControl', {
            connectedTo: senderRequestNumber
          });
          
          // Also emit a direct message to confirm the acceptor is being controlled
          io.to(socket.id).emit('connectionStatus', {
            accepted: true,
            message: 'You are sharing your screen. The other user can now control your browser.',
            connectedTo: senderRequestNumber,
            isController: false
          });
          
          console.log(`Sent control events to both parties: controller=${senderSocketId}, controlled=${socket.id}`);
        } else {
          // Just send rejection
          io.to(senderSocketId).emit('connectionStatus', { 
            accepted: false, 
            message: 'Connection Rejected.'
          });
        }
      }
    });
    
    // WebRTC signaling
    socket.on('signal', ({ signal, targetNumber }) => {
      const targetSocketId = sessions[targetNumber];
      if (targetSocketId) {
        io.to(targetSocketId).emit('signal', { 
          signal, 
          from: socket.id 
        });
      }
    });
    
    // Remote control events
    socket.on('controlEvent', ({ event, targetNumber }) => {
      const targetSocketId = sessions[targetNumber];
      if (targetSocketId) {
        io.to(targetSocketId).emit('controlEvent', event);
      }
    });

    // Clean up on disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Find this socket's request number
      let requestNumber = null;
      Object.keys(sessions).forEach(key => {
        if (sessions[key] === socket.id) {
          requestNumber = key;
          delete sessions[key];
        }
      });
      
      // Clean up active connections
      if (requestNumber && activeConnections[requestNumber]) {
        const connectedTo = activeConnections[requestNumber];
        delete activeConnections[requestNumber];
        delete activeConnections[connectedTo];
        
        // Notify the other party about disconnection
        const connectedSocketId = sessions[connectedTo];
        if (connectedSocketId) {
          io.to(connectedSocketId).emit('connectionClosed');
        }
      }
    });
  });

  // Start the server
  const httpServer = res => {
    io.listen(3001);
    console.log('Socket.io server started on port 3001');
    
    // Debug active connections
    setInterval(() => {
      console.log('Active sessions:', Object.keys(sessions));
      console.log('Active connections:', Object.keys(activeConnections));
    }, 10000);
  };

  globalThis.socketIoHandler = httpServer;
  httpServer();

  return new Response("Socket.io server started", { status: 200 });
}

export const dynamic = 'force-dynamic';
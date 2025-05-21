# Remote Desktop Connection App

A functional remote desktop control application built with Next.js, Tailwind CSS, Socket.io, and WebRTC that allows users to view and control a remote browser, similar to AnyDesk or TeamViewer.

## Features

- Generate unique 9-digit request numbers for secure connections
- Send connection requests between devices/browser tabs
- Real-time connection request modals
- Accept or reject incoming connection requests
- Screen sharing with WebRTC
- Full remote control of the shared browser
- Real-time mouse and keyboard input forwarding
- Remote cursor visibility
- Panning and zooming capabilities
- Status updates for connection attempts

## Tech Stack

- **Frontend:** Next.js 15.3.2, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Real-time Communication:** 
  - Socket.io for signaling and connection management
  - WebRTC for peer-to-peer screen sharing and data channels
- **Browser APIs:**
  - Screen Capture API
  - Synthetic Events for remote control

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm or yarn
- Modern browser with WebRTC support (Chrome, Firefox, Edge recommended)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/remote-access.git
cd remote-access
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Testing the Application

To test the remote desktop connection with full control functionality:

1. **Open two browser windows/tabs** with the application running at [http://localhost:3000](http://localhost:3000).

2. **In Window/Tab 1:**
   - You'll see a randomly generated 9-digit number in the "Your Request Number" section.
   - Keep this window/tab open.

3. **In Window/Tab 2:**
   - Copy the request number from Window/Tab 1.
   - Paste it into the "Enter Remote Number" field.
   - Click "Send Request".

4. **Back in Window/Tab 1:**
   - A modal will appear showing a connection request from Window/Tab 2's request number.
   - Click "Accept" to start sharing your screen.
   - Your browser will prompt you to select which screen or application to share.
   - Choose to share your browser tab or entire screen.

5. **In Window/Tab 2:**
   - After Window/Tab 1 accepts, you'll see:
     - A status message: "Connection Accepted! Access granted." (in green)
     - The shared screen displayed in an 800x800 pixel box
     - You can now control the remote browser by:
       - Moving your mouse over the shared screen (you'll see your cursor on the remote browser)
       - Clicking elements in the remote browser
       - Typing with your keyboard (click in the screen area first to focus it)
       - Hold Ctrl + drag to pan the view
       - Use Ctrl + mouse wheel to zoom in and out

6. **In Window/Tab 1:**
   - You'll see a message indicating your browser is being controlled
   - You'll see the remote user's cursor movements on your screen
   - Any clicks or keyboard inputs from the controller will be executed in your browser

7. **To End the Session:**
   - Either party can close their browser tab or window
   - The controller can stop the screen share from their browser controls

## How It Works

1. **Socket.io Server:**
   - Runs in a Next.js API route (/api/socket).
   - Manages connections and request routing between clients.
   - Handles WebRTC signaling for establishing peer connections.

2. **Session Management:**
   - Generates and stores unique 9-digit request numbers.
   - Associates request numbers with Socket.io client IDs.
   - Tracks active connections for proper cleanup.

3. **WebRTC Connection:**
   - Uses simple-peer library to handle WebRTC connections.
   - Establishes a peer-to-peer connection for screen sharing.
   - Creates a data channel for sending control events.

4. **Screen Sharing:**
   - Uses the browser's `navigator.mediaDevices.getDisplayMedia` API.
   - Captures the screen/tab of the user who accepts the connection.
   - Sends the video stream to the controller's browser.

5. **Remote Control:**
   - Captures mouse movements, clicks, and keyboard events from the controller.
   - Sends these events through the WebRTC data channel to the controlled browser.
   - Reconstructs and dispatches synthetic mouse and keyboard events on the controlled side.
   - Displays a custom cursor showing the controller's mouse position.

## Project Structure

```
remote-access/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── session/
│   │   │   │   └── route.js   # Session management API
│   │   │   └── socket/
│   │   │       └── route.js   # Socket.io server with WebRTC signaling
│   │   ├── components/
│   │   │   ├── ConnectionModal.js  # Connection request modal
│   │   │   ├── RemoteControl.js    # WebRTC screen sharing and control UI
│   │   │   └── RemoteCursor.js     # Remote cursor display
│   │   ├── hooks/
│   │   │   └── useWebRTC.js        # WebRTC connection handler
│   │   ├── context/
│   │   │   └── SocketProvider.js   # Socket.io context provider
│   │   ├── layout.js          # Root layout with SocketProvider
│   │   └── page.js            # Main application page
│   └── ...
└── ...
```

## Limitations

- Remote control is limited to the shared browser tab/window, not the entire system.
- Some browser security features may block certain keyboard shortcuts.
- WebRTC connections may be affected by firewalls, NATs, and proxies.
- Screen sharing quality is optimized for control rather than high-definition viewing.
- For security reasons, some actions might be restricted by browser policies.
- This is a demonstration project and lacks production security features:
  - No user authentication
  - No end-to-end encryption for signaling
  - No request number validation or expiration

## Browser Compatibility

This application works best with:
- Google Chrome (version 80+)
- Mozilla Firefox (version 75+)
- Microsoft Edge (version 80+)

Safari has limited support for some WebRTC features.

## License

[MIT License](LICENSE)
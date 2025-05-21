# Remote Desktop Connection App

A basic remote desktop connection app built with Next.js, Tailwind CSS, and Socket.io that simulates a connection request workflow similar to AnyDesk's initial connection process.

## Features

- Generate unique 9-digit request numbers
- Send connection requests between devices/browser tabs
- Real-time connection request modals
- Accept or reject incoming connection requests
- Status updates for connection attempts

## Tech Stack

- **Frontend:** Next.js 15.3.2, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Real-time Communication:** Socket.io

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm or yarn

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

To test the remote desktop connection workflow, you need to simulate two different devices:

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
   - You can either "Accept" or "Reject" the request.

5. **In Window/Tab 2:**
   - After Window/Tab 1 responds, you'll see a status message:
     - "Connection Accepted! Access granted." (in green) if accepted
     - "Connection Rejected." (in red) if rejected

6. **Test the reverse** by sending a request from Window/Tab 1 to Window/Tab 2.

## How It Works

1. **Socket.io Server:**
   - Runs in a Next.js API route (/api/socket).
   - Manages connections and request routing between clients.

2. **Session Management:**
   - Generates and stores request numbers.
   - Associates request numbers with Socket.io client IDs.

3. **Real-time Communication:**
   - Clients register their request numbers with the Socket.io server.
   - When a connection request is sent, the server routes it to the appropriate client.
   - Connection responses (accept/reject) are also routed back to the requesting client.

## Project Structure

```
remote-access/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── session/
│   │   │   │   └── route.js   # Session management API
│   │   │   └── socket/
│   │   │       └── route.js   # Socket.io server
│   │   ├── components/
│   │   │   └── ConnectionModal.js  # Connection request modal
│   │   ├── context/
│   │   │   └── SocketProvider.js   # Socket.io context provider
│   │   ├── layout.js          # Root layout with SocketProvider
│   │   └── page.js            # Main application page
│   └── ...
└── ...
```

## Limitations

- This is a simulation only; no actual desktop access is granted.
- Connection numbers are stored in memory and will be lost on server restart.
- For production use, additional security measures would be needed.

## License

[MIT License](LICENSE)
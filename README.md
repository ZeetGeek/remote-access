# Remote Access Demo

A TeamViewer-like remote desktop connection demo built with Next.js, WebRTC, and Socket.io.

## Features

- 🔗 **Easy Connection**: Simple ID-based connection system
- 🖥️ **Screen Sharing**: Real-time screen broadcasting using WebRTC
- 🔒 **Secure**: Peer-to-peer connections
- 📱 **Responsive**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Built with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- Modern web browser with WebRTC support

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd remote-access
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### Demo Mode (Current Implementation)

1. **Generate Your ID**: The app automatically generates a unique 6-character ID when you load the page
2. **Share Your ID**: Copy your ID and share it with someone you want to connect to
3. **Connect to Partner**: Enter your partner's ID and click "Connect" to establish a connection
4. **Share Screen**: Click "Share My Screen" to start broadcasting your screen
5. **View Remote Screen**: When connected, you'll see a simulated remote desktop in the "Partner's Screen" section

### Features Available

- **ID-Based Connections**: Each user gets a unique ID for easy connection
- **Screen Sharing**: Real screen capture using `getDisplayMedia()` API
- **Connection Status**: Real-time status updates (Ready, Connecting, Connected, etc.)
- **Demo Simulation**: Simulated remote desktop for demonstration purposes

## Technical Implementation

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User A        │    │   Signaling     │    │   User B        │
│   (Host)        │◄──►│   Server        │◄──►│   (Client)      │
│                 │    │   (Socket.io)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                               │
         └─────────────── WebRTC P2P ──────────────────┘
```

### Key Components

- **Next.js App Router**: Modern React framework with server-side rendering
- **WebRTC**: Peer-to-peer real-time communication
- **Simple-peer**: WebRTC wrapper library for easier implementation  
- **Socket.io**: Real-time signaling for WebRTC connection establishment
- **Tailwind CSS**: Utility-first CSS framework for styling

### File Structure

```
src/
├── app/
│   ├── page.js          # Main application component
│   ├── layout.js        # App layout
│   └── globals.css      # Global styles
└── components/          # (Future: Reusable components)
```

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Features

- **React Hooks**: Uses modern React patterns with hooks
- **Error Handling**: Comprehensive error handling for WebRTC operations
- **Responsive Design**: Mobile-first responsive layout
- **Accessibility**: ARIA labels and semantic HTML

## Production Deployment

For production use, you'll need to:

1. **Set up a signaling server**: Currently uses simulated connections
2. **Configure STUN/TURN servers**: For NAT traversal in production
3. **Add authentication**: Secure user identification and authorization
4. **Implement persistence**: Store connection history and user preferences

### Environment Variables

Create a `.env.local` file for production configuration:

```env
NEXT_PUBLIC_SIGNALING_SERVER_URL=ws://your-signaling-server.com
NEXT_PUBLIC_STUN_SERVER=stun:stun.l.google.com:19302
NEXT_PUBLIC_TURN_SERVER=turn:your-turn-server.com:3478
```

## Browser Compatibility

- Chrome 60+
- Firefox 60+
- Safari 11+
- Edge 79+

## Security Considerations

- WebRTC connections are peer-to-peer and encrypted
- Screen sharing requires explicit user permission
- Consider implementing session timeouts for production use
- Add rate limiting for connection attempts

## Limitations (Demo Version)

- No real signaling server (simulated connections)
- Limited to same-browser testing
- No persistent connections
- No authentication system
- Simplified UI for demonstration

## Future Enhancements

- [ ] Real signaling server implementation
- [ ] File transfer capabilities  
- [ ] Remote mouse/keyboard control
- [ ] Multiple monitor support
- [ ] Chat functionality
- [ ] Connection encryption indicators
- [ ] Bandwidth optimization
- [ ] Mobile app versions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for demonstration purposes. See LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check browser console for WebRTC errors
- Ensure HTTPS is used in production (required for screen sharing)

## Acknowledgments

- WebRTC community for excellent documentation
- Simple-peer library for WebRTC abstraction
- Next.js team for the amazing framework
- Tailwind CSS for utility-first styling
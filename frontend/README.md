# BillBuddy Frontend

React + Vite frontend for BillBuddy expense splitting application.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🔐 JWT Authentication
- 💬 Real-time Chat (Socket.io)
- 🔔 Real-time Notifications
- 📱 Responsive Design
- ⚡ Fast with Vite

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your backend URL:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Project Structure

```
src/
├── components/     # Reusable components
├── contexts/       # React contexts (Auth, Socket)
├── pages/          # Page components
├── services/       # API services
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

## Tech Stack

- React 18
- Vite
- React Router
- Axios
- Socket.io Client
- Tailwind CSS
- React Hot Toast
- Lucide React Icons
- date-fns

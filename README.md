# BillBuddy - Expense Splitting Application

BillBuddy is a full-stack expense splitting application that helps groups of friends or roommates track and split expenses easily. It features real-time notifications, group chats, and automatic balance calculations.

## Features

- 👤 User Authentication (JWT-based)
- 💰 Expense Management (Equal, Unequal, Percentage splits)
- 👥 Group Management
- 💬 Real-time Chat (Socket.io)
- 🔔 Real-time Notifications
- 📊 Balance Tracking
- 💵 Settlement Management
- 📝 Activity Logs
- 🎨 Modern Responsive UI

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Icons**: Lucide React

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/billbuddy
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=*
```

5. Start the backend server:
```bash
# Development
npm run dev

# Production
npm start
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### User Routes (`/api/user`)
- `POST /api/user/register` - Register a new user
- `POST /api/user/signin` - Sign in user
- `GET /api/user/dashboard/:userId` - Get user dashboard

### Group Routes (`/api/group`)
- `POST /api/group` - Create a group
- `GET /api/group/:groupId` - Get group details
- `GET /api/group/user/:userId` - Get user's groups

### Expense Routes (`/api/expense`)
- `POST /api/expense` - Create an expense
- `GET /api/expense` - Get all expenses
- `GET /api/expense/:id` - Get expense by ID
- `PUT /api/expense/:id` - Update expense status
- `DELETE /api/expense/:id` - Delete an expense

### Balance Routes (`/api/balance`)
- `GET /api/balance/:userId` - Get user balance

### Settlement Routes (`/api/settle`)
- `POST /api/settle` - Create a settlement
- `GET /api/settle/:userId` - Get user settlements

### Chat Routes (`/api/chat`)
- `POST /api/chat` - Send a message
- `GET /api/chat/:groupId` - Get group messages

### Notification Routes (`/api/notifications`)
- `GET /api/notifications/:userId` - Get user notifications
- `PUT /api/notifications/:id` - Mark notification as read

### Activity Routes (`/api/activity`)
- `GET /api/activity/:groupId` - Get group activities

## Socket.io Events

### Client to Server:
- `joinUser` - Join user's personal notification room
- `joinRoom` - Join a group chat room
- `sendMessage` - Send a chat message
- `sendNotification` - Send a notification

### Server to Client:
- `receiveMessage` - Receive a chat message
- `receiveNotification` - Receive a notification

## Docker Deployment

### Using Docker Compose (Recommended)

1. Make sure you have Docker and Docker Compose installed

2. Update the `.env` file with your MongoDB connection string (or use the default MongoDB service in docker-compose.yml)

3. Run:
```bash
docker-compose up -d
```

The application will be available at `http://localhost:5000`

### Using Docker only

1. Build the image:
```bash
docker build -t billbuddy-backend .
```

2. Run the container:
```bash
docker run -p 5000:5000 --env-file .env billbuddy-backend
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment (development/production) | development |
| `MONGO_URI` | MongoDB connection string | - |
| `JWT_SECRET` | Secret key for JWT tokens | - |

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── controllers/           # Route controllers
├── middleware/
│   └── authMiddleware.js  # JWT authentication middleware
├── models/                # Mongoose models
├── routes/                # Express routes
├── utils/                 # Utility functions
├── app.js                 # Express app configuration
├── server.js              # Server entry point
└── socket.js              # Socket.io configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC

## Support

For support, email your-email@example.com or create an issue in the repository.

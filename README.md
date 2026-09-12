# SYNQ

SYNQ is a full-stack disaster management platform that connects people who need help with people who can provide assistance and resources during emergencies.

The platform makes local disaster response easier through location-based resource discovery, request-offer matching, and real-time communication.

## Features

- User registration and login with JWT authentication
- Create help requests
- Create offers for resources and assistance
- Interactive map for viewing nearby requests and offers
- Category-based filtering
- Location-based matching of requests with nearby offers
- Request and offer details pages
- Real-time chat using Socket.IO
- Persistent chat messages using MongoDB

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Leaflet
- React Leaflet
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcryptjs

## Project Structure

```text
SYNQ/
├── client/     # React frontend
├── server/     # Node.js/Express backend
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd SYNQ
```

### 2. Install dependencies

```bash
cd client
npm install
```

```bash
cd ../server
npm install
```

### 3. Configure environment variables

Create `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3001
```

### 4. Run the backend

```bash
cd server
npm start
```

### 5. Run the frontend

Open another terminal:

```bash
cd client
npm run dev
```

Open the local URL provided by Vite.

## Core Workflow

```text
Login
  ↓
Request Help / Offer Help
  ↓
Discover Resources on Map
  ↓
Find Nearby Matches
  ↓
View Details
  ↓
Chat in Real Time
```

## Future Improvements

- User-specific chat history
- Notifications for new requests and messages
- Request status tracking
- Advanced resource matching
- Resource verification

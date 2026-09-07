# 🎥 Full-Stack Video Conferencing Platform

A full-stack real-time video conferencing application built with the **MERN stack, WebRTC, and Socket.io**.

The platform allows users to create an account, authenticate securely, join meetings using shareable meeting codes, or enter a meeting as a guest. Calls use **peer-to-peer WebRTC media**, while Socket.io handles signaling and in-call chat.

> **Project status:** This is a portfolio/learning project focused on understanding real-time communication, WebRTC peer connections, Socket.io signaling, authentication, and full-stack application development.

---

## ✨ Features

* 🔐 User registration and login
* 🔑 Server-generated authentication tokens
* 👤 Guest meeting access without registration
* 🔗 Shareable meeting codes
* 🎥 Real-time peer-to-peer video calling with WebRTC
* 🎙️ Real-time audio communication
* 💬 In-call text chat
* 🖥️ Screen sharing
* 🎤 Microphone on/off control
* 📹 Camera on/off control
* 👋 Automatic handling when participants leave
* 🗂️ Meeting history for authenticated users
* 📱 Responsive interface
* ⚡ Real-time signaling using Socket.io
* 🗄️ MongoDB persistence using Mongoose

---

## 🧰 Tech Stack

### Frontend

| Technology       | Purpose                  |
| ---------------- | ------------------------ |
| React 18         | User interface           |
| React Router     | Client-side routing      |
| Material UI      | UI components            |
| Axios            | HTTP requests            |
| Socket.io Client | Real-time signaling/chat |
| WebRTC APIs      | Peer-to-peer audio/video |

### Backend

| Technology | Purpose                         |
| ---------- | ------------------------------- |
| Node.js    | Runtime                         |
| Express 5  | REST API                        |
| Socket.io  | Real-time signaling and chat    |
| MongoDB    | Database                        |
| Mongoose   | MongoDB ODM                     |
| bcrypt     | Password hashing                |
| crypto     | Authentication token generation |

### WebRTC

The application currently uses:

* `RTCPeerConnection`
* SDP offer/answer negotiation
* ICE candidate exchange
* Google public STUN server

Current ICE configuration:

```js
{
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
}
```

---

## 🏗️ Architecture

The application has three major communication layers:

```text
                    ┌─────────────────────┐
                    │      React App      │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                    HTTP / Socket.io
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Node.js + Express  │
                    │     + Socket.io     │
                    └───────┬─────┬───────┘
                            │     │
                       MongoDB    │
                            │     │
                            ▼     │
                    ┌─────────────┐
                    │  Database   │
                    └─────────────┘
```

### WebRTC media flow

Video and audio are **not streamed through the Express/Socket.io server**.

Instead:

```text
Browser A
   │
   │ WebRTC media
   │
   ▼
Browser B
```

Socket.io is used as the signaling layer:

```text
Browser A
    │
    │ SDP / ICE
    ▼
Socket.io Server
    │
    │ SDP / ICE
    ▼
Browser B
```

After negotiation, the browsers attempt to establish a direct WebRTC connection.

---

## 🔄 How a Meeting Works

1. A user enters or generates a meeting code.
2. The frontend navigates to the meeting URL.
3. `VideoMeet.jsx` requests camera/microphone permissions.
4. The client connects to the Socket.io server.
5. The current page URL is used as the Socket.io room key.
6. The server tracks connected socket IDs for that room.
7. Existing participants and the new participant exchange signaling information.
8. SDP offers/answers are exchanged through Socket.io.
9. ICE candidates are exchanged through Socket.io.
10. WebRTC establishes peer-to-peer media connections.
11. Chat messages are relayed through Socket.io.
12. When a participant disconnects, other clients remove that participant's connection.

---

## 👥 Guest Access

The landing page provides a guest option.

A random meeting code is generated on the client:

```js
const randomCode = Math.random().toString(36).substring(2, 9);
```

The guest is then taken directly into that meeting URL.

Guests do not need to create an account, but they enter a display name before joining the call.

---

## 🔐 Authentication

Registered users can:

* Create an account
* Log in
* Receive an authentication token
* Save meeting activity
* View previous meeting activity

Passwords are hashed using **bcrypt** before being stored.

The current authentication implementation uses a random server-generated token stored in MongoDB and saved by the frontend in `localStorage`.

> **Note:** The current authentication system is intentionally simple. It is not currently implemented using JWT access/refresh tokens or an expiring server-side session system.

---

## 📁 Project Structure

```text
Full-Stack-Video-Conferencing-Platform/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── socketManager.js
│   │   │   └── user.controller.js
│   │   │
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   └── meeting.model.js
│   │   │
│   │   ├── routes/
│   │   │   └── users.routes.js
│   │   │
│   │   └── app.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │   ├── background.png
│   │   ├── mobile.png
│   │   ├── logo3.png
│   │   └── ...
│   │
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── landing.jsx
│   │   │   ├── authentication.jsx
│   │   │   ├── home.jsx
│   │   │   ├── history.jsx
│   │   │   └── VideoMeet.jsx
│   │   │
│   │   ├── styles/
│   │   │   └── videoComponent.module.css
│   │   │
│   │   ├── utils/
│   │   │   └── withAuth.jsx
│   │   │
│   │   ├── environment.js
│   │   └── App.js
│   │
│   ├── .env.example
│   └── package.json
│
└── .gitignore
```

---

## ✅ Prerequisites

Before running the project, install:

* Node.js 18+
* npm
* MongoDB Atlas account or a local MongoDB installation
* A modern browser
* Camera and microphone for video/audio functionality

Chrome, Edge, and Firefox are recommended for WebRTC testing.

---

# 🚀 Installation

## 1. Clone the repository

```bash
git clone https://github.com/GANESHVERMA730/Full-Stack-Video-Conferencing-Platform.git

cd Full-Stack-Video-Conferencing-Platform
```

## 2. Install backend dependencies

```bash
cd backend
npm install
```

## 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

# 🔑 Environment Variables

The project uses environment variables for configuration.

**Never commit your real `.env` files or database credentials to GitHub.**

---

## Backend Environment

Create:

```text
backend/.env
```

Example:

```env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
```

### Variables

| Variable    | Required | Description                       |
| ----------- | -------- | --------------------------------- |
| `PORT`      | No       | Backend port. Defaults to `8000`. |
| `MONGO_URI` | Yes      | MongoDB connection string.        |

The backend intentionally fails to start when `MONGO_URI` is missing instead of using a hardcoded database credential.

---

## Frontend Environment

Create:

```text
frontend/.env
```

Example:

```env
REACT_APP_SERVER_URL=http://localhost:8000
```

| Variable               | Required | Description                              |
| ---------------------- | -------- | ---------------------------------------- |
| `REACT_APP_SERVER_URL` | No       | Backend URL used by Axios and Socket.io. |

In development, the application defaults to:

```text
http://localhost:8000
```

---

# ▶️ Running the Application

Run the backend and frontend in separate terminals.

## Backend

From:

```text
backend/
```

run:

```bash
npm run dev
```

For normal Node execution:

```bash
npm start
```

For PM2:

```bash
npm run prod
```

The backend normally runs on:

```text
http://localhost:8000
```

---

## Frontend

From:

```text
frontend/
```

run:

```bash
npm start
```

The React application normally opens at:

```text
http://localhost:3000
```

---

# 🧪 Testing a Video Call Locally

1. Start the backend.
2. Start the frontend.
3. Open the application in your browser.
4. Create or enter a meeting code.
5. Open the same meeting URL in another browser window or an incognito window.
6. Allow camera and microphone permissions.
7. Enter a display name.
8. Test:

   * Video
   * Microphone
   * Screen sharing
   * Chat
   * Participant disconnect
   * Meeting history for authenticated users

---

# 🌐 REST API

The main API base path is:

```text
/api/v1/users
```

The same routes are also mounted under:

```text
/api/auth
```

## Register

```http
POST /api/v1/users/register
```

Request body:

```json
{
  "name": "Ganesh",
  "username": "ganesh",
  "password": "your-password"
}
```

---

## Login

```http
POST /api/v1/users/login
```

Request body:

```json
{
  "username": "ganesh",
  "password": "your-password"
}
```

The server returns a generated authentication token.

---

## Add Meeting to History

```http
POST /api/v1/users/add_to_activity
```

Request body:

```json
{
  "token": "your-auth-token",
  "meeting_code": "meeting123"
}
```

---

## Get Meeting History

```http
GET /api/v1/users/get_all_activity?token=your-auth-token
```

Returns the meetings saved for the authenticated user.

---

# 🔌 Socket.io Events

| Event          | Direction       | Purpose                                       |
| -------------- | --------------- | --------------------------------------------- |
| `join-call`    | Client → Server | Join a meeting room                           |
| `signal`       | Client ↔ Server | Relay WebRTC SDP/ICE signaling                |
| `chat-message` | Client ↔ Server | Send and receive chat messages                |
| `user-joined`  | Server → Client | Notify clients about participants             |
| `user-left`    | Server → Client | Notify clients when a participant disconnects |

---

# 📡 WebRTC Architecture

This project uses a **full-mesh WebRTC topology**.

For example, with four participants:

```text
          User A
         /  |  \
        /   |   \
     User B--User C
        \    |   /
         \   |  /
          User D
```

Each participant maintains a direct peer connection with the other participants.

### Advantages

* Simple architecture
* No media server required
* Media can flow directly between browsers
* Good for learning WebRTC fundamentals
* Lower server-side media-processing requirements

### Limitations

The number of peer connections increases as participants join.

For `N` participants, the number of unique peer-to-peer connections is approximately:

```text
N × (N - 1) / 2
```

As a result, large meetings can become expensive in terms of:

* Upload bandwidth
* Download bandwidth
* CPU usage
* Browser performance

For larger meetings, an SFU architecture would be more appropriate.

---

# 🌍 STUN and TURN

The current implementation uses a public STUN server:

```text
stun:stun.l.google.com:19302
```

### STUN

STUN helps WebRTC discover the public-facing network address needed for peer connection establishment.

### TURN

A TURN server is **not currently configured**.

Therefore, some participants behind restrictive NATs, firewalls, or corporate networks may be unable to establish a direct connection.

A production-ready deployment should consider adding TURN support, for example through:

* coturn
* A managed TURN provider

---

# 💬 Chat

Chat messages are handled by Socket.io rather than WebRTC.

The server:

1. Identifies the room containing the sender.
2. Stores the message in the server's in-memory room history.
3. Broadcasts the message to participants.
4. Replays stored room messages when a new participant joins.

> **Important:** The current chat history is stored in server memory. It is not persisted in MongoDB and will be lost when the backend process restarts.

---

# 🗂️ Meeting History

Authenticated users can save meeting codes to MongoDB.

Each meeting record contains:

```text
user_id
meetingCode
date
```

The history page displays:

* Meeting code
* Meeting date

Guest meetings are not saved to authenticated user history.

---

# 🔒 Security Notes

This project uses environment variables for sensitive configuration.

The repository should **never contain**:

* MongoDB usernames/passwords
* Real database connection strings
* API secrets
* Production credentials
* Real `.env` files

Before publishing changes, verify:

```bash
git grep -n "mongodb+srv"
```

and confirm that no real MongoDB connection string is present.

If credentials were previously committed to a public repository, rotate them immediately and consider removing the secret from Git history.

---

# ⚠️ Current Limitations

This project is functional, but it is not intended to be a production-scale replacement for Zoom or Google Meet.

Current limitations include:

* Full-mesh WebRTC architecture
* No TURN server
* Authentication tokens do not currently expire
* Tokens are stored in `localStorage`
* Chat history is stored only in server memory
* No automated backend/socket integration test suite
* Socket room state is stored in server memory
* No SFU/media server
* CORS currently permits all origins
* No production-grade rate limiting
* No dedicated production authentication/session infrastructure

---

# 🗺️ Roadmap

* [ ] Add TURN server support
* [ ] Improve authentication with expiring JWT access/refresh tokens
* [ ] Move authentication from `localStorage` to a more secure cookie-based approach
* [ ] Add production-grade CORS configuration
* [ ] Add API rate limiting
* [ ] Add automated backend tests
* [ ] Add Socket.io/WebRTC integration tests
* [ ] Persist chat history when required
* [ ] Introduce an SFU for larger meetings
* [ ] Add better participant management
* [ ] Add meeting creation/management
* [ ] Add a `.env.example` for all environments
* [ ] Add a dedicated `LICENSE` file
* [ ] Add deployment documentation
* [ ] Add real screenshots and/or a demo GIF

---

# 📸 Screenshots

Add real screenshots here after running the application.

### Landing Page

```text
Add screenshot here
```

### Authentication

```text
Add screenshot here
```

### Meeting Lobby

```text
Add screenshot here
```

### Video Call

```text
Add screenshot here
```

### Meeting History

```text
Add screenshot here
```

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Test the application.
5. Commit your changes:

```bash
git commit -m "feat: add your feature"
```

6. Push the branch:

```bash
git push origin feature/your-feature
```

7. Open a Pull Request.

---

# 📄 License

The backend package currently declares the **ISC license**.

If this project is intended for public distribution, add a top-level `LICENSE` file containing the appropriate license text.

---

# 👨‍💻 Author

## Ganesh Kumar Verma

BCA Data Science & AI student and full-stack developer focused on building real-time web applications with the MERN stack.

### Links

* Portfolio: https://ganesh-kumar-verma-portfolio.vercel.app
* GitHub: https://github.com/GANESHVERMA730
* LinkedIn: https://www.linkedin.com/in/ganesh-verma108/

---

## ⭐ Project Highlights

This project demonstrates practical experience with:

* React
* Node.js
* Express
* MongoDB
* Mongoose
* REST APIs
* Authentication
* WebRTC
* Socket.io
* Real-time communication
* Peer-to-peer networking
* Screen sharing
* Full-stack application architecture

The primary technical focus of the project is understanding how **WebRTC media connections and Socket.io signaling work together to build real-time browser-based communication.**

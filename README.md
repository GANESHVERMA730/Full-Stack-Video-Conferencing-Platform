# 🎥 Full-Stack Video Conferencing Platform

## 🌐 Live Demo

🚀 [View Live Project](https://full-stack-video-conferencing-platform.onrender.com)

A real-time video conferencing web application built using the **MERN stack, WebRTC, and Socket.io**.

This project was built to learn and implement real-time communication, peer-to-peer video calling, authentication, and full-stack application development.

## ✨ Features

* User registration and login
* Guest meeting access
* Shareable meeting codes
* Real-time video and audio calling
* Screen sharing
* Camera and microphone controls
* In-call chat
* Meeting history for registered users
* Real-time signaling with Socket.io
* Responsive interface

## 🧰 Tech Stack

**Frontend**

* React
* React Router
* Material UI
* Axios
* Socket.io Client
* WebRTC

**Backend**

* Node.js
* Express
* Socket.io
* MongoDB
* Mongoose
* bcrypt

## 🔄 How It Works

The application uses **WebRTC** for direct audio/video communication between users.

**Socket.io** is used for:

* WebRTC signaling
* Joining/leaving meeting rooms
* In-call chat

The current WebRTC implementation uses a **full-mesh architecture**, where each participant connects directly with the other participants.

A public Google STUN server is currently used. **TURN is not configured yet**, so some networks may have connection issues.

## 📁 Project Structure

```text
Full-Stack-Video-Conferencing-Platform/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
│
└── .gitignore
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/GANESHVERMA730/Full-Stack-Video-Conferencing-Platform.git
cd Full-Stack-Video-Conferencing-Platform
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

Create `backend/.env`:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
```

Create `frontend/.env`:

```env
REACT_APP_SERVER_URL=http://localhost:8000
```

> Never commit your real `.env` files or database credentials.

### 4. Run the project

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm start
```

The application normally runs at:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8000
```

## 🧪 Testing

To test a video call locally:

1. Start both frontend and backend.
2. Open the application in your browser.
3. Create or enter a meeting code.
4. Open the same meeting in another browser or incognito window.
5. Allow camera and microphone permissions.
6. Test video, audio, screen sharing, chat, and participant leaving.

## 🔐 Security

Sensitive configuration is stored using environment variables.

The application uses:

* bcrypt for password hashing
* Server-generated authentication tokens
* `.env` files for database credentials

The repository does not contain the current MongoDB credentials.

## ⚠️ Current Limitations

This is a learning/portfolio project and is not designed to replace large-scale platforms like Zoom or Google Meet.

Current limitations:

* Full-mesh WebRTC
* No TURN server
* Authentication tokens do not expire
* Tokens are stored in `localStorage`
* Chat history is stored in server memory
* CORS is currently open
* No production-grade rate limiting

## 📸 Screenshots

Screenshots can be added here after deployment.

## 👨‍💻 Author

### Ganesh Kumar Verma

BCA Data Science & AI student and full-stack developer.

* GitHub: https://github.com/GANESHVERMA730
* LinkedIn: https://www.linkedin.com/in/ganesh-verma108/
* Portfolio: https://ganesh-kumar-verma-portfolio.vercel.app

---

⭐ If you find this project useful, feel free to explore the code and give it a star.

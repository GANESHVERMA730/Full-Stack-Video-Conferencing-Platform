import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);
app.use("/api/auth", userRoutes);

const start = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb+srv://Zoom-call512:7DzoomGT142@zoomcall.gaboptf.mongodb.net/";
  const connectionDB = await mongoose.connect(mongoUri);

  console.log(`MONGO Connected DB HOST: ${connectionDB.connection.host}`);
  server.listen(app.get("port"), () => {
    console.log(`LISTENING ON PORT ${app.get("port")}`);
  });
};

start();

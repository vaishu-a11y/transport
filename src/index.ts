import app from "./app";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

if (!MONGO_URI) {
    console.error("MONGO_URI missing in .env");
    process.exit(1);
}

const httpServer = createServer(app);
export const io = new SocketIOServer(httpServer, {
    cors: {
        origin: true,
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    socket.on("subscribe:route", (routeId: string) => {
        socket.join(`route_${routeId}`);
    });
    socket.on("disconnect", () => { });
});

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        httpServer.listen(PORT, () => {
            console.log(`Server listening at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

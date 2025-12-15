"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
if (!MONGO_URI) {
    console.error("MONGO_URI missing in .env");
    process.exit(1);
}
const httpServer = (0, http_1.createServer)(app_1.default);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: true,
        methods: ["GET", "POST"]
    }
});
exports.io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    socket.on("subscribe:route", (routeId) => {
        socket.join(`route_${routeId}`);
    });
    socket.on("disconnect", () => { });
});
mongoose_1.default
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

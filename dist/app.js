"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const vehicle_1 = __importDefault(require("./routes/vehicle"));
const location_1 = __importDefault(require("./routes/location"));
const route_1 = __importDefault(require("./routes/route"));
const alert_1 = __importDefault(require("./routes/alert"));
const device_1 = __importDefault(require("./routes/device"));
dotenv_1.default.config();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
const __dirnamePath = path_1.default.resolve();
const frontendPath = path_1.default.join(__dirnamePath, "dist-frontend");
app.use(express_1.default.static(frontendPath));
// routes
app.use("/api/v1/auth", auth_1.default);
app.use("/api/v1/vehicle", vehicle_1.default);
app.use("/api/v1/location", location_1.default);
app.use("/api/v1/route", route_1.default);
app.use("/api/v1/alert", alert_1.default);
app.use("/api/v1/device", device_1.default);
// app.get("/", (req, res) => res.json({ ok: true, msg: "Transport Tracker API" }));
// SPA fallback (React/Vite/Angular)
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(frontendPath, "index.html"));
});
app.use((err, req, res, next) => {
    res.status(500).json({ message: "Something went wrong", error: err.message });
});
exports.default = app;

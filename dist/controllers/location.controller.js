"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestForAll = exports.getLastLocation = exports.getHistory = exports.latestLocation = exports.updateLocation = void 0;
const Location_1 = __importDefault(require("../models/Location"));
const index_1 = require("../index");
const Device_1 = __importDefault(require("../models/Device"));
// POST /api/v1/location/update
// export const updateLocation = async (req: Request, res: Response) => {
//     try {
//         const { vehicleId, lat, lon, speed, heading } = req.body;
//         if (!vehicleId || !lat || !lon) {
//             return res.status(400).json({ error: "vehicleId, lat, lon required" });
//         }
//         // Save to MongoDB
//         const loc = await Location.create({
//             vehicleId,
//             lat,
//             lon,
//             speed: speed || 0,
//             heading: heading || 0,
//             ts: new Date()
//         });
//         // 🔥 REALTIME SOCKET UPDATE
//         io.emit("location:update", {
//             vehicleId,
//             lat,
//             lon,
//             speed,
//             heading,
//             ts: loc.ts
//         });
//         return res.json({ success: true, data: loc });
//     } catch (err: any) {
//         console.error("Location Update Error:", err.message);
//         return res.status(500).json({ error: err.message });
//     }
// };
// export const updateLocation = async (req: Request, res: Response) => {
//     try {
//         const { deviceId, lat, lon, speed, heading } = req.body;
//         console.log(req.body);
//         if (!deviceId || !lat || !lon) {
//             return res.status(400).json({ error: "deviceId, lat, lon required" });
//         }
//         // 1. get the device
//         const device = await Device.findOne({ deviceId });
//         if (!device) {
//             return res.status(404).json({ error: "Device not registered" });
//         }
//         // 2. find assigned vehicle
//         const vehicleId = device.vehicleId;
//         if (!vehicleId) {
//             return res.status(400).json({ error: "Device is not assigned to any vehicle" });
//         }
//         // 3. save location
//         const loc = await Location.create({
//             vehicleId,
//             lat,
//             lon,
//             speed: speed || 0,
//             heading: heading || 0,
//             ts: new Date()
//         });
//         // 4. emit realtime update
//         io.emit("location:update", {
//             vehicleId,
//             lat,
//             lon,
//             speed,
//             heading,
//             ts: loc.ts
//         });
//         return res.json({ success: true, data: loc });
//     } catch (err: any) {
//         console.error("Location Update Error:", err.message);
//         return res.status(500).json({ error: err.message });
//     }
// };
const updateLocation = async (req, res) => {
    try {
        const { deviceId, vehicleId, lat, lon, speed, heading } = req.body;
        if (lat === undefined || lon === undefined) {
            return res.status(400).json({ error: "lat & lon are required" });
        }
        let finalVehicleId = vehicleId; // used for simulator case
        // ------------------------
        // 1️⃣ IF DEVICE ID IS SENT → GPS DEVICE UPDATE
        // ------------------------
        if (deviceId) {
            const device = await Device_1.default.findOne({ deviceId });
            if (!device) {
                return res.status(404).json({ error: "Device not registered" });
            }
            if (!device.vehicleId) {
                return res.status(400).json({ error: "Device is not assigned to any vehicle" });
            }
            finalVehicleId = device.vehicleId; // overwrite with vehicle mapped to device
        }
        // ------------------------
        // 2️⃣ IF NO VEHICLE ID FOUND → ERROR
        // ------------------------
        if (!finalVehicleId) {
            return res.status(400).json({
                error: "vehicleId or deviceId (mapped to vehicle) is required",
            });
        }
        // ------------------------
        // 3️⃣ SAVE LOCATION
        // ------------------------
        const loc = await Location_1.default.create({
            vehicleId: finalVehicleId,
            lat,
            lon,
            speed: speed || 0,
            heading: heading || 0,
            ts: new Date()
        });
        // ------------------------
        // 4️⃣ EMIT REALTIME
        // ------------------------
        index_1.io.emit("location:update", {
            vehicleId: finalVehicleId,
            lat,
            lon,
            speed,
            heading,
            ts: loc.ts
        });
        return res.json({ success: true, data: loc });
    }
    catch (err) {
        console.error("Location Update Error:", err.message);
        return res.status(500).json({ error: err.message });
    }
};
exports.updateLocation = updateLocation;
const latestLocation = async (req, res) => {
    const latest = await Location_1.default.aggregate([
        { $sort: { ts: -1 } },
        {
            $group: {
                _id: "$vehicleId",
                doc: { $first: "$$ROOT" }
            }
        }
    ]);
    res.json(latest.map(l => l.doc));
};
exports.latestLocation = latestLocation;
const getHistory = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const limit = Number(req.query.limit) || 50;
        const history = await Location_1.default.find({ vehicleId })
            .sort({ ts: -1 })
            .limit(limit);
        return res.json(history);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
};
exports.getHistory = getHistory;
const getLastLocation = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const last = await Location_1.default.findOne({ vehicleId })
            .sort({ ts: -1 });
        return res.json(last || null);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
};
exports.getLastLocation = getLastLocation;
const getLatestForAll = async (req, res) => {
    try {
        const pipeline = [
            { $sort: { ts: -1 } },
            {
                $group: {
                    _id: "$vehicleId",
                    vehicleId: { $first: "$vehicleId" },
                    lat: { $first: "$lat" },
                    lon: { $first: "$lon" },
                    speed: { $first: "$speed" },
                    heading: { $first: "$heading" },
                    ts: { $first: "$ts" }
                }
            }
        ];
        const latest = await Location_1.default.aggregate(pipeline);
        return res.json(latest);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
};
exports.getLatestForAll = getLatestForAll;

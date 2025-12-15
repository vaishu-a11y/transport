import { Request, Response } from "express";
import Location from "../models/Location";
import { io } from "../index"
import Device from "../models/Device";
import { haversineDistance } from "../utils/distance";
import Route from "../models/Route";
import Vehicle from "../models/Vehicle";

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

export const updateLocation = async (req: Request, res: Response) => {
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
            const device = await Device.findOne({ deviceId });

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
        const loc = await Location.create({
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
        io.emit("location:update", {
            vehicleId: finalVehicleId,
            lat,
            lon,
            speed,
            heading,
            ts: loc.ts
        });

        return res.json({ success: true, data: loc });

    } catch (err: any) {
        console.error("Location Update Error:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

export const latestLocation = async (req: Request, res: Response) => {
    const latest = await Location.aggregate([
        { $sort: { ts: -1 as -1 } },
        {
            $group: {
                _id: "$vehicleId",
                doc: { $first: "$$ROOT" }
            }
        }
    ]);

    res.json(latest.map(l => l.doc));
}

export const getHistory = async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.params;
        const limit = Number(req.query.limit) || 50;

        const history = await Location.find({ vehicleId })
            .sort({ ts: -1 as -1 })
            .limit(limit);

        return res.json(history);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const getLastLocation = async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.params;

        const last = await Location.findOne({ vehicleId })
            .sort({ ts: -1 });

        return res.json(last || null);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const getLatestForAll = async (req: Request, res: Response) => {
    try {
        const pipeline = [
            { $sort: { ts: -1 as -1 } },
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

        const latest = await Location.aggregate(pipeline);
        return res.json(latest);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
};

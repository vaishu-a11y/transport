"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const axios_1 = __importDefault(require("axios"));
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const Route_1 = __importDefault(require("../models/Route"));
const Location_1 = __importDefault(require("../models/Location"));
// const SERVER = "http://localhost:5000";
const INTERVAL = 1000;
// Linear interpolation
function interpolate(a, b, t) {
    return {
        lat: a.lat + (b.lat - a.lat) * t,
        lon: a.lon + (b.lon - a.lon) * t,
    };
}
async function connectDB() {
    await mongoose_1.default.connect("mongodb://localhost:27017/transport");
    console.log("Simulator connected to MongoDB");
}
async function start() {
    await connectDB();
    await Location_1.default.deleteMany({});
    const vehicles = await Vehicle_1.default.find({ active: true }).lean();
    if (vehicles.length === 0) {
        console.log("No vehicles found");
        return;
    }
    vehicles.forEach(simulateVehicle);
}
// function simulateVehicle(vehicle: any) {
//     if (!vehicle.routeId) {
//         console.log("Vehicle has no route", vehicle.vehicleId);
//         return;
//     }
//     Route.findById(vehicle.routeId).lean().then((route: any) => {
//         if (!route || !route.stops || route.stops.length < 2) {
//             console.log("Route invalid for", vehicle.vehicleId);
//             return;
//         }
//         let index = 0;
//         let t = 0;
//         const speed = 0.02; // 2% per update -> full stop in 50 updates = ~50 seconds
//         let isPaused = false;
//         console.log("Simulating", vehicle.vehicleId, "on route", route._id);
//         setInterval(async () => {
//             const start = route.stops[index];
//             const end = route.stops[(index + 1) % route.stops.length];
//             const pos = interpolate(start, end, t);
//             // Send to backend REST API
//             try {
//                 await axios.post(`${SERVER}/api/v1/location/update`, {
//                     vehicleId: vehicle.vehicleId,
//                     deviceId: "",
//                     lat: pos.lat,
//                     lon: pos.lon,
//                     speed: 35,
//                 });
//                 console.log(
//                     vehicle.vehicleId,
//                     `→ ${pos.lat.toFixed(5)}, ${pos.lon.toFixed(5)}`
//                 );
//             } catch (err) {
//                 console.error("Error sending location");
//             }
//             t += speed;
//             if (t >= 1) {
//                 t = 0;
//                 index++;
//                 // Reset after reaching the LAST stop, not second-last
//                 if (index === route.stops.length) {
//                     index = 0;
//                 }
//             }
//         }, INTERVAL);
//     });
// }
function simulateVehicle(vehicle) {
    if (!vehicle.routeId) {
        console.log("Vehicle has no route", vehicle.vehicleId);
        return;
    }
    Route_1.default.findById(vehicle.routeId).lean().then((route) => {
        if (!route || !route.stops || route.stops.length < 2) {
            console.log("Route invalid for", vehicle.vehicleId);
            return;
        }
        let index = 0;
        let t = 0;
        const speed = 0.02; // interpolation speed per update
        let isPaused = false;
        console.log("Simulating", vehicle.vehicleId, "on route", route._id);
        setInterval(async () => {
            if (isPaused)
                return; // skip updates while paused
            const start = route.stops[index];
            const end = route.stops[(index + 1) % route.stops.length];
            const pos = interpolate(start, end, t);
            // Send to backend REST API
            try {
                await axios_1.default.post(`${process.env.SERVER_URL}/api/v1/location/update`, {
                    vehicleId: vehicle.vehicleId,
                    deviceId: "",
                    lat: pos.lat,
                    lon: pos.lon,
                    speed: 35,
                });
                console.log(vehicle.vehicleId, `→ ${pos.lat.toFixed(5)}, ${pos.lon.toFixed(5)}`);
            }
            catch (err) {
                console.error("Error sending location");
            }
            t += speed;
            if (t >= 1) {
                t = 0;
                index++;
                // Pause 5 seconds at stop
                isPaused = true;
                setTimeout(() => {
                    isPaused = false;
                }, 5000);
                // Reset after reaching the last stop
                if (index === route.stops.length) {
                    index = 0;
                }
            }
        }, INTERVAL);
    });
}
start();

// seed.ts
import mongoose from "mongoose";
import Alert from "../models/Alert";
import Device from "../models/Device";
import Route from "../models/Route";
import Vehicle from "../models/Vehicle";
import dotenv from "dotenv";
import User from "../models/User";
async function seed() {
    try {
        dotenv.config();
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/transport"); // <-- replace with your DB
        await mongoose.connection.dropDatabase();
        console.log("Connected to MongoDB");

        // --------- ADMIN USERS ---------
        const users = await User.create([
            {
                name: "System Admin",
                email: "admin@gmail.com",
                password: "admin123", // This will be automatically hashed by the User model pre-save middleware
                role: "admin"
            },
            {
                name: "John Driver",
                email: "driver@gmail.com",
                password: "driver123",
                role: "user"
            },
            {
                name: "Sarah Manager",
                email: "manager@gmail.com",
                password: "manager123",
                role: "user"
            }
        ]);
        console.log("Users inserted:", users.length);

        // --------- ALERTS ---------
        const alerts = await Alert.insertMany([
            {
                routeId: "ROUTE001",
                vehicleId: "VEH001",
                type: "delay",
                message: "Route 5 is delayed due to traffic",
                active: true,
            },
            {
                routeId: "ROUTE002",
                vehicleId: "VEH002",
                type: "info",
                message: "Vehicle maintenance scheduled tomorrow",
                active: true,
            },
        ]);
        console.log("Alerts inserted:", alerts.length);

        // --------- DEVICES ---------
        const devices = await Device.insertMany([
            {
                deviceId: "DEV001",
                imei: "123456789012345",
                secret: "secret1",
                vehicleId: "VEH001",
                status: "online",
                lastSeen: new Date(),
            },
            {
                deviceId: "DEV002",
                imei: "987654321098765",
                secret: "secret2",
                vehicleId: "VEH002",
                status: "offline",
                lastSeen: new Date(),
            },
        ]);
        console.log("Devices inserted:", devices.length);

        // --------- ROUTES ---------
        const routes = await Route.insertMany([
            {
                name: "Central Loop",
                description: "Central loop covering major landmarks",
                stops: [
                    { name: "Station", lat: 19.876, lon: 75.343, sequence: 1 },
                    { name: "Hospital", lat: 19.879, lon: 75.350, sequence: 2 },
                    { name: "Market", lat: 19.882, lon: 75.356, sequence: 3 },
                ],
            },
            {
                name: "East Route",
                description: "Route from east to central",
                stops: [
                    { name: "East Station", lat: 19.883, lon: 75.360, sequence: 1 },
                    { name: "East Market", lat: 19.885, lon: 75.365, sequence: 2 },
                    { name: "East Hospital", lat: 19.888, lon: 75.370, sequence: 3 },
                ]
            },
            {
                name: "West Route",
                description: "West route",
                stops: [
                    { name: "West Station", lat: 19.870, lon: 75.340, sequence: 1 },
                    { name: "West Market", lat: 19.868, lon: 75.335, sequence: 2 },
                    { name: "West Hospital", lat: 19.865, lon: 75.330, sequence: 3 },
                ]
            },
            {
                name: "Airport Shuttle",
                description: "Route connecting city center to airport",
                stops: [
                    { name: "City Center", lat: 19.876, lon: 75.343, sequence: 1 },
                    { name: "Airport Midway", lat: 19.890, lon: 75.400, sequence: 2 },
                    { name: "Airport Terminal", lat: 19.900, lon: 75.410, sequence: 3 },
                ]
            }

        ]);
        console.log("Routes inserted:", routes.length);

        // --------- VEHICLES ---------
        const vehicles = await Vehicle.insertMany([
            {
                vehicleId: "VEH001",
                name: "Bus 1",
                routeId: routes[0]._id.toString(),
                deviceId: "DEV001",
                active: true,
                location: { lat: 19.876, lon: 75.343 },
                speed: 40,
                lastStopSequence: 1,
            },
            {
                vehicleId: "VEH002",
                name: "Bus 2",
                routeId: routes[1]._id.toString(),
                deviceId: "DEV002",
                active: true,
                location: { lat: 19.879, lon: 75.350 },
                speed: 30,
                lastStopSequence: 1,
            },
            {
                vehicleId: "VEH003",
                name: "Bus 3",
                routeId: routes[2]._id.toString(),
                active: false,
                location: { lat: 19.882, lon: 75.356 },
                speed: 0,
                lastStopSequence: 0,
            },
        ]);
        console.log("Vehicles inserted:", vehicles.length);

        console.log("Seeding completed!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seed();
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVehiclesWithDevice = exports.getVehicleByRoute = exports.toggleVehicleStatus = exports.deleteVehicle = exports.updateVehicle = exports.assignDevice = exports.getVehicles = exports.addVehicle = void 0;
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const Device_1 = __importDefault(require("../models/Device"));
// create a vehicle (admin)
const addVehicle = async (req, res) => {
    try {
        const { vehicleId, name, routeId, deviceId } = req.body;
        const exists = await Vehicle_1.default.findOne({ vehicleId });
        if (exists)
            return res.status(400).json({ error: "vehicleId exists" });
        const v = new Vehicle_1.default({ vehicleId, name, routeId, deviceId });
        await v.save();
        // mark device assigned
        if (deviceId) {
            await Device_1.default.findOneAndUpdate({ deviceId }, { vehicleId, status: "online" }, { upsert: false });
        }
        res.json({ ok: true, vehicle: v });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.addVehicle = addVehicle;
// list vehicles
const getVehicles = async (req, res) => {
    const list = await Vehicle_1.default.find().lean();
    res.json(list);
};
exports.getVehicles = getVehicles;
// assign device to vehicle
const assignDevice = async (req, res) => {
    try {
        const { vehicleId, deviceId } = req.body;
        await Vehicle_1.default.findOneAndUpdate({ vehicleId }, { deviceId });
        await Device_1.default.findOneAndUpdate({ deviceId }, { vehicleId, status: "online" }, { upsert: true });
        res.json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.assignDevice = assignDevice;
// update vehicle
const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params; // vehicle _id
        const { vehicleId, name, routeId, deviceId, active } = req.body;
        const updatedVehicle = await Vehicle_1.default.findByIdAndUpdate(id, { vehicleId, name, routeId, deviceId, active }, { new: true });
        // if device assigned, mark it online
        if (deviceId) {
            await Device_1.default.findOneAndUpdate({ deviceId }, { vehicleId, status: "online" }, { upsert: true });
        }
        res.json({ ok: true, vehicle: updatedVehicle });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateVehicle = updateVehicle;
// delete vehicle
const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params; // vehicle _id
        // remove vehicle
        const vehicle = await Vehicle_1.default.findByIdAndDelete(id);
        // unassign device if any
        if (vehicle?.deviceId) {
            await Device_1.default.findOneAndUpdate({ deviceId: vehicle.deviceId }, { vehicleId: null, status: "unassigned" });
        }
        res.json({ ok: true, message: "Vehicle deleted" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteVehicle = deleteVehicle;
// toggle active/inactive
const toggleVehicleStatus = async (req, res) => {
    try {
        const { id } = req.params; // vehicle _id
        const vehicle = await Vehicle_1.default.findById(id);
        if (!vehicle)
            return res.status(404).json({ error: "Vehicle not found" });
        vehicle.active = !vehicle.active;
        await vehicle.save();
        res.json({ ok: true, vehicle });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.toggleVehicleStatus = toggleVehicleStatus;
// get vehicle by routeId (used for Live Tracking)
const getVehicleByRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        if (!routeId) {
            return res.status(400).json({ error: "routeId required" });
        }
        const vehicle = await Vehicle_1.default.findOne({ routeId }).lean();
        if (!vehicle) {
            return res.json(null);
        }
        res.json(vehicle);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getVehicleByRoute = getVehicleByRoute;
// Returns only vehicles that have device assigned
const getVehiclesWithDevice = async (req, res) => {
    const vehicles = await Vehicle_1.default.find({ deviceId: { $exists: true, $ne: "" } });
    res.json(vehicles);
};
exports.getVehiclesWithDevice = getVehiclesWithDevice;

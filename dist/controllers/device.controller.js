"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDevice = exports.updateDevice = exports.createDevice = exports.getDevices = void 0;
const Device_1 = __importDefault(require("../models/Device"));
// Get all devices
const getDevices = async (req, res) => {
    try {
        const devices = await Device_1.default.find();
        res.json(devices);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getDevices = getDevices;
// Create a device
const createDevice = async (req, res) => {
    try {
        const { deviceId, imei, secret, vehicleId, status } = req.body;
        const exists = await Device_1.default.findOne({ deviceId });
        if (exists)
            return res.status(400).json({ error: "Device ID already exists" });
        const device = new Device_1.default({ deviceId, imei, secret, vehicleId, status });
        await device.save();
        res.json(device);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createDevice = createDevice;
// Update a device by deviceId
const updateDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { imei, secret, vehicleId, status } = req.body;
        const device = await Device_1.default.findOneAndUpdate({ deviceId }, { imei, secret, vehicleId, status }, { new: true });
        if (!device)
            return res.status(404).json({ error: "Device not found" });
        res.json({ ok: true, device });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateDevice = updateDevice;
// Delete a device by deviceId
const deleteDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const device = await Device_1.default.findOneAndDelete({ deviceId });
        if (!device)
            return res.status(404).json({ error: "Device not found" });
        res.json({ ok: true, message: "Device deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteDevice = deleteDevice;

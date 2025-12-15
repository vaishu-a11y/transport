import { Request, Response } from "express";
import Device from "../models/Device";

// Get all devices
export const getDevices = async (req: Request, res: Response) => {
    try {
        const devices = await Device.find();
        res.json(devices);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Create a device
export const createDevice = async (req: Request, res: Response) => {
    try {
        const { deviceId, imei, secret, vehicleId, status } = req.body;
        const exists = await Device.findOne({ deviceId });
        if (exists) return res.status(400).json({ error: "Device ID already exists" });

        const device = new Device({ deviceId, imei, secret, vehicleId, status });
        await device.save();
        res.json(device);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Update a device by deviceId
export const updateDevice = async (req: Request, res: Response) => {
    try {
        const { deviceId } = req.params;
        const { imei, secret, vehicleId, status } = req.body;

        const device = await Device.findOneAndUpdate(
            { deviceId },
            { imei, secret, vehicleId, status },
            { new: true }
        );

        if (!device) return res.status(404).json({ error: "Device not found" });

        res.json({ ok: true, device });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a device by deviceId
export const deleteDevice = async (req: Request, res: Response) => {
    try {
        const { deviceId } = req.params;
        const device = await Device.findOneAndDelete({ deviceId });
        if (!device) return res.status(404).json({ error: "Device not found" });

        res.json({ ok: true, message: "Device deleted successfully" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};


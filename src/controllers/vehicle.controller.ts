import { Request, Response } from "express";
import Vehicle from "../models/Vehicle";
import Device from "../models/Device";

// create a vehicle (admin)
export const addVehicle = async (req: Request, res: Response) => {
    try {
        const { vehicleId, name, routeId, deviceId } = req.body;
        const exists = await Vehicle.findOne({ vehicleId });
        if (exists) return res.status(400).json({ error: "vehicleId exists" });
        const v = new Vehicle({ vehicleId, name, routeId, deviceId });
        await v.save();
        // mark device assigned
        if (deviceId) {
            await Device.findOneAndUpdate({ deviceId }, { vehicleId, status: "online" }, { upsert: false });
        }
        res.json({ ok: true, vehicle: v });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

// list vehicles
export const getVehicles = async (req: Request, res: Response) => {
    const list = await Vehicle.find().lean();
    res.json(list);
}

// assign device to vehicle
export const assignDevice = async (req: Request, res: Response) => {
    try {
        const { vehicleId, deviceId } = req.body;
        await Vehicle.findOneAndUpdate({ vehicleId }, { deviceId });
        await Device.findOneAndUpdate({ deviceId }, { vehicleId, status: "online" }, { upsert: true });
        res.json({ ok: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

// update vehicle
export const updateVehicle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // vehicle _id
        const { vehicleId, name, routeId, deviceId, active } = req.body;

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            id,
            { vehicleId, name, routeId, deviceId, active },
            { new: true }
        );

        // if device assigned, mark it online
        if (deviceId) {
            await Device.findOneAndUpdate({ deviceId }, { vehicleId, status: "online" }, { upsert: true });
        }

        res.json({ ok: true, vehicle: updatedVehicle });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// delete vehicle
export const deleteVehicle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // vehicle _id

        // remove vehicle
        const vehicle = await Vehicle.findByIdAndDelete(id);

        // unassign device if any
        if (vehicle?.deviceId) {
            await Device.findOneAndUpdate(
                { deviceId: vehicle.deviceId },
                { vehicleId: null, status: "unassigned" }
            );
        }

        res.json({ ok: true, message: "Vehicle deleted" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// toggle active/inactive
export const toggleVehicleStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // vehicle _id

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

        vehicle.active = !vehicle.active;
        await vehicle.save();

        res.json({ ok: true, vehicle });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// get vehicle by routeId (used for Live Tracking)
export const getVehicleByRoute = async (req: Request, res: Response) => {
    try {
        const { routeId } = req.params;

        if (!routeId) {
            return res.status(400).json({ error: "routeId required" });
        }

        const vehicle = await Vehicle.findOne({ routeId }).lean();

        if (!vehicle) {
            return res.json(null);
        }

        res.json(vehicle);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Returns only vehicles that have device assigned
export const getVehiclesWithDevice = async (req: Request, res: Response) => {
    const vehicles = await Vehicle.find({ deviceId: { $exists: true, $ne: "" } });

    res.json(vehicles);
};


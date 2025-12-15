import { Request, Response } from "express";
import Alert from "../models/Alert";
import { io } from "../index";

export const createAlert = async (req: Request, res: Response) => {
    try {
        const { routeId, vehicleId, type, message } = req.body;
        const a = new Alert({ routeId, vehicleId, type, message });
        await a.save();
        // emit to clients: route-specific or global
        if (routeId) io.to(`route_${routeId}`).emit("alert:new", a);
        io.emit("alert:new", a);
        res.json({ ok: true, alert: a });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
export const getAllAlerts = async (req: Request, res: Response) => {
    const list = await Alert.find().sort({ ts: -1 }).lean();
    res.json(list);
}
export const getActiveAlerts = async (req: Request, res: Response) => {
    const list = await Alert.find({ active: true }).sort({ ts: -1 }).limit(100).lean();
    res.json(list);
}

// update alert
export const updateAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { routeId, vehicleId, type, message, active } = req.body;

        const updatedAlert = await Alert.findByIdAndUpdate(
            id,
            { routeId, vehicleId, type, message, active },
            { new: true }
        );

        if (!updatedAlert) return res.status(404).json({ error: "Alert not found" });

        // emit update to clients
        if (updatedAlert.routeId) io.to(`route_${updatedAlert.routeId}`).emit("alert:updated", updatedAlert);
        io.emit("alert:updated", updatedAlert);

        res.json({ ok: true, alert: updatedAlert });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// delete alert
export const deleteAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedAlert = await Alert.findByIdAndDelete(id);

        if (!deletedAlert) return res.status(404).json({ error: "Alert not found" });

        // emit delete event
        if (deletedAlert.routeId) io.to(`route_${deletedAlert.routeId}`).emit("alert:deleted", deletedAlert);
        io.emit("alert:deleted", deletedAlert);

        res.json({ ok: true, message: "Alert deleted" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// toggle alert active/inactive
export const toggleAlertStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const alert = await Alert.findById(id);
        if (!alert) return res.status(404).json({ error: "Alert not found" });

        alert.active = !alert.active;
        await alert.save();

        // emit toggle event
        if (alert.routeId) io.to(`route_${alert.routeId}`).emit("alert:toggled", alert);
        io.emit("alert:toggled", alert);

        res.json({ ok: true, alert });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

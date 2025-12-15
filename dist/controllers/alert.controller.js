"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleAlertStatus = exports.deleteAlert = exports.updateAlert = exports.getActiveAlerts = exports.getAllAlerts = exports.createAlert = void 0;
const Alert_1 = __importDefault(require("../models/Alert"));
const index_1 = require("../index");
const createAlert = async (req, res) => {
    try {
        const { routeId, vehicleId, type, message } = req.body;
        const a = new Alert_1.default({ routeId, vehicleId, type, message });
        await a.save();
        // emit to clients: route-specific or global
        if (routeId)
            index_1.io.to(`route_${routeId}`).emit("alert:new", a);
        index_1.io.emit("alert:new", a);
        res.json({ ok: true, alert: a });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createAlert = createAlert;
const getAllAlerts = async (req, res) => {
    const list = await Alert_1.default.find().sort({ ts: -1 }).lean();
    res.json(list);
};
exports.getAllAlerts = getAllAlerts;
const getActiveAlerts = async (req, res) => {
    const list = await Alert_1.default.find({ active: true }).sort({ ts: -1 }).limit(100).lean();
    res.json(list);
};
exports.getActiveAlerts = getActiveAlerts;
// update alert
const updateAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const { routeId, vehicleId, type, message, active } = req.body;
        const updatedAlert = await Alert_1.default.findByIdAndUpdate(id, { routeId, vehicleId, type, message, active }, { new: true });
        if (!updatedAlert)
            return res.status(404).json({ error: "Alert not found" });
        // emit update to clients
        if (updatedAlert.routeId)
            index_1.io.to(`route_${updatedAlert.routeId}`).emit("alert:updated", updatedAlert);
        index_1.io.emit("alert:updated", updatedAlert);
        res.json({ ok: true, alert: updatedAlert });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateAlert = updateAlert;
// delete alert
const deleteAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAlert = await Alert_1.default.findByIdAndDelete(id);
        if (!deletedAlert)
            return res.status(404).json({ error: "Alert not found" });
        // emit delete event
        if (deletedAlert.routeId)
            index_1.io.to(`route_${deletedAlert.routeId}`).emit("alert:deleted", deletedAlert);
        index_1.io.emit("alert:deleted", deletedAlert);
        res.json({ ok: true, message: "Alert deleted" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteAlert = deleteAlert;
// toggle alert active/inactive
const toggleAlertStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const alert = await Alert_1.default.findById(id);
        if (!alert)
            return res.status(404).json({ error: "Alert not found" });
        alert.active = !alert.active;
        await alert.save();
        // emit toggle event
        if (alert.routeId)
            index_1.io.to(`route_${alert.routeId}`).emit("alert:toggled", alert);
        index_1.io.emit("alert:toggled", alert);
        res.json({ ok: true, alert });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.toggleAlertStatus = toggleAlertStatus;

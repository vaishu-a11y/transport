import mongoose, { Schema, Document } from "mongoose";

export interface IDevice extends Document {
    imei?: string;
    deviceId: string; // unique identifier used by device
    secret?: string; // token for device to authenticate (optional)
    vehicleId?: string;
    lastSeen?: Date;
    status?: "online" | "offline" | "unassigned";
}

const DeviceSchema = new Schema<IDevice>({
    imei: { type: String },
    deviceId: { type: String, required: true, unique: true },
    secret: { type: String },
    vehicleId: { type: String },
    lastSeen: { type: Date },
    status: { type: String, enum: ["online", "offline", "unassigned"], default: "unassigned" }
}, { timestamps: true });

export default mongoose.model<IDevice>("Device", DeviceSchema);

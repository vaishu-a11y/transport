import mongoose, { Schema, Document } from "mongoose";

export interface IAlert extends Document {
    routeId?: string;
    vehicleId?: string;
    type: "delay" | "route_change" | "out_of_service" | "info";
    message: string;
    ts: Date;
    active: boolean;
}

const AlertSchema = new Schema<IAlert>({
    routeId: String,
    vehicleId: String,
    type: { type: String, enum: ["delay", "route_change", "out_of_service", "info"], default: "info" },
    message: { type: String, required: true },
    ts: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});

export default mongoose.model<IAlert>("Alert", AlertSchema);

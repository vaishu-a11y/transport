import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
    vehicleId: string; // unique id
    name: string;
    routeId?: string; // assigned route
    deviceId?: string; // linked device
    active: boolean;
    location?: { lat: number; lon: number };
    speed?: number; // current speed in km/h
    lastStopSequence?: number; // last stop passed in route
}

const VehicleSchema = new Schema<IVehicle>({
    vehicleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    routeId: { type: String },
    deviceId: { type: String },
    active: { type: Boolean, default: true },
    location: { lat: Number, lon: Number },
    speed: { type: Number, default: 0 },
    lastStopSequence: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IVehicle>("Vehicle", VehicleSchema);

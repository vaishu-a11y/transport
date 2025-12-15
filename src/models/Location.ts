import mongoose, { Schema, Document } from "mongoose";

export interface ILocation extends Document {
    vehicleId: string;
    lat: number;
    lon: number;
    speed?: number;
    heading?: number;
    ts: Date;
}

const LocationSchema = new Schema<ILocation>({
    vehicleId: { type: String, required: true, index: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    speed: Number,
    heading: Number,
    ts: { type: Date, default: Date.now, index: true }
});

LocationSchema.index({ vehicleId: 1, ts: -1 });

export default mongoose.model<ILocation>("Location", LocationSchema);

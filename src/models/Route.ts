import mongoose, { Schema, Document } from "mongoose";

export interface IStop {
    name: string;
    lat: number;
    lon: number;
    sequence: number;
}

export interface IRoute extends Document {
    name: string;
    description?: string;
    stops: IStop[];
    geometry?: any; // optional geojson
}

const StopSchema = new Schema<IStop>({
    name: String,
    lat: Number,
    lon: Number,
    sequence: Number
});

const RouteSchema = new Schema<IRoute>({
    name: { type: String, required: true },
    description: String,
    stops: { type: [StopSchema], default: [] },
    geometry: { type: Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model<IRoute>("Route", RouteSchema);

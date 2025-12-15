import { Request, Response } from "express";
import Route from "../models/Route";
import Vehicle from "../models/Vehicle";
import { haversineDistance } from "../utils/distance";

export const addRoute = async (req: Request, res: Response) => {
    try {
        const { name, description, stops } = req.body;
        const r = new Route({ name, description, stops });
        await r.save();
        res.json({ ok: true, route: r });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export const getAllRoutes = async (req: Request, res: Response) => {
    const r = await Route.find().lean();
    res.json(r);
}

export const getRouteById = async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(id);

    const r = await Route.findById(id).lean();
    if (!r) return res.status(404).json({ error: "not found" });
    res.json(r);
}

// update route
export const updateRoute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, stops } = req.body;

        const updatedRoute = await Route.findByIdAndUpdate(
            id,
            { name, description, stops },
            { new: true }
        );

        if (!updatedRoute) return res.status(404).json({ error: "Route not found" });

        res.json({ ok: true, route: updatedRoute });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// delete route
export const deleteRoute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deletedRoute = await Route.findByIdAndDelete(id);

        if (!deletedRoute) return res.status(404).json({ error: "Route not found" });

        res.json({ ok: true, message: "Route deleted successfully" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getVehiclesAtStop = async (req: Request, res: Response) => {
    try {
        const { stopName } = req.query;
        console.log(req.query);

        if (!stopName || typeof stopName !== "string") {
            return res.status(400).json({ error: "stopName is required" });
        }

        // 1️⃣ Find all routes containing this stop
        const routes = await Route.find({ "stops.name": stopName }).lean();

        if (!routes.length) return res.json([]);

        const routeIds = routes.map(r => r._id.toString());

        // 2️⃣ Find active vehicles on these routes
        const vehicles = await Vehicle.find({
            routeId: { $in: routeIds },
            active: true,
            location: { $exists: true }
        }).lean();

        // 3️⃣ Compute ETA for each vehicle
        const results = vehicles.map(v => {
            if (!v.location?.lat || !v.location?.lon) return null;

            const route = routes.find(r => r._id.toString() === v.routeId);
            if (!route) return null;

            const stop = route.stops.find(s => s.name === stopName);
            if (!stop) return null;

            if ((v.lastStopSequence || 0) >= stop.sequence) return null; // already passed

            const distance = haversineDistance(v.location.lat, v.location.lon, stop.lat, stop.lon);
            const speed = v.speed || 30;
            const etaMinutes = speed > 0 ? (distance / speed) * 60 : 0;

            return {
                vehicleId: v.vehicleId,
                name: v.name,
                routeId: v.routeId,
                location: v.location,
                eta: new Date(Date.now() + etaMinutes * 60 * 1000).toLocaleTimeString(), // exact ETA
            };
        }).filter(Boolean);

        res.json(results);

    } catch (err: any) {
        console.error("getVehiclesAtStop error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const getBusStopsWithETA = async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.query;

        if (!vehicleId || typeof vehicleId !== "string") {
            return res.status(400).json({ error: "vehicleId is required" });
        }

        // 1️⃣ Get vehicle
        const vehicle = await Vehicle.findOne({ vehicleId }).lean();
        if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

        if (!vehicle.routeId) {
            return res.status(400).json({ error: "Vehicle has no route assigned" });
        }

        // 2️⃣ Get route with stops
        const route = await Route.findById(vehicle.routeId).lean();
        if (!route) return res.status(404).json({ error: "Route not found" });

        const stops = route.stops.sort((a, b) => a.sequence - b.sequence);

        // 3️⃣ If no location yet (device offline or not sending)
        if (!vehicle.location?.lat || !vehicle.location?.lon) {
            return res.json(
                stops.map(stop => ({
                    stopName: stop.name,
                    sequence: stop.sequence,
                    lat: stop.lat,
                    lon: stop.lon,
                    eta: "No GPS",
                }))
            );
        }

        // 4️⃣ Calculate ETA for each stop
        const speed = vehicle.speed && vehicle.speed > 2 ? vehicle.speed : 25; // fallback speed

        const response = stops.map(stop => {
            const dist = haversineDistance(
                vehicle.location!.lat,
                vehicle.location!.lon,
                stop.lat,
                stop.lon
            );

            const etaMinutes = (dist / speed) * 60; // km / (km/h) * 60

            return {
                stopName: stop.name,
                sequence: stop.sequence,
                lat: stop.lat,
                lon: stop.lon,
                eta: `${Math.round(etaMinutes)} min`
            };
        });

        res.json(response);

    } catch (err: any) {
        console.error("getBusStopsWithETA error:", err);
        res.status(500).json({ error: err.message });
    }
};







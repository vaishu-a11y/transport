import express from "express";
import * as locationController from "../controllers/location.controller";

const router = express.Router();

router
    .get("/latest", locationController.getLatestForAll)
    .get("/history/:vehicleId", locationController.getHistory)
    .get("/:vehicleId/last", locationController.getLastLocation)
    .post("/update", locationController.updateLocation)

export default router;

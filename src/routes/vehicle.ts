import express from "express";
import { authMiddleware } from "../utils/auth";
import * as vehicleController from "../controllers/vehicle.controller"

const router = express.Router();


router
    .post("/create", authMiddleware, vehicleController.addVehicle)
    .post("/assign-device", authMiddleware, vehicleController.assignDevice)
    .get("/all", vehicleController.getVehicles)
    .get("/with-device", vehicleController.getVehiclesWithDevice)
    .put("/:id", authMiddleware, vehicleController.updateVehicle)
    .delete("/:id", authMiddleware, vehicleController.deleteVehicle)
    .put("/toggle-status/:id", authMiddleware, vehicleController.toggleVehicleStatus)
    .get("/byRoute/:routeId", vehicleController.getVehicleByRoute);


export default router;

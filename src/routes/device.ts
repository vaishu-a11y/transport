import express from "express";
import { authMiddleware } from "../utils/auth";
import * as deviceController from "../controllers/device.controller"

const router = express.Router();

router
    .post("/create", authMiddleware, deviceController.createDevice)
    .get("/all", deviceController.getDevices)
    .put("/update/:deviceId", deviceController.updateDevice)
    .delete("/delete/:deviceId", deviceController.deleteDevice);

export default router;

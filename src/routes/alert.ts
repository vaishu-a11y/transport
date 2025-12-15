import express from "express";
import { authMiddleware } from "../utils/auth";
import * as alertController from "../controllers/alert.controller"

const router = express.Router();

router
    .post("/create", authMiddleware, alertController.createAlert)
    .get("/all", alertController.getAllAlerts)
    .get("/active", alertController.getActiveAlerts)
    .put("/:id", alertController.updateAlert)
    .delete("/:id", alertController.deleteAlert)
    .put("/toggle/:id", alertController.toggleAlertStatus);

export default router;

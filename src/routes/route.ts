import express from "express";
import { authMiddleware } from "../utils/auth";
import * as routeController from "../controllers/route.controller"

const router = express.Router();

router
    .post("/create", authMiddleware, routeController.addRoute)
    .get("/all", routeController.getAllRoutes)
    .get("/vehicles-at-stop", routeController.getVehiclesAtStop)
    .get("/bus-stops", routeController.getBusStopsWithETA)
    .get("/:id", routeController.getRouteById)
    .put("/:id", routeController.updateRoute)
    .delete("/:id", routeController.deleteRoute)

export default router;

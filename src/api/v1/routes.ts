import express, { Request, Response } from "express";
import auth from "./controllers/auth";
import users from "./controllers/users";
import devices from "./controllers/devices";
import geozones from "./controllers/geozones";
import deviceData from "./controllers/deviceData";
import eventTypes from "./controllers/eventTypes";
import { check } from "express-validator";
import { validationHandler } from "./helpers/validation";
import {
  authenticateJwt,
  authenticateLocal,
} from "./helpers/auth";

const router = express.Router();

// Auth
router.post("/login", authenticateLocal(), auth.login);
router.post("/refreshToken", auth.refreshToken);
router.post("/reset_password", auth.sendEmailResetPassword);
router.post("/reset_password/:token", auth.resetPassword);
// router.post("/users", [
//   check([
//     "email",
//     "firstName",
//     "lastName",
//     "password"
//   ]).isLength({ min: 1 }),
// ], (req: Request, res: Response) => {
//   return validationHandler(req, res, user.create);
// });

router.post("/users/registration", [
  check([
    "email",
    "name",
    "accountName",
    "password"
  ]).isLength({ min: 1 }).withMessage("Не может быть пустым"),
], (req: Request, res: Response) => {
  return validationHandler(req, res, users.registration);
});

// Devices
router.get("/devices", authenticateJwt(), devices.getAll);
router.get("/devices/monitoring", authenticateJwt(), devices.monitoring);
router.get("/devices/:id/deviceData", authenticateJwt(), deviceData.getAllByDevice);
router.post("/devices", [
  authenticateJwt(),
  check([
    "device.foreignDeviceId",
    "device.name",
    "device.port",
    "device.version"
  ]).isLength({ min: 1 }),
], (req: Request, res: Response) => {
  return validationHandler(req, res, devices.create);
});
router.patch("/devices/:id", authenticateJwt(), devices.update);
router.patch("/devices/:id/activate", authenticateJwt(), devices.activate);
router.delete("/devices/:id", authenticateJwt(), devices.destroy);

// EventTypes
router.get("/eventTypes", authenticateJwt(), eventTypes.getAll);

// Geozones
router.get("/geozones", authenticateJwt(), geozones.getAll);
router.post("/geozones", [
  authenticateJwt(),
  check([
    "geozone.name",
    "geozone.data",
    "geozone.color",
    "geozone.type"
  ]).isLength({ min: 1 }),
], geozones.create);
router.delete("/geozones/:id", authenticateJwt(), geozones.destroy);

// Users
router.get("/user", authenticateJwt(), users.getCurrentUser);

export default router;

import express from "express";
import { startSession, logTask, logTasksBulk } from "../controllers/usabilityController.js";

const router = express.Router();

router.post("/session", startSession);
router.post("/task", logTask);
router.post("/tasks/bulk", logTasksBulk);

export default router;

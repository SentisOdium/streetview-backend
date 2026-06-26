import express from "express";
import { startSession, logTask, logTasksBulk, logActionsBulk } from "../controllers/usabilityController.js";

const router = express.Router();

router.post("/session", startSession);
router.post("/task", logTask);
router.post("/tasks/bulk", logTasksBulk);
router.post("/action-log/bulk", logActionsBulk);


export default router;

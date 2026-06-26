import express from "express";
import { startSession, logTask } from "../controllers/usabilityController.js";

const router = express.Router();

router.post("/session", startSession);
router.post("/task", logTask);

export default router;

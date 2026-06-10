import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { authenticateAdmin } from "../../middleware/authenticateAdmin.js";
import {
  dashboardController,
  listLocationsController,
  getLocationController,
  createLocationController,
  updateLocationController,
  deleteLocationController,
  listHotspotsController,
  createHotspotController,
  updateHotspotController,
  deleteHotspotController,
  listRoomsController,
  createRoomController,
  updateRoomController,
  deleteRoomController,
  graphController,
  validateController,
  routeTestController,
  exportController,
  auditLogsController,
  floorsController,
} from "../../controllers/admin/adminController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(webp|jpg|jpeg|png)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

const adminRouter = Router();
adminRouter.use(authenticateAdmin);

adminRouter.get("/dashboard", dashboardController);
adminRouter.get("/floors", floorsController);
adminRouter.get("/locations", listLocationsController);
adminRouter.get("/locations/:id", getLocationController);
adminRouter.post("/locations", createLocationController);
adminRouter.put("/locations/:id", updateLocationController);
adminRouter.delete("/locations/:id", deleteLocationController);

adminRouter.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded", data: null });
  }
  res.json({
    success: true,
    message: "File uploaded",
    data: { filename: req.file.filename, path: req.file.filename },
  });
});

adminRouter.get("/hotspots", listHotspotsController);
adminRouter.get("/hotspots/node/:nodeId", listHotspotsController);
adminRouter.post("/hotspots/node/:nodeId", createHotspotController);
adminRouter.put("/hotspots/:id", updateHotspotController);
adminRouter.delete("/hotspots/:id", deleteHotspotController);

adminRouter.get("/rooms/node/:nodeId", listRoomsController);
adminRouter.post("/rooms/node/:nodeId", createRoomController);
adminRouter.put("/rooms/:id", updateRoomController);
adminRouter.delete("/rooms/:id", deleteRoomController);

adminRouter.get("/graph", graphController);
adminRouter.get("/validate", validateController);
adminRouter.get("/route-test", routeTestController);
adminRouter.get("/export", exportController);
adminRouter.get("/audit-logs", auditLogsController);

export default adminRouter;

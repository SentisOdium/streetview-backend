import express from "express";
import hotspotRouter from "./routes/nodeRoutes/HotspotRoute.js";
import adminRouter from "./routes/admin/adminRouter.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200 
});

    const app = express();

    app.use(cors({
      origin: true,
      credentials: true
    }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(helmet({ crossOriginResourcePolicy: false }));
    app.use("/api", hotspotRouter);
    app.use("/api/admin-auth", adminAuthRoutes);
    app.use("/api/admin", adminRouter);
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));
    app.use(limiter);

    export default app;

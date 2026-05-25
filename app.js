import express from "express";
import hotspotRouter from "./routes/nodeRoutes/HotspotRoute.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200 
});

    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(helmet());
    app.use("/api", hotspotRouter);
    app.use(limiter);

    export default app;

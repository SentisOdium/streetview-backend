import express from "express";
import hotspotRouter from "./routes/nodeRoutes/HotspotRoute.js";
import cors from "cors";
import helmet from "helmet";

    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(helmet());
    app.use("/api", hotspotRouter);

    export default app;

import express from "express";
import hotspotRouter from "./routes/nodeRoutes/HotspotRoute.js";
import cors from "cors";
    

    const app = express();
    app.use(cors());
    app.get("/api/home", (req, res) => {
        res.json({message: "Hello World!"});
    }); 

    app.use("/api", hotspotRouter);
        export default app;

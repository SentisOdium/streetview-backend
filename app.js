import express from "express";
import hotspotRouter from "./routes/nodeRoutes/HotspotRoute.js";
    const app = express();

    app.get("/api/home", (req, res) => {
        res.json({message: "Hello World!"});
    }); 

    app.use("/api", hotspotRouter);
        export default app;

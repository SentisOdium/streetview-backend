import express from "express";

    const app = express();

    app.get("/api/home", (req, res) => {
        res.json({message: "Hello World!"});
    }); 

        export default app;

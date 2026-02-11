import hotspotsGenerationService from "../../services/hotspotsGeneration.services.js";

export async function fetchHotspotController(req, res) {
    try {
        const {id} = req.params;
        const result = await hotspotsGenerationService(id);
        
        res.status(200).json({
            success: true,
            message: "Hotspot data retrieved successfully",
            data: result
        });

    } catch (error) {
        console.error("Error in fetchHotspotById:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
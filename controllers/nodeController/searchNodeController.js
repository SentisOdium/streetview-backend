import searchNodeService from "../../services/searchNode.Services.js";
export async function searchNodeController(req, res) {
    try {
        const {location} = req.query;
            
       const result = await searchNodeService(location);

        res.status(200).json({
            success: true,  
            message: "Node data retrieved successfully",
            data: result
        });

    } catch (error) {
        console.error("Error in fetchHotspotById:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
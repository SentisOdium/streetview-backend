import getHotspotById from "../../database/nodeQuery/HotspotQuery.js";
import { getNodeById } from "../../database/nodeQuery/NodeQuery.js";
export async function fetchHotspotById(req, res) {
    try {
        const {id} = req.params;
        const hotspotData =  await getHotspotById(id);
        
        res.status(200).json(hotspotData);

        if (!hotspotData || hotspotData.length === 0) {
            return res.status(404).json({ error: "Hotspot not found" });
        }
    } catch (error) {
        console.error("Error in fetchHotspotById:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
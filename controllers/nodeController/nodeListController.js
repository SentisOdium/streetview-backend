import nodeListService from "../../services/nodeList.services.js";

export default async function nodeListController(req, res) {
    try {
        const nodeList = await nodeListService()

        res.status(200).json({
            success: true,
            message: "Locations data retrieved successfully",
            data: nodeList
        })
    } catch (error) {
        console.error("Error fetching node list:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve locations data",
            error: error.message
        });
    }
    
}
import pathGenerationService from "../../services/pathGeneration.services.js";

export async function pathGenController(req, res) {
    try {
         
        const { source, destination } = req.body;
        const pathData = await pathGenerationService(source, destination);

        return res.status(200).json({ 
            success: true,
            message: "Path Created Successfully",
            data: {
                graph: pathData.graph,
                dist: pathData.distances,
                path: pathData.path
            }
        });

    } catch (error) {
        console.error("Error Creating Path Generation Preview:", error);
        res.status(500).json({ error: "Error Creating Path Generation Preview" });
    }
}

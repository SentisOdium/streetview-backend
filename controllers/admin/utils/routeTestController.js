import pathGenerationService from "../../../services/pathGeneration.services.js";
import { validateNavigationGraph } from "../../../services/admin/validationService.js";
import getAllNodes from "../../../database/nodeQuery/NodeNamesQuery.js";

export const routeTestController = async (req, res) => {
  try {
    const { source, destination } = req.query;
    const nodes = await getAllNodes();
    const sourceNode = nodes.find((n) => n.node_name === source || String(n.id) === source);
    const destNode = nodes.find((n) => n.node_name === destination || String(n.id) === destination);

    if (!sourceNode || !destNode) {
      return res.status(400).json({
        success: false,
        message: "Invalid source or destination",
        data: null,
      });
    }

    const pathData = await pathGenerationService(sourceNode.node_name, destNode.node_name);
    const validation = await validateNavigationGraph();

    res.json({
      success: true,
      message: "Route test result",
      data: {
        path: pathData?.path ?? [],
        paths: pathData?.paths ?? [],
        routeLength: pathData?.path?.length ?? 0,
        transitions: Math.max(0, (pathData?.path?.length ?? 1) - 1),
        missingLinks: validation.errors.filter((e) => e.type === "missing_destination"),
        invalidConnections: validation.errors,
        warnings: validation.warnings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

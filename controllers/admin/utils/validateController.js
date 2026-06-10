import { validateNavigationGraph } from "../../../services/admin/validationService.js";

export const validateController = async (req, res) => {
  try {
    const data = await validateNavigationGraph();
    res.json({ success: true, message: "Validation result", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

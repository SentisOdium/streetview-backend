import { getGraphDataAdmin } from "../../../database/adminQuery/AdminQuery.js";

export const graphController = async (req, res) => {
  try {
    const data = await getGraphDataAdmin();
    res.json({ success: true, message: "Navigation graph", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

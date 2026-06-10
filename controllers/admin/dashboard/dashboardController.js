import { getDashboardStats } from "../../../database/adminQuery/AdminQuery.js";

export const dashboardController = async (req, res) => {
  try {
    const data = await getDashboardStats();
    res.json({ success: true, message: "Dashboard stats", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

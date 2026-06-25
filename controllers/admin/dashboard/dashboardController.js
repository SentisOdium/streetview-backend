import { getDashboardStats } from "../../../database/adminQuery/AdminQuery.js";
import { catchAsync } from "../../../middleware/catchAsync.js";

export const dashboardController = catchAsync(async (req, res) => {
  const data = await getDashboardStats();
  res.json({ success: true, message: "Dashboard stats", data });
});

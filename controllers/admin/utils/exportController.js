import { exportAllDataAdmin } from "../../../database/adminQuery/dashboard/exportAllDataAdmin.js"

export const exportController = async (req, res) => {
  try {
    const data = await exportAllDataAdmin();
    res.json({ success: true, message: "Export complete", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

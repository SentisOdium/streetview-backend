import { getAllLocationsAdmin } from "../../../database/adminQuery/AdminQuery.js";

export const floorsController = async (req, res) => {
  try {
    const locations = await getAllLocationsAdmin();
    const floors = [...new Set(locations.map((l) => l.floor).filter(Boolean))];
    res.json({ success: true, message: "Floors", data: floors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

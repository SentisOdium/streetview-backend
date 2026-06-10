import { getAllLocationsAdmin } from "../../../database/adminQuery/AdminQuery.js";

export const listLocationsController = async (req, res) => {
  try {
    const { floor, search } = req.query;
    let data = await getAllLocationsAdmin();
    if (floor) data = data.filter((l) => l.floor === floor);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((l) => l.node_name?.toLowerCase().includes(q));
    }
    res.json({ success: true, message: "Locations", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

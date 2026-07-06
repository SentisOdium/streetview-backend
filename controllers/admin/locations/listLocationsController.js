import { getAllLocationsAdmin, getPaginatedLocationsAdmin } from "../../../database/adminQuery/AdminQuery.js";

export const listLocationsController = async (req, res) => {
  try {
    const { floor, search, page, limit } = req.query;
    if (limit !== undefined && page !== undefined) {
      const limitVal = parseInt(limit, 10);
      const pageVal = parseInt(page, 10);
      const offsetVal = (pageVal - 1) * limitVal;

      const { locations, total } = await getPaginatedLocationsAdmin({
        floor: floor || undefined,
        search: search || undefined,
        limit: limitVal,
        offset: offsetVal,
      });

      res.json({ success: true, message: "Locations", data: { locations, total } });
    } else {
      let data = await getAllLocationsAdmin();
      if (floor) data = data.filter((l) => l.floor === floor);
      if (search) {
        const q = search.toLowerCase();
        data = data.filter((l) => l.node_name?.toLowerCase().includes(q));
      }
      res.json({ success: true, message: "Locations", data });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

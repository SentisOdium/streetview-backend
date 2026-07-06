import { getRoomsByNodeIdAdmin, getPaginatedRoomsAdmin } from "../../../database/adminQuery/AdminQuery.js";

export const listRoomsController = async (req, res) => {
  try {
    const { nodeId } = req.params;
    if (nodeId) {
      const data = await getRoomsByNodeIdAdmin(nodeId);
      return res.json({ success: true, message: "Rooms", data });
    }

    const { page, limit, search } = req.query;
    if (limit !== undefined && page !== undefined) {
      const limitVal = parseInt(limit, 10);
      const pageVal = parseInt(page, 10);
      const offsetVal = (pageVal - 1) * limitVal;

      const { rooms, total } = await getPaginatedRoomsAdmin({
        search: search || undefined,
        limit: limitVal,
        offset: offsetVal,
      });

      return res.json({ success: true, message: "Rooms", data: { rooms, total } });
    } else {
      const { rooms } = await getPaginatedRoomsAdmin({
        search: search || undefined,
        limit: 1000,
        offset: 0,
      });
      return res.json({ success: true, message: "Rooms", data: rooms });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

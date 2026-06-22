import { getCoordinatesAdmin } from "../../../database/adminQuery/coordinates/getCoordinatesAdmin.js";

export const listCoordinatesController = async (req, res) => {
  try {
    const data = await getCoordinatesAdmin();
    res.json({ success: true, message: "Coordinates list", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

import apicache from "apicache";
import {
  getDashboardStats,
  getAllLocationsAdmin,
  getLocationByIdAdmin,
  createLocationAdmin,
  updateLocationAdmin,
  deleteLocationAdmin,
  getHotspotsByNodeIdAdmin,
  getAllHotspotsAdmin,
  createHotspotAdmin,
  updateHotspotAdmin,
  deleteHotspotAdmin,
  getRoomsByNodeIdAdmin,
  createRoomAdmin,
  updateRoomAdmin,
  deleteRoomAdmin,
  getGraphDataAdmin,
  exportAllDataAdmin,
} from "../../database/adminQuery/AdminQuery.js";
import { logAudit, getAuditLogs } from "../../services/admin/auditService.js";
import { validateNavigationGraph, validateBeforeSave } from "../../services/admin/validationService.js";
import pathGenerationService from "../../services/pathGeneration.services.js";
import getAllNodes from "../../database/nodeQuery/NodeNamesQuery.js";

const cache = apicache.middleware;

export const dashboardController = async (req, res) => {
  try {
    const data = await getDashboardStats();
    res.json({ success: true, message: "Dashboard stats", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

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

export const getLocationController = async (req, res) => {
  try {
    const data = await getLocationByIdAdmin(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Not found", data: null });
    const hotspots = await getHotspotsByNodeIdAdmin(req.params.id);
    const rooms = await getRoomsByNodeIdAdmin(req.params.id);
    res.json({ success: true, message: "Location details", data: { ...data, hotspots, rooms } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const createLocationController = async (req, res) => {
  try {
    const validation = await validateBeforeSave("location", req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: "Validation failed", data: validation });
    }
    const result = await createLocationAdmin(req.body);
    await logAudit({
      action: "created location",
      entityType: "location",
      entityId: result.id,
      locationName: req.body.node_name,
      adminUser: req.adminUser,
      newValue: req.body,
    });
    apicache.clear();
    res.status(201).json({ success: true, message: "Location created", data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const updateLocationController = async (req, res) => {
  try {
    const old = await getLocationByIdAdmin(req.params.id);
    const data = await updateLocationAdmin(req.params.id, req.body);
    await logAudit({
      action: "updated location",
      entityType: "location",
      entityId: Number(req.params.id),
      locationName: data?.node_name,
      adminUser: req.adminUser,
      oldValue: old,
      newValue: data,
    });
    apicache.clear();
    res.json({ success: true, message: "Location updated", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const deleteLocationController = async (req, res) => {
  try {
    const old = await getLocationByIdAdmin(req.params.id);
    await deleteLocationAdmin(req.params.id);
    await logAudit({
      action: "deleted location",
      entityType: "location",
      entityId: Number(req.params.id),
      locationName: old?.node_name,
      adminUser: req.adminUser,
      oldValue: old,
    });
    apicache.clear();
    res.json({ success: true, message: "Location deleted", data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const listHotspotsController = async (req, res) => {
  try {
    const data = req.params.nodeId
      ? await getHotspotsByNodeIdAdmin(req.params.nodeId)
      : await getAllHotspotsAdmin();
    res.json({ success: true, message: "Hotspots", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const createHotspotController = async (req, res) => {
  try {
    const validation = await validateBeforeSave("hotspot", req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: "Validation failed", data: validation });
    }
    const result = await createHotspotAdmin(req.params.nodeId, req.body);
    await logAudit({
      action: "created hotspot",
      entityType: "hotspot",
      entityId: result.id,
      locationName: req.body.source_name,
      adminUser: req.adminUser,
      newValue: req.body,
    });
    apicache.clear();
    res.status(201).json({ success: true, message: "Hotspot created", data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const updateHotspotController = async (req, res) => {
  try {
    await updateHotspotAdmin(req.params.id, req.body);
    await logAudit({
      action: "updated hotspot",
      entityType: "hotspot",
      entityId: Number(req.params.id),
      adminUser: req.adminUser,
      oldValue: req.body._old,
      newValue: req.body,
    });
    apicache.clear();
    res.json({ success: true, message: "Hotspot updated", data: { updated: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const deleteHotspotController = async (req, res) => {
  try {
    await deleteHotspotAdmin(req.params.id);
    await logAudit({
      action: "deleted hotspot",
      entityType: "hotspot",
      entityId: Number(req.params.id),
      adminUser: req.adminUser,
    });
    apicache.clear();
    res.json({ success: true, message: "Hotspot deleted", data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const listRoomsController = async (req, res) => {
  try {
    const data = await getRoomsByNodeIdAdmin(req.params.nodeId);
    res.json({ success: true, message: "Rooms", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const createRoomController = async (req, res) => {
  try {
    const result = await createRoomAdmin(req.params.nodeId, req.body);
    await logAudit({
      action: "created room",
      entityType: "room",
      entityId: result.id,
      adminUser: req.adminUser,
      newValue: req.body,
    });
    apicache.clear();
    res.status(201).json({ success: true, message: "Room created", data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const updateRoomController = async (req, res) => {
  try {
    await updateRoomAdmin(req.params.id, req.body);
    apicache.clear();
    res.json({ success: true, message: "Room updated", data: { updated: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const deleteRoomController = async (req, res) => {
  try {
    await deleteRoomAdmin(req.params.id);
    apicache.clear();
    res.json({ success: true, message: "Room deleted", data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const graphController = async (req, res) => {
  try {
    const data = await getGraphDataAdmin();
    res.json({ success: true, message: "Navigation graph", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const validateController = async (req, res) => {
  try {
    const data = await validateNavigationGraph();
    res.json({ success: true, message: "Validation result", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const routeTestController = async (req, res) => {
  try {
    const { source, destination } = req.query;
    const nodes = await getAllNodes();
    const sourceNode = nodes.find((n) => n.node_name === source || String(n.id) === source);
    const destNode = nodes.find((n) => n.node_name === destination || String(n.id) === destination);

    if (!sourceNode || !destNode) {
      return res.status(400).json({
        success: false,
        message: "Invalid source or destination",
        data: null,
      });
    }

    const pathData = await pathGenerationService(sourceNode.node_name, destNode.node_name);
    const validation = await validateNavigationGraph();

    res.json({
      success: true,
      message: "Route test result",
      data: {
        path: pathData?.path ?? [],
        routeLength: pathData?.path?.length ?? 0,
        transitions: Math.max(0, (pathData?.path?.length ?? 1) - 1),
        missingLinks: validation.errors.filter((e) => e.type === "missing_destination"),
        invalidConnections: validation.errors,
        warnings: validation.warnings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const exportController = async (req, res) => {
  try {
    const data = await exportAllDataAdmin();
    res.json({ success: true, message: "Export complete", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const auditLogsController = async (req, res) => {
  try {
    const data = await getAuditLogs({ limit: Number(req.query.limit) || 50 });
    res.json({ success: true, message: "Audit logs", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const floorsController = async (req, res) => {
  try {
    const locations = await getAllLocationsAdmin();
    const floors = [...new Set(locations.map((l) => l.floor).filter(Boolean))];
    res.json({ success: true, message: "Floors", data: floors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

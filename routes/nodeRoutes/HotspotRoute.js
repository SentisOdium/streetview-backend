import {Router} from 'express';
import { fetchHotspotById } from '../../controllers/nodeController/nodeController.js';
const hotspotRouter = Router();

hotspotRouter.get(
    '/hotspots/:id', 
        fetchHotspotById);

export default hotspotRouter;
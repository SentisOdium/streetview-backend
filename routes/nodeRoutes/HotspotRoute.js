import {Router} from 'express';
import { fetchHotspotController } from '../../controllers/nodeController/nodeController.js';
import { searchNodeController } from '../../controllers/nodeController/searchNodeController.js';
const hotspotRouter = Router();

hotspotRouter.get('/hotspots/:id', fetchHotspotController);
hotspotRouter.get('/search', searchNodeController);

export default hotspotRouter;
import {Router} from 'express';
import { fetchHotspotController } from '../../controllers/nodeController/nodeController.js';
import { searchNodeController } from '../../controllers/nodeController/searchNodeController.js';
import { pathGenController } from '../../controllers/nodeController/pathGenController.js';
const hotspotRouter = Router();

hotspotRouter.get('/hotspots/:id', fetchHotspotController);
hotspotRouter.get('/search', searchNodeController);
hotspotRouter.get('/routeAB', pathGenController);

export default hotspotRouter;
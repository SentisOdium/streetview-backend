import {Router} from 'express';
import { fetchHotspotController } from '../../controllers/nodeController/nodeController.js';
import { searchNodeController } from '../../controllers/nodeController/searchNodeController.js';
import { pathGenController } from '../../controllers/nodeController/pathGenController.js';
import nodeListController from '../../controllers/nodeController/nodeListController.js';
const hotspotRouter = Router();

hotspotRouter.get('/hotspots/:id', fetchHotspotController);
hotspotRouter.get('/search', searchNodeController);
hotspotRouter.get('/route', pathGenController);
hotspotRouter.get('/list', nodeListController );
export default hotspotRouter;
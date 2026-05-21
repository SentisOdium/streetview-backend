import {Router} from 'express';
import apicache from "apicache";
import { fetchHotspotController } from '../../controllers/nodeController/nodeController.js';
import { searchNodeController } from '../../controllers/nodeController/searchNodeController.js';
import { pathGenController } from '../../controllers/nodeController/pathGenController.js';
import nodeListController from '../../controllers/nodeController/nodeListController.js';

const hotspotRouter = Router();
const cache = apicache.middleware;

hotspotRouter.get('/hotspots/:id', 
        cache('60 minutes'), 
            fetchHotspotController);

hotspotRouter.get('/search', 
        cache('30 minutes'), 
            searchNodeController);

hotspotRouter.get('/route', 
        cache('30 minutes'), 
            pathGenController);

hotspotRouter.get('/list', 
        cache('15 minutes'), 
            nodeListController);

export default hotspotRouter;
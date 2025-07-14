import { Router } from 'express';
import { getAllEventsPublic, getEventByIdPublic } from '../controllers/publicEvent.controller';

const router = Router();

router.get('/', getAllEventsPublic);
router.get('/:id', getEventByIdPublic);

export default router;

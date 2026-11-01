import { Router } from 'express';
import { readState, updateState, accuse } from '../controllers/investigation.controller.js';
import { asyncHandler } from '../middleware/async-handler.js';
const router = Router();
router.get('/:investigationId', asyncHandler(readState));
router.patch('/:investigationId', asyncHandler(updateState));
router.post('/:investigationId/accusation', asyncHandler(accuse));
export default router;

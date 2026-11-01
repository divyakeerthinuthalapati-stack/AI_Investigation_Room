import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createCase, generationStatus, readCase, readEvidence, createInvestigation } from '../controllers/case.controller.js';
import { validateBody } from '../middleware/validate-request.js';
import { createCaseSchema } from '../validators/case.validator.js';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();
const generationLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many case requests. Please try again later.' } } });
router.post('/', generationLimiter, validateBody(createCaseSchema), asyncHandler(createCase));
router.get('/jobs/:jobId', asyncHandler(generationStatus));
router.get('/:caseId/evidence/:evidenceId', asyncHandler(readEvidence));
router.get('/:caseId', asyncHandler(readCase));
router.post('/:caseId/investigations', asyncHandler(createInvestigation));
export default router;

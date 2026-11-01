import { AppError } from '../middleware/error-handler.js';
import { readInvestigationState, updateInvestigation, submitAccusation } from '../services/investigation.service.js';

function token(req) { return req.get('x-session-token'); }

export async function readState(req, res) {
  res.json({ success: true, data: await readInvestigationState(req.params.investigationId, token(req)) });
}

export async function updateState(req, res) {
  const allowed = new Set(['openedEvidenceIds', 'notes']);
  if (Object.keys(req.body ?? {}).some((key) => !allowed.has(key))) throw new AppError(400, 'INVALID_REQUEST', 'Only openedEvidenceIds and notes can be updated.');
  res.json({ success: true, data: await updateInvestigation(req.params.investigationId, token(req), req.body ?? {}) });
}

export async function accuse(req, res) {
  if (typeof req.body?.suspectId !== 'string' || !req.body.suspectId) throw new AppError(400, 'INVALID_REQUEST', 'Choose a suspect to accuse.');
  res.json({ success: true, data: await submitAccusation(req.params.investigationId, token(req), req.body.suspectId) });
}

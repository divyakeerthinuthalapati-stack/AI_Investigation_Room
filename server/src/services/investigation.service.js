import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import Investigation from '../models/Investigation.js';
import { getCaseById } from './case-generation.service.js';
import { AppError } from '../middleware/error-handler.js';

const demoInvestigations = new Map();
const hashToken = (token) => createHmac('sha256', env.sessionSecret ?? 'local-demo-session-secret').update(token).digest('hex');
const idValid = (id) => env.demoMode || mongoose.isValidObjectId(id);

export async function startInvestigation(caseId) {
  if (!idValid(caseId)) throw new AppError(404, 'NOT_FOUND', 'Case not found.');
  const record = await getCaseById(caseId);
  if (!record) throw new AppError(404, 'NOT_FOUND', 'Case not found.');
  const token = randomBytes(32).toString('base64url');
  if (env.demoMode) {
    const investigationId = randomBytes(16).toString('hex');
    demoInvestigations.set(investigationId, { _id: investigationId, caseId, sessionTokenHash: hashToken(token), status: 'in_progress', openedEvidenceIds: [], notes: [], startedAt: new Date() });
    return { investigationId, sessionToken: token, status: 'in_progress' };
  }
  const item = await Investigation.create({ caseId, sessionTokenHash: hashToken(token) });
  return { investigationId: String(item._id), sessionToken: token, status: item.status };
}

export async function getInvestigation(id, token) {
  if (!idValid(id)) throw new AppError(404, 'NOT_FOUND', 'Investigation not found.');
  if (!token) throw new AppError(401, 'UNAUTHORIZED', 'Investigation session is required.');
  const digest = hashToken(token);
  const item = env.demoMode ? demoInvestigations.get(id) : await Investigation.findById(id);
  if (!item) throw new AppError(404, 'NOT_FOUND', 'Investigation not found.');
  const stored = env.demoMode ? item.sessionTokenHash : item.sessionTokenHash;
  const a = Buffer.from(stored); const b = Buffer.from(digest);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new AppError(403, 'FORBIDDEN', 'This session cannot access that investigation.');
  return item;
}

export async function readInvestigationState(id, token) {
  const item = await getInvestigation(id, token);
  return {
    investigationId: String(item._id),
    caseId: String(item.caseId),
    status: item.status,
    openedEvidenceIds: item.openedEvidenceIds ?? [],
    notes: item.notes ?? [],
    ...(item.status === 'completed' && item.result ? { result: item.result, accusation: item.accusation } : {}),
  };
}

export async function updateInvestigation(id, token, changes) {
  const item = await getInvestigation(id, token);
  if (item.status !== 'in_progress') throw new AppError(409, 'CONFLICT', 'This investigation is already complete.');
  const record = await getCaseById(String(item.caseId));
  const patch = {};
  if (changes.openedEvidenceIds !== undefined) {
    if (!Array.isArray(changes.openedEvidenceIds) || changes.openedEvidenceIds.some((id) => !record.evidence.some((e) => e.id === id))) throw new AppError(400, 'INVALID_REQUEST', 'Opened evidence must belong to this case.');
    patch.openedEvidenceIds = [...new Set([...(item.openedEvidenceIds ?? []), ...changes.openedEvidenceIds])];
  }
  if (changes.notes !== undefined) {
    if (!Array.isArray(changes.notes) || changes.notes.length > 50 || changes.notes.some((note) => typeof note !== 'string' || note.length > 1000)) throw new AppError(400, 'INVALID_REQUEST', 'Notes must be short text entries.');
    patch.notes = changes.notes;
  }
  if (env.demoMode) Object.assign(item, patch);
  else await Investigation.findByIdAndUpdate(id, { $set: patch });
  return { status: item.status, openedEvidenceIds: patch.openedEvidenceIds ?? item.openedEvidenceIds, notes: patch.notes ?? item.notes };
}

export async function submitAccusation(id, token, suspectId) {
  const item = await getInvestigation(id, token);
  if (item.status !== 'in_progress') throw new AppError(409, 'CONFLICT', 'A final accusation has already been submitted.');
  const record = await getCaseById(String(item.caseId));
  if (!record.suspects.some((s) => s.id === suspectId)) throw new AppError(400, 'INVALID_REQUEST', 'Choose a suspect from this case.');
  const solution = record.canonicalSolution;
  const result = { correct: suspectId === solution.culpritId, status: 'completed', solution: { culpritId: solution.culpritId, culpritName: record.suspects.find((s) => s.id === solution.culpritId).name, motive: solution.motive, method: solution.method, explanation: solution.explanation, reasoning: solution.reasoning, supportingEvidenceIds: solution.supportingEvidenceIds, misleadingClues: solution.misleadingClues, alternatives: solution.alternatives, timeline: solution.timeline } };
  if (env.demoMode) {
    // Recheck after the case lookup, which yields and allows another request to run.
    if (item.status !== 'in_progress') throw new AppError(409, 'CONFLICT', 'A final accusation has already been submitted.');
    item.status = 'completed'; item.result = result; item.accusation = { suspectId, correct: result.correct }; item.completedAt = new Date();
  } else {
    // Atomically claim the sole final accusation so concurrent requests cannot both win.
    const updated = await Investigation.findOneAndUpdate(
      { _id: id, status: 'in_progress' },
      { $set: { status: 'completed', result, accusation: { suspectId, correct: result.correct }, completedAt: new Date() } },
      { new: true },
    );
    if (!updated) throw new AppError(409, 'CONFLICT', 'A final accusation has already been submitted.');
  }
  return result;
}

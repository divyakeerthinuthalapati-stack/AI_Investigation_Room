import mongoose from 'mongoose';
import { createGenerationJob, getCaseById, getJob, publicCase } from '../services/case-generation.service.js';
import { AppError } from '../middleware/error-handler.js';
import { env } from '../config/env.js';
import { videoFallback } from '../providers/video-provider.js';
import { imageFallback } from '../providers/image-provider.js';
import { startInvestigation } from '../services/investigation.service.js';

const validId = (id) => env.demoMode || mongoose.isValidObjectId(id);

export async function createCase(req, res) {
  const result = await createGenerationJob(req.validatedBody);
  res.status(202).json({ success: true, data: result });
}

export async function generationStatus(req, res) {
  const job = await getJob(req.params.jobId);
  if (!job) throw new AppError(404, 'NOT_FOUND', 'Generation job not found.');
  res.json({ success: true, data: { jobId: String(job._id), status: job.status, stage: job.stage, progress: job.progress, caseId: job.caseId ? String(job.caseId) : null, errorCode: job.errorCode, message: job.publicErrorMessage } });
}

export async function readCase(req, res) {
  if (!validId(req.params.caseId)) throw new AppError(404, 'NOT_FOUND', 'Case not found.');
  const record = await getCaseById(req.params.caseId);
  if (!record) throw new AppError(404, 'NOT_FOUND', 'Case not found.');
  res.json({ success: true, data: publicCase({ ...record, evidence: record.evidence.map(({ content, ...metadata }) => metadata) }) });
}

export async function readEvidence(req, res) {
  if (!validId(req.params.caseId)) throw new AppError(404, 'NOT_FOUND', 'Case not found.');
  const record = await getCaseById(req.params.caseId);
  const item = record?.evidence.find((entry) => entry.id === req.params.evidenceId);
  if (!item) throw new AppError(404, 'NOT_FOUND', 'Evidence not found.');
  const safe = { ...item };
  if (safe.type === 'image') safe.asset = safe.asset ?? imageFallback(safe);
  if (safe.type === 'video') safe.asset = safe.asset ?? videoFallback(safe);
  res.json({ success: true, data: safe });
}

export async function createInvestigation(req, res) {
  res.status(201).json({ success: true, data: await startInvestigation(req.params.caseId) });
}

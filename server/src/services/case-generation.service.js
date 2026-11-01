import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { generateBlueprint } from '../ai/gemini.client.js';
import { caseBlueprintPrompt, promptVersion } from '../ai/prompts/case-blueprint.prompt.js';
import { evidencePrompt } from '../ai/prompts/evidence.prompt.js';
import { validationPrompt } from '../ai/prompts/validation.prompt.js';
import { generatedCaseSchema } from '../validators/case.validator.js';
import { blueprintSchema, evidenceManifestSchema } from '../validators/blueprint.validator.js';
import { createDemoCase } from './demo-case.service.js';
import Case from '../models/Case.js';
import GenerationJob from '../models/GenerationJob.js';

const memoryJobs = new Map();
const memoryCases = new Map();
let active = 0;

function publishCase(data, scenario, id) {
  const parsed = generatedCaseSchema.safeParse(data);
  if (!parsed.success) throw new Error(`Generated case failed validation: ${parsed.error.issues.map((i) => i.message).join('; ')}`);
  return { ...parsed.data, _id: id, scenario, generationStatus: 'ready', schemaVersion: 1, promptVersion };
}

async function updateJob(id, patch) {
  if (env.demoMode) { memoryJobs.set(id, { ...memoryJobs.get(id), ...patch }); return; }
  await GenerationJob.findByIdAndUpdate(id, patch);
}

async function generate(jobId, request) {
  active += 1;
  try {
    await updateJob(jobId, { status: 'generating_blueprint', stage: 'Establishing the case facts', progress: 12 });
    let complete;
    let lastError;
    let activeStage = 'case blueprint';
    const attempts = env.demoMode ? 1 : env.maxRetries + 1;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        let raw;
        if (env.demoMode) raw = createDemoCase(request);
        else {
          activeStage = 'case blueprint';
          const blueprint = blueprintSchema.parse(await generateBlueprint(caseBlueprintPrompt(request), 'case blueprint'));
          if (blueprint.category !== request.category || blueprint.difficulty !== request.difficulty) throw new Error('Generated case did not preserve the requested configuration.');
          await updateJob(jobId, { status: 'generating_evidence', stage: 'Preparing evidence from the established solution', progress: 48 });
          activeStage = 'evidence generation';
          const manifest = evidenceManifestSchema.parse(await generateBlueprint(evidencePrompt(blueprint), 'evidence generation'));
          blueprint.canonicalSolution.supportingEvidenceIds = manifest.supportingEvidenceIds;
          raw = { ...blueprint, evidence: manifest.evidence };
          await updateJob(jobId, { status: 'validating', stage: 'Checking references and consistency', progress: 76 });
          activeStage = 'consistency review';
          const review = await generateBlueprint(validationPrompt(blueprint, manifest.evidence), 'consistency review');
          if (review.valid !== true || !Array.isArray(review.issues)) throw new Error('Consistency review did not return a valid result.');
          if (review.issues.length) throw new Error(`Consistency review found issues: ${review.issues.join('; ')}`);
        }
        await updateJob(jobId, { status: 'validating', stage: 'Checking references and consistency', progress: 82 });
        complete = publishCase(raw, request.scenario, env.demoMode ? randomUUID() : undefined);
        break;
      } catch (error) {
        lastError = error;
        console.error(`Generation job ${jobId}, ${activeStage}, attempt ${attempt + 1}/${attempts}: ${error.name ?? 'Error'} (${error.code ?? 'no code'}) ${error.message}`);
        // Repeating a request that hit its deadline tends to repeat the same wait and
        // may leave billable work running upstream. Let the player start a fresh job.
        if (error.code === 'GENERATION_TIMEOUT' || error.code === 'GEMINI_TEMPORARY_UNAVAILABLE') break;
      }
    }
    if (!complete) throw lastError ?? new Error('Unable to generate the case.');
    let saved;
    if (env.demoMode) { memoryCases.set(String(complete._id), complete); saved = complete; }
    else {
      const doc = await Case.create({ ...complete, _id: undefined });
      saved = { ...complete, _id: String(doc._id) };
    }
    await updateJob(jobId, { status: 'ready', stage: 'Case ready', progress: 100, caseId: saved._id, completedAt: new Date() });
  } catch (error) {
    console.error(`Generation job ${jobId} failed:`, error.message);
    const timedOut = error.code === 'GENERATION_TIMEOUT';
    const unavailable = error.code === 'GEMINI_TEMPORARY_UNAVAILABLE';
    const configurationError = error.code === 'GEMINI_CONFIGURATION_ERROR';
    const invalidResponse = error.code === 'GEMINI_INVALID_RESPONSE';
    const publicErrorMessage = timedOut
      ? 'Gemini took too long to finish this case. Please try again.'
      : unavailable
        ? 'Gemini is temporarily unavailable after retries. Please try again in a few minutes.'
        : configurationError
          ? 'Gemini rejected the request. Check GEMINI_MODEL and confirm the API key has access to that model.'
          : invalidResponse
            ? 'Gemini returned an incomplete case response. Please try again.'
            : 'The case failed validation before it was ready. Please try another premise.';
    await updateJob(jobId, { status: 'failed', stage: 'Generation failed', progress: 100, errorCode: error.code ?? 'GENERATION_FAILED', publicErrorMessage, completedAt: new Date() });
  } finally { active -= 1; }
}

export async function createGenerationJob(request) {
  if (active >= env.maxConcurrentJobs) throw Object.assign(new Error('The case desk is busy. Please try again shortly.'), { status: 429, code: 'RATE_LIMITED' });
  let id;
  if (env.demoMode) { id = randomUUID(); memoryJobs.set(id, { _id: id, status: 'queued', stage: 'Waiting to start', progress: 0, caseId: null }); }
  else { const job = await GenerationJob.create({ request, status: 'queued', stage: 'Waiting to start', progress: 0 }); id = String(job._id); }
  void generate(id, request);
  return { jobId: id, status: 'queued' };
}

export async function getJob(id) {
  if (env.demoMode) return memoryJobs.get(id) ?? null;
  if (!id || !/^[a-f\d]{24}$/i.test(id)) return null;
  const job = await GenerationJob.findById(id).select('+request').lean();
  if (!job) return null;
  return { _id: String(job._id), jobId: String(job._id), status: job.status, stage: job.stage, progress: job.progress, caseId: job.caseId ? String(job.caseId) : null, errorCode: job.errorCode, publicErrorMessage: job.publicErrorMessage };
}

export async function getCaseById(id) {
  if (env.demoMode) return memoryCases.get(id) ?? null;
  const doc = await Case.findById(id).select('+canonicalSolution').lean();
  return doc ? { ...doc, _id: String(doc._id) } : null;
}

export function publicCase(record) {
  if (!record) return null;
  const { canonicalSolution, scenario, promptVersion: version, ...safe } = record;
  return { ...safe, summary: record.summary, scenario: scenario ?? '' };
}

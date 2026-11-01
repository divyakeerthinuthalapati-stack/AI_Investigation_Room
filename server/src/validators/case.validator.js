import { z } from 'zod';

export const categories = ['murder', 'theft', 'missing_person', 'corporate_espionage', 'blackmail', 'disappearance', 'unexplained'];
export const difficulties = ['easy', 'medium', 'hard'];
const evidenceTypes = ['chat', 'profile', 'image', 'witness', 'timeline', 'document', 'video', 'forensic'];

export const createCaseSchema = z.object({
  scenario: z.string().trim().min(30).max(2000),
  category: z.enum(categories),
  difficulty: z.enum(difficulties),
  setting: z.string().trim().max(100).optional().default(''),
  tone: z.enum(['realistic', 'psychological', 'suspenseful', 'classic_detective']).optional().default('classic_detective'),
}).strict();

const suspect = z.object({ id: z.string(), name: z.string(), age: z.number().optional(), role: z.string(), background: z.string(), motive: z.string(), alibi: z.string(), connections: z.array(z.string()).default([]) });
const item = z.object({ id: z.string(), type: z.enum(evidenceTypes), title: z.string(), description: z.string(), content: z.unknown(), source: z.string(), occurredAt: z.string().optional().nullable(), relatedSuspectIds: z.array(z.string()).default([]), relatedEvidenceIds: z.array(z.string()).default([]), asset: z.unknown().optional() });

export const generatedCaseSchema = z.object({
  title: z.string().min(3), summary: z.string(), category: z.enum(categories), difficulty: z.enum(difficulties),
  setting: z.object({ location: z.string(), description: z.string() }),
  incident: z.object({ description: z.string(), occurredAt: z.string() }),
  suspects: z.array(suspect).min(3).max(5),
  timeline: z.array(z.object({ time: z.string(), event: z.string(), sourceEvidenceIds: z.array(z.string()).default([]) })).min(3),
  evidence: z.array(item).min(8),
  canonicalSolution: z.object({ culpritId: z.string(), motive: z.string(), method: z.string(), explanation: z.string(), timeline: z.array(z.object({ time: z.string(), event: z.string() })), reasoning: z.array(z.string()), supportingEvidenceIds: z.array(z.string()), misleadingClues: z.array(z.string()).default([]), alternatives: z.array(z.object({ suspectId: z.string(), explanation: z.string() })).default([]) }),
}).superRefine((value, ctx) => {
  const suspects = new Set(value.suspects.map((s) => s.id));
  const evidence = new Set(value.evidence.map((e) => e.id));
  if (!suspects.has(value.canonicalSolution.culpritId)) ctx.addIssue({ code: 'custom', message: 'Culprit must match a suspect', path: ['canonicalSolution', 'culpritId'] });
  if (new Set(value.suspects.map((s) => s.id)).size !== value.suspects.length) ctx.addIssue({ code: 'custom', message: 'Suspect IDs must be unique', path: ['suspects'] });
  if (new Set(value.evidence.map((e) => e.id)).size !== value.evidence.length) ctx.addIssue({ code: 'custom', message: 'Evidence IDs must be unique', path: ['evidence'] });
  value.evidence.forEach((e, i) => {
    e.relatedSuspectIds.forEach((id) => { if (!suspects.has(id)) ctx.addIssue({ code: 'custom', message: `Unknown suspect ${id}`, path: ['evidence', i, 'relatedSuspectIds'] }); });
    e.relatedEvidenceIds.forEach((id) => { if (!evidence.has(id)) ctx.addIssue({ code: 'custom', message: `Unknown evidence ${id}`, path: ['evidence', i, 'relatedEvidenceIds'] }); });
  });
  value.canonicalSolution.supportingEvidenceIds.forEach((id) => { if (!evidence.has(id)) ctx.addIssue({ code: 'custom', message: `Unknown supporting evidence ${id}`, path: ['canonicalSolution', 'supportingEvidenceIds'] }); });
  const types = new Set(value.evidence.map((e) => e.type));
  ['chat', 'profile', 'image', 'witness', 'timeline', 'document'].forEach((type) => { if (!types.has(type)) ctx.addIssue({ code: 'custom', message: `Required evidence type missing: ${type}`, path: ['evidence'] }); });
});

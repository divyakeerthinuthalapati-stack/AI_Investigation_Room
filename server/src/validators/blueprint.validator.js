import { z } from 'zod';
import { categories, difficulties } from './case.validator.js';

export const blueprintSchema = z.object({
  title: z.string().min(3), summary: z.string(), category: z.enum(categories), difficulty: z.enum(difficulties),
  setting: z.object({ location: z.string(), description: z.string() }), incident: z.object({ description: z.string(), occurredAt: z.string() }),
  suspects: z.array(z.object({ id: z.string(), name: z.string(), age: z.number().optional(), role: z.string(), background: z.string(), motive: z.string(), alibi: z.string(), connections: z.array(z.string()).default([]) })).min(3).max(5),
  timeline: z.array(z.object({ time: z.string(), event: z.string(), sourceEvidenceIds: z.array(z.string()).default([]) })).min(3),
  canonicalSolution: z.object({ culpritId: z.string(), motive: z.string(), method: z.string(), explanation: z.string(), timeline: z.array(z.object({ time: z.string(), event: z.string() })), reasoning: z.array(z.string()), supportingEvidenceIds: z.array(z.string()).default([]), misleadingClues: z.array(z.string()).default([]), alternatives: z.array(z.object({ suspectId: z.string(), explanation: z.string() })).default([]) }),
}).superRefine((value, ctx) => { if (!value.suspects.some((person) => person.id === value.canonicalSolution.culpritId)) ctx.addIssue({ code: 'custom', message: 'The canonical culprit must be one of the suspects.' }); });

export const evidenceManifestSchema = z.object({ evidence: z.array(z.object({ id: z.string(), type: z.enum(['chat', 'profile', 'image', 'witness', 'timeline', 'document', 'video', 'forensic']), title: z.string(), description: z.string(), content: z.unknown(), source: z.string(), occurredAt: z.string().optional().nullable(), relatedSuspectIds: z.array(z.string()).default([]), relatedEvidenceIds: z.array(z.string()).default([]), asset: z.unknown().optional() })).min(8), supportingEvidenceIds: z.array(z.string()).min(1) });

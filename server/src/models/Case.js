import mongoose from 'mongoose';

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true }, category: String, difficulty: String, scenario: String,
  summary: String, setting: mongoose.Schema.Types.Mixed, incident: mongoose.Schema.Types.Mixed,
  suspects: [mongoose.Schema.Types.Mixed], evidence: [mongoose.Schema.Types.Mixed], timeline: [mongoose.Schema.Types.Mixed],
  canonicalSolution: { type: mongoose.Schema.Types.Mixed, required: true, select: false },
  generationStatus: { type: String, default: 'ready', index: true }, schemaVersion: { type: Number, default: 1 }, promptVersion: { type: String, default: 'case-v1' },
}, { timestamps: true, minimize: false });
CaseSchema.index({ createdAt: -1 });
export default mongoose.models.Case ?? mongoose.model('Case', CaseSchema);

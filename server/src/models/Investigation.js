import mongoose from 'mongoose';

const InvestigationSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
  sessionTokenHash: { type: String, required: true, index: true }, status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  openedEvidenceIds: { type: [String], default: [] }, notes: { type: [String], default: [] }, accusation: mongoose.Schema.Types.Mixed,
  result: mongoose.Schema.Types.Mixed, startedAt: { type: Date, default: Date.now }, completedAt: Date,
}, { timestamps: true });
export default mongoose.models.Investigation ?? mongoose.model('Investigation', InvestigationSchema);

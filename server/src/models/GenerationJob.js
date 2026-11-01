import mongoose from 'mongoose';

const GenerationJobSchema = new mongoose.Schema({
  status: { type: String, enum: ['queued', 'generating_blueprint', 'generating_evidence', 'generating_media', 'validating', 'ready', 'failed'], default: 'queued', index: true },
  stage: String, progress: { type: Number, default: 0 }, errorCode: String, publicErrorMessage: String,
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', default: null }, request: { type: mongoose.Schema.Types.Mixed, select: false },
}, { timestamps: true });
GenerationJobSchema.index({ createdAt: -1 });
export default mongoose.models.GenerationJob ?? mongoose.model('GenerationJob', GenerationJobSchema);

import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  formType: { type: String, required: true },
  formData: { type: Object, required: true },
  status: { type: String, default: 'Submitted' },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Application', ApplicationSchema);

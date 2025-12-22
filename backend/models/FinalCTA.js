import mongoose from 'mongoose';

const FinalCTASchema = new mongoose.Schema(
  {
    lang: { type: String, required: true, index: true, lowercase: true, trim: true },
    badge: { type: String, default: '' },
    headlineLine1: { type: String, default: '' },
    headlineLine2: { type: String, default: '' },
    subheading: { type: String, default: '' },
    benefits: { type: [String], default: [] },
    stats: {
      activeClients: { type: String, default: '' },
      avgRoi: { type: String, default: '' },
      satisfaction: { type: String, default: '' },
      fastStart: { type: String, default: '' },
    },
    trust: {
      consultationTime: { type: String, default: '' },
      consultationLabel: { type: String, default: '' },
      responseTime: { type: String, default: '' },
      responseLabel: { type: String, default: '' },
      noCommitment: { type: String, default: '' },
      noCommitmentLabel: { type: String, default: '' },
      footer: { type: String, default: '' },
    },
    ctas: {
      primaryLabel: { type: String, default: '' },
      primaryHref: { type: String, default: '' },
      secondaryLabel: { type: String, default: '' },
      secondaryHref: { type: String, default: '' },
    },
    whatsAppNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

FinalCTASchema.index({ lang: 1 }, { unique: true });

export default FinalCTASchema;

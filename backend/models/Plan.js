import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema(
  {
    lang: { type: String, enum: ['en', 'de'], required: true, index: true },
    planKey: { type: String, required: true },
    name: { type: String, required: true },
    hours: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    setupFee: { type: Number, required: true, min: 0 },
    features: { type: [String], default: [] },
    highlighted: { type: Boolean, default: false },
    badge: { type: String },
  },
  { timestamps: true }
);

PlanSchema.index({ lang: 1, planKey: 1 }, { unique: true });

export default PlanSchema;

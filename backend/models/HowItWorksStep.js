import mongoose from 'mongoose';

const HowItWorksStepSchema = new mongoose.Schema(
  {
    lang: { type: String, enum: ['en', 'de'], required: true, index: true },
    stepNumber: { type: Number, required: true, min: 1 },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'Calendar' }, // Icon name from lucide-react
    stepLabel: { type: String }, // e.g., "Step 1", "Schritt 1"
  },
  { timestamps: true }
);

// Ensure unique step number per language
HowItWorksStepSchema.index({ lang: 1, stepNumber: 1 }, { unique: true });

export default HowItWorksStepSchema;


import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema(
  {
    lang: { type: String, enum: ['en', 'de'], required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Ensure unique order per language
FAQSchema.index({ lang: 1, order: 1 }, { unique: true });

export default FAQSchema;


import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema(
  {
    lang: { type: String, enum: ['en', 'de'], required: true, index: true },
    content: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    company: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    order: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Ensure unique order per language
TestimonialSchema.index({ lang: 1, order: 1 }, { unique: true });

export default TestimonialSchema;


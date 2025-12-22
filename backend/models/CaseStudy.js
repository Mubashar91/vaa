import mongoose from 'mongoose';

const CaseStudySchema = new mongoose.Schema(
  {
    lang: { type: String, enum: ['en', 'de'], required: true, index: true },
    caseStudyId: { type: Number, required: true }, // Unique ID for the case study
    title: { type: String, required: true },
    company: { type: String, required: true },
    industry: { type: String, required: true },
    challenge: { type: String, required: true },
    solution: { type: String, required: true },
    results: { type: [mongoose.Schema.Types.Mixed], required: true }, // Array of result objects
    testimonial: { type: String, required: true },
    testimonialAuthor: { type: String, required: true },
    testimonialRole: { type: String, required: true },
    image: { type: String, required: true },
    stats: { type: mongoose.Schema.Types.Mixed, required: true }, // Object with costSaved, timeframe, vaCount
    order: { type: Number, default: 0 }, // For ordering
  },
  { timestamps: true }
);

// Ensure unique caseStudyId per language
CaseStudySchema.index({ lang: 1, caseStudyId: 1 }, { unique: true });

export default CaseStudySchema;


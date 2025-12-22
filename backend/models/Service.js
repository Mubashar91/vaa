import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    lang: { type: String, enum: ['en', 'de'], required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    benefit: { type: String, required: true },
    icon: { type: String, required: true }, // Icon name from lucide-react
    order: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Ensure unique order per language
ServiceSchema.index({ lang: 1, order: 1 }, { unique: true });

export default ServiceSchema;


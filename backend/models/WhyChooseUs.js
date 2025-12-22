import mongoose from 'mongoose';

const WhyChooseUsSchema = new mongoose.Schema(
  {
    lang: { type: String, enum: ['en', 'de'], required: true, index: true, unique: true },
    badge: { type: String, required: true },
    heading: { type: String, required: true },
    description: { type: String, required: true },
    items: { type: [mongoose.Schema.Types.Mixed], required: true }, // Array of items with icon, title, description
  },
  { timestamps: true }
);

export default WhyChooseUsSchema;


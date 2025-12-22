import mongoose from 'mongoose';

const HeroSchema = new mongoose.Schema(
  {
    lang: { type: String, enum: ['en', 'de'], required: true, index: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    tagline: { type: String, required: true },
    image: { type: String, required: true },
    ctaPrimary: { type: String, required: true },
    urgency: { type: String, required: true },
    stats: {
      clients: { type: String, required: true },
      costSaved: { type: String, required: true },
      rating: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default HeroSchema;


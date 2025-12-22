import mongoose from 'mongoose';

const FooterSchema = new mongoose.Schema(
  {
    lang: { type: String, enum: ['en', 'de'], required: true, index: true, unique: true },
    companyName: { type: String, required: true },
    copyright: { type: String, required: true },
    links: { type: [mongoose.Schema.Types.Mixed], default: [] }, // Array of {label, url}
    socialLinks: { type: [mongoose.Schema.Types.Mixed], default: [] }, // Array of {platform, url, icon}
    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export default FooterSchema;


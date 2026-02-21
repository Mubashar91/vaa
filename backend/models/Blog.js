import mongoose from 'mongoose';
 
const BlogSchema = new mongoose.Schema(
  {
    lang: { type: String, enum: ['en', 'de'], required: true, index: true },
    blogId: { type: Number, required: true }, // Unique ID for the blog post
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true }, // HTML content
    // Optional structured sections: stored alongside content for flexibility
    sections: {
      type: [
        new mongoose.Schema(
          {
            heading: { type: String, default: '' },
            details: { type: String, default: '' },
          },
          { _id: false }
        )
      ],
      default: undefined,
    },
    author: { type: String, required: true },
    date: { type: String, required: true },
    readTime: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    charts: { type: mongoose.Schema.Types.Mixed, default: null }, // JSON for charts config
    order: { type: Number, default: 0 }, // For ordering
  },
  { timestamps: true }
);

// Ensure unique blogId per language
BlogSchema.index({ lang: 1, blogId: 1 }, { unique: true });

export default BlogSchema;


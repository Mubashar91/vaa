import mongoose from 'mongoose';
import TestimonialSchema from '../models/Testimonial.js';
import { getTenantModel } from '../utils/tenantManager.js';

// Public: GET testimonials by language
export async function getTestimonials(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const Testimonial = await getTenantModel(req.tenantId, 'Testimonial', TestimonialSchema);
    const testimonials = await Testimonial.find({ lang })
      .sort({ order: 1 })
      .lean();
    return res.json({ lang, testimonials });
  } catch (err) {
    console.error('getTestimonials error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: list testimonials for a language
export async function listTestimonials(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const Testimonial = await getTenantModel(req.tenantId, 'Testimonial', TestimonialSchema);
    const testimonials = await Testimonial.find({ lang })
      .sort({ order: 1 })
      .lean();
    return res.json({ lang, testimonials });
  } catch (err) {
    console.error('listTestimonials error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: create testimonial
export async function createTestimonial(req, res) {
  try {
    const { lang = 'en', testimonial } = req.body || {};
    const Testimonial = await getTenantModel(req.tenantId, 'Testimonial', TestimonialSchema);
    console.log('📝 Creating testimonial:', { lang, testimonial });

    if (!testimonial || testimonial.order === undefined) {
      console.error('❌ Missing testimonial or order');
      return res.status(400).json({ error: 'testimonial with order required' });
    }

    const created = await Testimonial.create({ ...testimonial, lang: lang.toLowerCase() });
    console.log('✅ Testimonial created:', created._id);
    return res.status(201).json({ message: 'created', testimonial: created });
  } catch (err) {
    if (err.code === 11000) {
      console.error('❌ Duplicate order error:', err.message);
      return res.status(409).json({ error: 'duplicate order for lang', details: err.message });
    }
    console.error('❌ createTestimonial error', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// Admin: update testimonial
export async function updateTestimonial(req, res) {
  try {
    const { lang = 'en', updates = {} } = req.body || {};
    const Testimonial = await getTenantModel(req.tenantId, 'Testimonial', TestimonialSchema);
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid testimonial ID' });
    }
    
    const updated = await Testimonial.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), lang: lang.toLowerCase() },
      { $set: updates },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: 'not found' });
    return res.json({ message: 'updated', testimonial: updated });
  } catch (err) {
    console.error('updateTestimonial error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: delete testimonial
export async function deleteTestimonial(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const Testimonial = await getTenantModel(req.tenantId, 'Testimonial', TestimonialSchema);
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid testimonial ID' });
    }
    const result = await Testimonial.deleteOne({ _id: new mongoose.Types.ObjectId(id), lang });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'not found' });
    return res.json({ message: 'deleted' });
  } catch (err) {
    console.error('deleteTestimonial error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


import mongoose from 'mongoose';
import FAQSchema from '../models/FAQ.js';
import { getTenantModel } from '../utils/tenantManager.js';

// Public: GET FAQs by language
export async function getFAQs(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const FAQ = await getTenantModel(req.tenantId, 'FAQ', FAQSchema);

    const faqs = await FAQ.find({ lang })
      .sort({ order: 1 })
      .lean();

    return res.json({ lang, faqs });
  } catch (err) {
    console.error('❌ getFAQs error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: list FAQs
export async function listFAQs(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const FAQ = await getTenantModel(req.tenantId, 'FAQ', FAQSchema);

    const faqs = await FAQ.find({ lang })
      .sort({ order: 1 })
      .lean();

    return res.json({ lang, faqs });
  } catch (err) {
    console.error('❌ listFAQs error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: create FAQ
export async function createFAQ(req, res) {
  try {
    const { lang = 'en', faq } = req.body || {};
    const FAQ = await getTenantModel(req.tenantId, 'FAQ', FAQSchema);

    if (!faq || faq.order === undefined) {
      return res.status(400).json({ error: 'faq with order required' });
    }

    const created = await FAQ.create({
      ...faq,
      lang: lang.toLowerCase(),
    });

    return res.status(201).json({ message: 'created', faq: created });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'duplicate order for lang' });
    }
    console.error('❌ createFAQ error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: update FAQ
export async function updateFAQ(req, res) {
  try {
    const { lang = 'en', updates = {} } = req.body || {};
    const FAQ = await getTenantModel(req.tenantId, 'FAQ', FAQSchema);
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid FAQ ID' });
    }

    const updated = await FAQ.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), lang: lang.toLowerCase() },
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    return res.json({ message: 'updated', faq: updated });
  } catch (err) {
    console.error('❌ updateFAQ error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: delete FAQ
export async function deleteFAQ(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const FAQ = await getTenantModel(req.tenantId, 'FAQ', FAQSchema);
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: 'Invalid FAQ ID' });
    }

    const result = await FAQ.deleteOne({ _id: new mongoose.Types.ObjectId(id), lang });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    return res.json({ message: 'deleted' });
  } catch (err) {
    console.error('❌ deleteFAQ error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

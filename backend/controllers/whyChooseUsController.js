import WhyChooseUsSchema from '../models/WhyChooseUs.js';
import { getTenantModel } from '../utils/tenantManager.js';

// Public: GET why choose us by language
export async function getWhyChooseUs(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const WhyChooseUs = await getTenantModel(req.tenantId, 'WhyChooseUs', WhyChooseUsSchema);
    const whyChooseUs = await WhyChooseUs.findOne({ lang }).lean();
    if (!whyChooseUs) return res.status(404).json({ error: 'WhyChooseUs not found' });
    return res.json({ lang, whyChooseUs });
  } catch (err) {
    console.error('getWhyChooseUs error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: get why choose us
export async function getWhyChooseUsAdmin(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const WhyChooseUs = await getTenantModel(req.tenantId, 'WhyChooseUs', WhyChooseUsSchema);
    const whyChooseUs = await WhyChooseUs.findOne({ lang }).lean();
    return res.json({ lang, whyChooseUs });
  } catch (err) {
    console.error('getWhyChooseUsAdmin error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: create or update why choose us
export async function upsertWhyChooseUs(req, res) {
  try {
    const { lang = 'en', whyChooseUs } = req.body || {};
    const WhyChooseUs = await getTenantModel(req.tenantId, 'WhyChooseUs', WhyChooseUsSchema);
    if (!whyChooseUs) {
      return res.status(400).json({ error: 'whyChooseUs data required' });
    }
    const updated = await WhyChooseUs.findOneAndUpdate(
      { lang: lang.toLowerCase() },
      { ...whyChooseUs, lang: lang.toLowerCase() },
      { upsert: true, new: true }
    ).lean();
    return res.json({ message: 'saved', whyChooseUs: updated });
  } catch (err) {
    console.error('upsertWhyChooseUs error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


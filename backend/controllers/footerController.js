import FooterSchema from '../models/Footer.js';
import { getTenantModel } from '../utils/tenantManager.js';

// Public: GET footer by language
export async function getFooter(req, res) {
  try {
    const Footer = await getTenantModel(req.tenantId, 'Footer', FooterSchema);
    const lang = (req.query.lang || 'en').toLowerCase();
    const footer = await Footer.findOne({ lang }).lean();
    if (!footer) return res.status(404).json({ error: 'Footer not found' });
    return res.json({ lang, footer });
  } catch (err) {
    console.error('getFooter error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: get footer
export async function getFooterAdmin(req, res) {
  try {
    const Footer = await getTenantModel(req.tenantId, 'Footer', FooterSchema);
    const lang = (req.query.lang || 'en').toLowerCase();
    const footer = await Footer.findOne({ lang }).lean();
    return res.json({ lang, footer });
  } catch (err) {
    console.error('getFooterAdmin error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: create or update footer
export async function upsertFooter(req, res) {
  try {
    const { lang = 'en', footer } = req.body || {};
    const Footer = await getTenantModel(req.tenantId, 'Footer', FooterSchema);
    if (!footer) {
      return res.status(400).json({ error: 'footer data required' });
    }
    const updated = await Footer.findOneAndUpdate(
      { lang: lang.toLowerCase() },
      { ...footer, lang: lang.toLowerCase() },
      { upsert: true, new: true }
    ).lean();
    return res.json({ message: 'saved', footer: updated });
  } catch (err) {
    console.error('upsertFooter error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


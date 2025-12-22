import FinalCTASchema from '../models/FinalCTA.js';
import { getTenantModel } from '../utils/tenantManager.js';

// Public: GET Final CTA by language
export async function getFinalCTA(req, res) {
  try {
    const FinalCTA = await getTenantModel(req.tenantId, 'FinalCTA', FinalCTASchema);
    const lang = (req.query.lang || 'en').toLowerCase();
    const doc = await FinalCTA.findOne({ lang }).lean();
    if (!doc) return res.status(404).json({ error: 'Final CTA not found' });
    return res.json({ lang, finalCta: doc });
  } catch (err) {
    console.error('getFinalCTA error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: GET Final CTA (returns null if not created yet)
export async function getFinalCTAAdmin(req, res) {
  try {
    const FinalCTA = await getTenantModel(req.tenantId, 'FinalCTA', FinalCTASchema);
    const lang = (req.query.lang || 'en').toLowerCase();
    const doc = await FinalCTA.findOne({ lang }).lean();
    return res.json({ lang, finalCta: doc || null });
  } catch (err) {
    console.error('getFinalCTAAdmin error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: UPSERT Final CTA
export async function upsertFinalCTA(req, res) {
  try {
    const { lang = 'en', finalCta } = req.body || {};
    const FinalCTA = await getTenantModel(req.tenantId, 'FinalCTA', FinalCTASchema);
    if (!finalCta) return res.status(400).json({ error: 'finalCta payload required' });

    const updated = await FinalCTA.findOneAndUpdate(
      { lang: String(lang).toLowerCase() },
      { ...finalCta, lang: String(lang).toLowerCase() },
      { upsert: true, new: true }
    ).lean();

    return res.json({ message: 'saved', finalCta: updated });
  } catch (err) {
    console.error('upsertFinalCTA error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

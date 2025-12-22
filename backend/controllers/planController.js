import PlanSchema from '../models/Plan.js';
import { getTenantModel } from '../utils/tenantManager.js';

// Public: GET pricing by language
export async function getPricing(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const Plan = await getTenantModel(req.tenantId, 'Plan', PlanSchema);
    console.log(`📊 Fetching pricing for language: ${lang}`);
    const plans = await Plan.find({ lang }).sort({ planKey: 1 }).lean();
    console.log(`✅ Found ${plans.length} plans for ${lang}`);
    if (plans.length === 0) {
      console.warn(`⚠️  No pricing plans found for language: ${lang}`);
    }
    return res.json({ lang, plans });
  } catch (err) {
    console.error('❌ getPricing error', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// Admin: list plans for a language
export async function listPlans(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const Plan = await getTenantModel(req.tenantId, 'Plan', PlanSchema);
    const plans = await Plan.find({ lang }).sort({ planKey: 1 }).lean();
    return res.json({ lang, plans });
  } catch (err) {
    console.error('listPlans error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: create
export async function createPlan(req, res) {
  try {
    const { lang = 'en', plan } = req.body || {};
    const Plan = await getTenantModel(req.tenantId, 'Plan', PlanSchema);
    if (!plan || !plan.planKey) return res.status(400).json({ error: 'plan with planKey required' });
    const created = await Plan.create({ ...plan, lang: lang.toLowerCase() });
    return res.status(201).json({ message: 'created', plan: created });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'duplicate plan for lang and planKey' });
    console.error('createPlan error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: update
export async function updatePlan(req, res) {
  try {
    const { lang = 'en', updates = {} } = req.body || {};
    const Plan = await getTenantModel(req.tenantId, 'Plan', PlanSchema);
    const planKey = req.params.planKey;
    const updated = await Plan.findOneAndUpdate(
      { lang: lang.toLowerCase(), planKey },
      { $set: updates },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: 'not found' });
    return res.json({ message: 'updated', plan: updated });
  } catch (err) {
    console.error('updatePlan error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: delete
export async function deletePlan(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const Plan = await getTenantModel(req.tenantId, 'Plan', PlanSchema);
    const planKey = req.params.planKey;
    const result = await Plan.deleteOne({ lang, planKey });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'not found' });
    return res.json({ message: 'deleted' });
  } catch (err) {
    console.error('deletePlan error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

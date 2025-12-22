import HowItWorksStepSchema from '../models/HowItWorksStep.js';
import { getTenantModel } from '../utils/tenantManager.js';

// Public: GET how it works steps by language
export async function getHowItWorks(req, res) {
  try {
    const HowItWorksStep = await getTenantModel(req.tenantId, 'HowItWorksStep', HowItWorksStepSchema);
    const lang = (req.query.lang || 'en').toLowerCase();
    const steps = await HowItWorksStep.find({ lang })
      .sort({ stepNumber: 1 })
      .lean();
    return res.json({ lang, steps });
  } catch (err) {
    console.error('getHowItWorks error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: list steps for a language
export async function listSteps(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const HowItWorksStep = await getTenantModel(req.tenantId, 'HowItWorksStep', HowItWorksStepSchema);
    const steps = await HowItWorksStep.find({ lang })
      .sort({ stepNumber: 1 })
      .lean();
    return res.json({ lang, steps });
  } catch (err) {
    console.error('listSteps error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: create step
export async function createStep(req, res) {
  try {
    const { lang = 'en', step } = req.body || {};
    const HowItWorksStep = await getTenantModel(req.tenantId, 'HowItWorksStep', HowItWorksStepSchema);
    if (!step || step.stepNumber === undefined) {
      return res.status(400).json({ error: 'step with stepNumber required' });
    }
    const created = await HowItWorksStep.create({ ...step, lang: lang.toLowerCase() });
    return res.status(201).json({ message: 'created', step: created });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'duplicate step number for lang' });
    }
    console.error('createStep error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: update step
export async function updateStep(req, res) {
  try {
    const { lang = 'en', updates = {} } = req.body || {};
    const HowItWorksStep = await getTenantModel(req.tenantId, 'HowItWorksStep', HowItWorksStepSchema);
    const stepNumber = parseInt(req.params.stepNumber);
    if (isNaN(stepNumber)) {
      return res.status(400).json({ error: 'Invalid step number' });
    }
    const updated = await HowItWorksStep.findOneAndUpdate(
      { lang: lang.toLowerCase(), stepNumber },
      { $set: updates },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: 'not found' });
    return res.json({ message: 'updated', step: updated });
  } catch (err) {
    console.error('updateStep error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: delete step
export async function deleteStep(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const HowItWorksStep = await getTenantModel(req.tenantId, 'HowItWorksStep', HowItWorksStepSchema);
    const stepNumber = parseInt(req.params.stepNumber);
    if (isNaN(stepNumber)) {
      return res.status(400).json({ error: 'Invalid step number' });
    }
    const result = await HowItWorksStep.deleteOne({ lang, stepNumber });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'not found' });
    return res.json({ message: 'deleted' });
  } catch (err) {
    console.error('deleteStep error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


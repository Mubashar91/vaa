import CaseStudySchema from '../models/CaseStudy.js';
import { getTenantModel } from '../utils/tenantManager.js';

// Public: GET case studies by language
export async function getCaseStudies(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const CaseStudy = await getTenantModel(req.tenantId, 'CaseStudy', CaseStudySchema);
    const caseStudies = await CaseStudy.find({ lang })
      .sort({ order: 1, caseStudyId: 1 })
      .lean();
    return res.json({ lang, caseStudies });
  } catch (err) {
    console.error('getCaseStudies error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Public: GET single case study by ID
export async function getCaseStudyById(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const CaseStudy = await getTenantModel(req.tenantId, 'CaseStudy', CaseStudySchema);
    const caseStudyId = parseInt(req.params.id);
    if (isNaN(caseStudyId)) {
      return res.status(400).json({ error: 'Invalid case study ID' });
    }
    const caseStudy = await CaseStudy.findOne({ lang, caseStudyId }).lean();
    if (!caseStudy) return res.status(404).json({ error: 'Case study not found' });
    return res.json({ lang, caseStudy });
  } catch (err) {
    console.error('getCaseStudyById error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: list case studies for a language
export async function listCaseStudies(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const CaseStudy = await getTenantModel(req.tenantId, 'CaseStudy', CaseStudySchema);
    const caseStudies = await CaseStudy.find({ lang })
      .sort({ order: 1, caseStudyId: 1 })
      .lean();
    return res.json({ lang, caseStudies });
  } catch (err) {
    console.error('listCaseStudies error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: create case study
export async function createCaseStudy(req, res) {
  try {
    const { lang = 'en', caseStudy } = req.body || {};
    const CaseStudy = await getTenantModel(req.tenantId, 'CaseStudy', CaseStudySchema);
    if (!caseStudy || caseStudy.caseStudyId === undefined) {
      return res.status(400).json({ error: 'caseStudy with caseStudyId required' });
    }
    const created = await CaseStudy.create({ ...caseStudy, lang: lang.toLowerCase() });
    return res.status(201).json({ message: 'created', caseStudy: created });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'duplicate caseStudyId for lang' });
    }
    console.error('createCaseStudy error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: update case study
export async function updateCaseStudy(req, res) {
  try {
    const { lang = 'en', updates = {} } = req.body || {};
    const CaseStudy = await getTenantModel(req.tenantId, 'CaseStudy', CaseStudySchema);
    const caseStudyId = parseInt(req.params.id);
    if (isNaN(caseStudyId)) {
      return res.status(400).json({ error: 'Invalid case study ID' });
    }
    const updated = await CaseStudy.findOneAndUpdate(
      { lang: lang.toLowerCase(), caseStudyId },
      { $set: updates },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: 'not found' });
    return res.json({ message: 'updated', caseStudy: updated });
  } catch (err) {
    console.error('updateCaseStudy error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: delete case study
export async function deleteCaseStudy(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const CaseStudy = await getTenantModel(req.tenantId, 'CaseStudy', CaseStudySchema);
    const caseStudyId = parseInt(req.params.id);
    if (isNaN(caseStudyId)) {
      return res.status(400).json({ error: 'Invalid case study ID' });
    }
    const result = await CaseStudy.deleteOne({ lang, caseStudyId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'not found' });
    return res.json({ message: 'deleted' });
  } catch (err) {
    console.error('deleteCaseStudy error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


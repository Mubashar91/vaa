import ServiceSchema from '../models/Service.js';
import { getTenantModel } from '../utils/tenantManager.js';

// Public: GET services by language
export async function getServices(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const Service = await getTenantModel(req.tenantId, 'Service', ServiceSchema);

    // Fetch services for the requested language, but be tolerant of older
    // documents that may have been saved with different casing.
    const requestedLangs = Array.from(new Set([lang, lang.toUpperCase()]));
    let services = await Service.find({ lang: { $in: requestedLangs } })
      .sort({ order: 1 })
      .lean();

    // If the requested language has no data, fall back to English so the
    // public site still shows a complete services list instead of an empty
    // section. The frontend can show a small notice when a fallback occurs.
    let sourceLang = lang;
    if (services.length === 0 && lang !== 'en') {
      const fallback = await Service.find({ lang: { $in: ['en', 'EN'] } })
        .sort({ order: 1 })
        .lean();
      if (fallback.length > 0) {
        services = fallback;
        sourceLang = 'en';
      }
    }

    return res.json({ lang, sourceLang, services });
  } catch (err) {
    console.error('getServices error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: list services for a language
export async function listServices(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const Service = await getTenantModel(req.tenantId, 'Service', ServiceSchema);
    const services = await Service.find({ lang })
      .sort({ order: 1 })
      .lean();
    return res.json({ lang, services });
  } catch (err) {
    console.error('listServices error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: create service
export async function createService(req, res) {
  try {
    const { lang = 'en', service } = req.body || {};
    const Service = await getTenantModel(req.tenantId, 'Service', ServiceSchema);
    if (!service || service.order === undefined) {
      return res.status(400).json({ error: 'service with order required' });
    }
    const created = await Service.create({ ...service, lang: lang.toLowerCase() });
    return res.status(201).json({ message: 'created', service: created });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'duplicate order for lang' });
    }
    console.error('createService error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: update service
export async function updateService(req, res) {
  try {
    const { lang = 'en', updates = {} } = req.body || {};
    const Service = await getTenantModel(req.tenantId, 'Service', ServiceSchema);
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }
    
    const updated = await Service.findOneAndUpdate(
      { _id: id, lang: lang.toLowerCase() },
      { $set: updates },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: 'not found' });
    return res.json({ message: 'updated', service: updated });
  } catch (err) {
    console.error('updateService error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Admin: delete service
export async function deleteService(req, res) {
  try {
    const lang = (req.query.lang || 'en').toLowerCase();
    const Service = await getTenantModel(req.tenantId, 'Service', ServiceSchema);
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }
    const result = await Service.deleteOne({ _id: id, lang });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'not found' });
    return res.json({ message: 'deleted' });
  } catch (err) {
    console.error('deleteService error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


/**
 * Middleware to resolve Tenant ID from request
 * Expects X-Tenant-ID header.
 */
export const tenantMiddleware = (req, res, next) => {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
        return res.status(400).json({ error: 'X-Tenant-ID header is missing. Required for multi-tenant support.' });
    }

    // Optional: Validate if tenant is allowed/configured
    // const config = getTenantConfig();
    // if (!config[tenantId]) {
    //   return res.status(404).json({ error: 'Tenant not found' });
    // }

    req.tenantId = tenantId;
    next();
};

/**
 * Middleware to resolve Tenant ID from request
 * Expects X-Tenant-ID header.
 */
export const tenantMiddleware = (req, res, next) => {
    const tenantId = req.headers['x-tenant-id'];
    
    // Public endpoints that don't need tenant ID
    const publicEndpoints = ['/health', '/api/auth/login', '/api/auth/signup'];
    
    if (!tenantId) {
        // Allow public endpoints without tenant ID
        if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
            req.tenantId = 'donva'; // Default tenant
            return next();
        }
        
        return res.status(400).json({ error: 'X-Tenant-ID header is missing. Required for multi-tenant support.' });
    }

    req.tenantId = tenantId;
    next();
};

/**
 * Global Fetch Interceptor
 * 
 * This utility monkey-patches window.fetch to automatically inject the 
 * X-Tenant-ID header into all requests.
 */

const originalFetch = window.fetch;

window.fetch = async (...args) => {
    let [resource, config] = args;

    // Get API base and Tenant ID from environment variables
    const API_BASE = import.meta.env.VITE_API_BASE || '';
    const TENANT_ID = import.meta.env.VITE_DATABASE || 'main';

    // Only intercept requests to our API or common API patterns
    const resourceUrl = typeof resource === 'string' ? resource : resource instanceof URL ? resource.href : resource.url;

    let isApiRequest = resourceUrl.includes(API_BASE) || 
                      resourceUrl.startsWith('/api') ||
                      resourceUrl.includes('don-va.com') ||
                      resourceUrl.includes('api.don-va.com') ||
                      (!resourceUrl.startsWith('http') && (resourceUrl.includes('api') || resourceUrl.includes('/')));

    if (isApiRequest) {
        // Fix for missing protocol in VITE_API_BASE
        if (typeof resource === 'string' && !resource.startsWith('http') && !resource.startsWith('/')) {
            resource = `http://${resource}`;
        }

        config = config || {};
        const headers = new Headers(config.headers || {});

        // Inject X-Tenant-ID if it's not already there
        if (!headers.has('X-Tenant-ID')) {
            headers.set('X-Tenant-ID', TENANT_ID);
        }

        config.headers = headers;
    }

    return originalFetch(resource, config);
};

console.log('🚀 [Fetch Interceptor] Global interceptor active. Tenant ID:', import.meta.env.VITE_DATABASE || 'main');

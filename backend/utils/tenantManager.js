import mongoose from 'mongoose';
import { getTenantConfig } from '../config/tenants.js';

// Schemas need to be imported here or passed in. 
// A better pattern is to pass the Schema object to getTenantModel.

const connectionPool = new Map();
const modelPool = new Map(); // Key: tenantId-modelName

/**
 * Get or create a mongoose connection for a specific tenant
 * @param {string} tenantId 
 * @returns {Promise<mongoose.Connection>}
 */
export async function getTenantConnection(tenantId) {
    if (!tenantId) throw new Error('Tenant ID is required');

    // Check if a connection or a connection attempt already exists
    if (connectionPool.has(tenantId)) {
        return connectionPool.get(tenantId);
    }

    // Create a new connection promise and store it in the pool immediately
    const connPromise = (async () => {
        const tenantConfig = getTenantConfig();
        const config = tenantConfig[tenantId];

        if (!config) {
            connectionPool.delete(tenantId);
            throw new Error(`Configuration for tenant '${tenantId}' not found`);
        }

        const dbUri = typeof config === 'string' ? config : config.uri;
        const dbName = typeof config === 'object' ? config.dbName : undefined;

        if (!dbUri) {
            connectionPool.delete(tenantId);
            throw new Error(`Database URI for tenant '${tenantId}' is missing`);
        }

        try {
            console.log(`[TenantManager] Attempting to connect to: ${tenantId}...`);
            const conn = mongoose.createConnection(dbUri, {
                dbName,
                serverSelectionTimeoutMS: 20000, // Further increased for slow DNS
                connectTimeoutMS: 30000,        // Timeout for initial connection
                socketTimeoutMS: 45000,
                family: 4,                      // Force IPv4 to avoid IPv6 DNS issues
            });

            // Handle connection events
            conn.on('connected', () => console.log(`✅ [Tenant: ${tenantId}] MongoDB connected`));
            conn.on('error', (err) => {
                console.error(`❌ [Tenant: ${tenantId}] Connection error:`, err.message);
                if (err.message.includes('ETIMEOUT')) {
                    console.error(`💡 [Tenant: ${tenantId}] DNS Timeout. This often happens on unstable networks or with specific ISP DNS. Try switching your system DNS to 8.8.8.8.`);
                }
            });

            conn.on('disconnected', () => {
                console.warn(`⚠️ [Tenant: ${tenantId}] Disconnected`);
                connectionPool.delete(tenantId);
                // Clear models for this tenant as the connection is gone
                for (const key of modelPool.keys()) {
                    if (key.startsWith(`${tenantId}-`)) {
                        modelPool.delete(key);
                    }
                }
            });

            // Wait for open
            await new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    connectionPool.delete(tenantId);
                    reject(new Error(`Connection attempt for ${tenantId} timed out after 30s`));
                }, 31000);

                conn.once('open', () => {
                    clearTimeout(timeoutId);
                    resolve();
                });
                conn.once('error', (err) => {
                    clearTimeout(timeoutId);
                    connectionPool.delete(tenantId);
                    reject(err);
                });
            });

            console.log(`🚀 [Tenant: ${tenantId}] Connection established and open.`);
            return conn;
        } catch (error) {
            connectionPool.delete(tenantId);
            console.error(`❌ Failed to connect for tenant ${tenantId}:`, error.message);
            throw error;
        }
    })();

    connectionPool.set(tenantId, connPromise);
    return connPromise;
}

/**
 * Get a model compiled for a specific tenant
 * @param {string} tenantId 
 * @param {string} modelName 
 * @param {mongoose.Schema} schema 
 * @returns {Promise<mongoose.Model>}
 */
export async function getTenantModel(tenantId, modelName, schema) {
    const cacheKey = `${tenantId}-${modelName}`;

    // Optional: allow forcing a recompile of models to pick up latest schema changes
    const forceRecompile = process.env.FORCE_MODEL_RECOMPILE === 'true';

    if (!forceRecompile && modelPool.has(cacheKey)) {
        return modelPool.get(cacheKey);
    }

    const conn = await getTenantConnection(tenantId);

    if (forceRecompile) {
        try {
            // Clear any previously compiled model on this connection
            if (conn.models && conn.models[modelName]) {
                if (typeof conn.deleteModel === 'function') {
                    conn.deleteModel(modelName);
                } else {
                    // Fallback: delete reference (older Mongoose)
                    delete conn.models[modelName];
                }
            }
            // Also clear our local model cache for this key
            modelPool.delete(cacheKey);
        } catch (e) {
            console.warn(`[TenantManager] Failed to delete model ${modelName} for tenant ${tenantId}:`, e?.message || e);
        }
    }

    // Create (or recreate) model on the specific connection
    const model = conn.model(modelName, schema);

    modelPool.set(cacheKey, model);
    return model;
}

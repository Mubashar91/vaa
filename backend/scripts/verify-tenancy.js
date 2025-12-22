import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001/api';

async function testTenant(tenantId, email, password) {
    console.log(`\nTesting Tenant: ${tenantId}`);
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': tenantId
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            console.log('Login Success');
        } else {
            console.log('Response:', data);
        }
        return data;
    } catch (err) {
        console.error('Request failed:', err.message);
    }
}

async function run() {
    // Wait for server to start if running concurrently, or just run this manually
    console.log('Starting verification...');

    // Test with 'main' tenant (default config fallback)
    await testTenant('main', 'admin@example.com', 'password123');

    // Test with invalid tenant
    await testTenant('invalid-tenant', 'admin@example.com', 'password123');
}

run();

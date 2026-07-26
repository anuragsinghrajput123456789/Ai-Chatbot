/**
 * Environment Configuration Validator
 * Validates critical env variables at startup and outputs warnings for missing optional ones.
 */
export const validateEnv = () => {
    const required = ['MONGO_URI', 'JWT_SECRET'];
    const missingRequired = [];

    required.forEach(key => {
        if (!process.env[key] || process.env[key].trim() === '') {
            missingRequired.push(key);
        }
    });

    if (missingRequired.length > 0) {
        console.error('========================================================================');
        console.error('❌ CRITICAL STARTUP ERROR: Missing mandatory environment variables:');
        missingRequired.forEach(key => console.error(`   - ${key}`));
        console.error('========================================================================');
        console.error('Server is shutting down. Refer to .env.example to set up your environment.');
        process.exit(1);
    }

    // Optional environment variables checks
    const optional = ['GEMINI_API_KEY', 'OPENROUTER_API_KEY', 'FRONTEND_URL'];
    optional.forEach(key => {
        if (!process.env[key] || process.env[key].trim() === '') {
            if (key === 'GEMINI_API_KEY' || key === 'OPENROUTER_API_KEY') {
                console.warn(`⚠️  WARNING: Optional environment variable "${key}" is not set. Cloud-powered (Online) completions for this provider will be disabled.`);
            } else {
                console.warn(`⚠️  WARNING: Optional environment variable "${key}" is not set. Default settings will be applied.`);
            }
        }
    });

    console.log('✅ Environment configuration validation passed.');
};

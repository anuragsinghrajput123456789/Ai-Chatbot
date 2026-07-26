import crypto from 'crypto';

/**
 * Production-ready request logger middleware.
 * Generates a unique Request ID for tracing, tracks response latency,
 * and logs details in a structured format.
 */
export const requestLogger = (req, res, next) => {
    // Generate request ID if not provided by load balancer (e.g. Render/Cloudflare)
    req.id = req.headers['x-request-id'] || crypto.randomUUID();
    res.setHeader('x-request-id', req.id);
    req.startTime = Date.now();

    // Log request arrival
    console.log(`[REQ] ID=${req.id} Method=${req.method} Path=${req.path} IP=${req.ip} UA="${req.headers['user-agent'] || 'unknown'}"`);

    // Capture response completion
    res.on('finish', () => {
        const duration = Date.now() - req.startTime;
        console.log(`[RES] ID=${req.id} Status=${res.statusCode} Method=${req.method} Path=${req.path} Duration=${duration}ms`);
    });

    next();
};

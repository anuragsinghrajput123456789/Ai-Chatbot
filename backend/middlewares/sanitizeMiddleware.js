const isPlainObject = (val) => {
    return val !== null && typeof val === 'object' && (Object.getPrototypeOf(val) === Object.prototype || Object.getPrototypeOf(val) === null);
};

const hasMongoKeys = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    
    if (Array.isArray(obj)) {
        return obj.some(item => hasMongoKeys(item));
    }

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (key.startsWith('$') || key.includes('.')) return true;
            if (typeof obj[key] === 'object' && hasMongoKeys(obj[key])) return true;
        }
    }
    return false;
};

const sanitize = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
    }

    if (!isPlainObject(obj)) return obj;

    const newObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (key.startsWith('$') || key.includes('.')) continue;
            
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                newObj[key] = sanitize(obj[key]);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    return newObj;
};

export const mongoSanitize = (req, res, next) => {
    // Sanitize body, params, and headers (if needed)
    if (req.body) req.body = sanitize(req.body);
    if (req.params) req.params = sanitize(req.params);
    
    // For req.query in Express 5, it's a getter. 
    // We can't easily overwrite it, so we'll check it and throw an error or just ignore the malicious keys
    // by creating a local sanitized version if something is trying to use it.
    // However, most controllers use req.query directly.
    // The safest way in Express 5 is to redefine the property if we MUST change it, 
    // but better to just sanitize it and assign to a new property if needed, 
    // or use Object.defineProperty.
    
    try {
        const sanitizedQuery = sanitize(req.query);
        Object.defineProperty(req, 'query', {
            value: sanitizedQuery,
            writable: true,
            enumerable: true,
            configurable: true
        });
    } catch (err) {
        // Fallback: if we can't redefine query, we'll just log and continue
        // or we could block the request if it contains mongo keys
        if (hasMongoKeys(req.query)) {
            return res.status(400).json({ error: 'Prohibited characters in query string' });
        }
    }

    next();
};

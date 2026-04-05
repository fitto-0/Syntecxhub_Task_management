export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('User-Agent') || '';

  // Log request details
  console.log(`[${timestamp}] ${method} ${originalUrl} - IP: ${ip} - ${userAgent}`);

  // Track response time
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    console.log(`[${timestamp}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms`);
  });

  next();
};

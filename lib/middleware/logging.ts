import { NextRequest, NextResponse } from 'next/server';
import logger, { logRequest, logResponse, logError } from '@/lib/logger';

export function withLogging(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    
    // Log incoming request
    logRequest(req, {
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(req.headers.entries()),
    });
    
    try {
      // Execute the actual handler
      const response = await handler(req);
      const responseTime = Date.now() - startTime;
      
      // Log successful response
      logResponse(req, response, responseTime, {
        timestamp: new Date().toISOString(),
      });
      
      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log error
      logError(error as Error, {
        method: req.method,
        url: req.url,
        responseTime: `${responseTime}ms`,
        headers: Object.fromEntries(req.headers.entries()),
      });
      
      // Re-throw the error so it can be handled by the error boundary
      throw error;
    }
  };
}

// Helper function for API routes
export function logApiCall(
  route: string,
  method: string,
  userId?: string,
  metadata?: Record<string, any>
) {
  logger.info('API Call', {
    route,
    method,
    userId,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

// Helper function for performance monitoring
export function logPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, any>
) {
  if (duration > 1000) { // Log slow operations (>1s)
    logger.warn('Slow Operation Detected', {
      operation,
      duration: `${duration}ms`,
      ...metadata,
    });
  } else {
    logger.debug('Performance Metric', {
      operation,
      duration: `${duration}ms`,
      ...metadata,
    });
  }
}
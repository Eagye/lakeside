import { Injectable, Logger, LogLevel } from '@nestjs/common';

@Injectable()
export class AppLoggerService extends Logger {
  private readonly isProd = process.env.NODE_ENV === 'production';

  /**
   * Log error with context
   */
  logError(message: string, trace?: string, context?: string): void {
    super.error(message, trace, context || 'AppLoggerService');
    
    // In production, you can send this to external monitoring service
    if (this.isProd) {
      // TODO: Send to Sentry, LogRocket, or other monitoring service
      // Example: Sentry.captureException(new Error(message));
      this.sendToMonitoring('error', message, { trace, context });
    }
  }

  /**
   * Log warning
   */
  logWarning(message: string, context?: string): void {
    super.warn(message, context || 'AppLoggerService');
    
    if (this.isProd) {
      this.sendToMonitoring('warning', message, { context });
    }
  }

  /**
   * Log info
   */
  logInfo(message: string, context?: string): void {
    super.log(message, context || 'AppLoggerService');
  }

  /**
   * Log debug (only in development)
   */
  logDebug(message: string, context?: string): void {
    if (!this.isProd) {
      super.debug(message, context || 'AppLoggerService');
    }
  }

  /**
   * Send logs to external monitoring service
   * Replace this with your actual monitoring service integration
   */
  private sendToMonitoring(
    level: string,
    message: string,
    metadata?: Record<string, any>,
  ): void {
    // Example integration points:
    // 
    // 1. Sentry (Error Tracking)
    // import * as Sentry from '@sentry/node';
    // Sentry.captureMessage(message, level as SeverityLevel);
    //
    // 2. LogRocket (Session Replay + Error Tracking)
    // LogRocket.captureMessage(message, { level, ...metadata });
    //
    // 3. DataDog (Full Observability)
    // logger.log(message, { level, ...metadata });
    //
    // 4. Custom API Endpoint
    // fetch('https://your-logging-api.com/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ level, message, metadata, timestamp: new Date() })
    // });

    console.log(
      `[MONITORING] ${level.toUpperCase()}: ${message}`,
      metadata || '',
    );
  }

  /**
   * Log HTTP request
   */
  logHttpRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
  ): void {
    const message = `${method} ${url} ${statusCode} - ${duration}ms`;
    this.logInfo(message, 'HTTP');

    // Track slow requests
    if (duration > 3000) {
      this.logWarning(
        `Slow request detected: ${message}`,
        'Performance',
      );
    }
  }

  /**
   * Log database query
   */
  logDatabaseQuery(query: string, duration: number): void {
    if (!this.isProd) {
      this.logDebug(`Query executed in ${duration}ms: ${query}`, 'Database');
    }

    // Track slow queries
    if (duration > 1000) {
      this.logWarning(
        `Slow database query (${duration}ms): ${query.substring(0, 100)}...`,
        'Database Performance',
      );
    }
  }
}

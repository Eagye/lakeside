import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

/**
 * Validates required environment variables at application startup
 * Throws error if critical variables are missing in production
 */
export function validateEnvironment(): void {
  const isProd = process.env.NODE_ENV === 'production';
  const requiredVars = ['SESSION_SECRET'];

  // Production-only required variables
  if (isProd) {
    requiredVars.push(
      'ADMIN_USERNAME',
      'ADMIN_PASSWORD',
      // SMTP variables are optional - contact form will be disabled without them
      // 'SMTP_HOST',
      // 'SMTP_PORT',
      // 'SMTP_USER',
      // 'SMTP_PASSWORD',
      // 'CONTACT_EMAIL',
    );
  }

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(errorMsg);
    logger.error('Please check your .env file and ensure all required variables are set');
    
    if (isProd) {
      throw new Error(errorMsg);
    } else {
      logger.warn('Application starting with missing variables in development mode');
    }
  }

  // Validate specific formats
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
    const msg = 'SESSION_SECRET must be at least 32 characters long';
    logger.error(msg);
    if (isProd) {
      throw new Error(msg);
    }
  }

  logger.log('Environment validation passed');
}

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import csurf from 'csurf';
import type { CookieOptions } from 'csurf';
import { json, urlencoded } from 'express';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import helmet from 'helmet';
import type { HelmetOptions } from 'helmet';
import { join } from 'path';
import * as hbs from 'hbs';
import { AppModule } from './app.module';
import { BranchService } from './branches/branch.service';
import { validateEnvironment } from './config/env.validation';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  // Validate environment variables before starting the app
  validateEnvironment();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Initialize default branches
  const branchService = app.get(BranchService);
  await branchService.initializeDefaultBranches();
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.set('trust proxy', 1);
  }
  const cookieParserFactory = cookieParser as unknown as () => RequestHandler;
  const helmetFactory = helmet as unknown as (
    options: HelmetOptions,
  ) => RequestHandler;
  const csrfFactory = csurf as unknown as (options: {
    cookie: CookieOptions;
  }) => RequestHandler;

  app.use(cookieParserFactory());
  app.use(compression());
  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(
    helmetFactory({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: [
            "'self'",
            'https:',
            'data:',
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
          ],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
          objectSrc: ["'none'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://maps.googleapis.com',
            'https://www.googletagmanager.com',
            'https://www.google-analytics.com',
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https:',
            'https://fonts.googleapis.com',
          ],
          connectSrc: [
            "'self'",
            'https://maps.googleapis.com',
            'https://www.google-analytics.com',
            'https://wa.me',
          ],
          frameSrc: ["'self'", 'https://maps.google.com'],
          upgradeInsecureRequests: isProd ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: isProd
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      noSniff: true,
      xssFilter: true,
      hidePoweredBy: true,
    }),
  );
  // Apply CSRF protection to all /admin routes
  app.use('/admin', (req: Request, res: Response, next: NextFunction) => {
    const isSecureRequest =
      req.secure ||
      (req.headers['x-forwarded-proto'] ?? '').toString().includes('https');
    const useSecureCookies = isProd && isSecureRequest;
    return csrfFactory({
      cookie: {
        httpOnly: true,
        sameSite: isProd ? 'strict' : 'lax',
        secure: useSecureCookies,
      },
    })(req, res, next);
  });

  // Generate CSRF token for all /admin routes
  app.use('/admin', (req: Request, res: Response, next: NextFunction) => {
    const csrfTokenFactory = req.csrfToken as (() => string) | undefined;
    const csrfToken = csrfTokenFactory?.();
    if (csrfToken) {
      (res.locals as { csrfToken?: string }).csrfToken = csrfToken;
    }
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useStaticAssets(join(__dirname, '..', '..', 'public'), {
    maxAge: '7d',
    setHeaders: (res: Response) => {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    },
  });
  app.setBaseViewsDir(join(__dirname, '..', '..', 'views'));
  app.setViewEngine('hbs');

  // Register handlebars helpers
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  hbs.handlebars.registerHelper('formatDate', function (dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  hbs.handlebars.registerHelper('authorInitials', function (name: string) {
    if (!name) return 'LF';
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  hbs.handlebars.registerHelper('formatContent', function (content: string) {
    if (!content) return '';
    return content.replace(/\n/g, '<br>');
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

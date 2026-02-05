import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AdminAuthService } from './admin-auth.service';

function parseCookieHeader(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.split('=');
    if (!rawKey) {
      return acc;
    }
    const key = rawKey.trim();
    const value = rest.join('=').trim();
    if (key) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const cookies = parseCookieHeader(request.headers.cookie);
    const sessionToken = cookies['admin_session'];
    const isValid = await this.adminAuthService.validateSession(sessionToken);
    if (!isValid) {
      const accept = request.headers.accept ?? '';
      if (accept.includes('text/html')) {
        response.redirect('/admin/login');
        return false;
      }
      throw new UnauthorizedException('Invalid admin session');
    }
    return true;
  }
}

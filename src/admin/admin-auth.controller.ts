import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';

const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

@Controller('admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Get('login')
  renderLogin(@Res() res: Response) {
    res.render('admin-login', { csrfToken: res.locals.csrfToken || '' });
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  async submitLogin(
    @Body() body: AdminLoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const username = body.username;
    const password = body.password ?? '';
    if (!username || !password) {
      const acceptsHtml = (req.headers.accept ?? '').includes('text/html');
      if (acceptsHtml) {
        const csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : '';
        return res
          .status(400)
          .render('admin-login', {
            csrfToken,
            errorMessage: 'Username and password are required.',
          });
      }
      return res.status(400).send('Username and password are required.');
    }

    const admin = await this.adminAuthService.validateCredentials(
      username,
      password,
    );
    if (!admin) {
      const acceptsHtml = (req.headers.accept ?? '').includes('text/html');
      if (acceptsHtml) {
        const csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : '';
        return res
          .status(401)
          .render('admin-login', {
            csrfToken,
            errorMessage: 'Invalid credentials.',
          });
      }
      return res.status(401).send('Invalid credentials.');
    }

    const session = await this.adminAuthService.createSession(admin.id);
    const isProd = process.env.NODE_ENV === 'production';
    const isSecureRequest =
      req.secure ||
      (req.headers['x-forwarded-proto'] ?? '').toString().includes('https');
    res.cookie('admin_session', session.token, {
      httpOnly: true,
      sameSite: isProd ? 'strict' : 'lax',
      secure: isProd && isSecureRequest,
      maxAge: SESSION_MAX_AGE_MS,
      path: '/admin',
    });

    const acceptsHtml = (req.headers.accept ?? '').includes('text/html');
    if (acceptsHtml) {
      return res.redirect('/admin');
    }
    return res.json({ success: true });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookieHeader = req.headers.cookie ?? '';
    const token = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('admin_session='))
      ?.split('=')[1];

    await this.adminAuthService.revokeSession(token);
    res.clearCookie('admin_session', { path: '/admin' });
    return { success: true };
  }
}

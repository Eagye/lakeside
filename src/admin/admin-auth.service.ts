import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { AdminSessionEntity } from './admin-session.entity';
import { AdminUserEntity } from './admin-user.entity';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AdminAuthService implements OnModuleInit {
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminUserRepository: Repository<AdminUserEntity>,
    @InjectRepository(AdminSessionEntity)
    private readonly adminSessionRepository: Repository<AdminSessionEntity>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultAdmin();
  }

  async validateCredentials(
    username: string,
    password: string,
  ): Promise<AdminUserEntity | null> {
    const admin = await this.adminUserRepository.findOne({
      where: { username },
    });
    if (!admin) {
      return null;
    }
    const match = await compare(password, admin.passwordHash);
    return match ? admin : null;
  }

  async createSession(adminUserId: number): Promise<AdminSessionEntity> {
    const expiresAt = new Date(Date.now() + ONE_DAY_MS).toISOString();
    const session = this.adminSessionRepository.create({
      token: randomUUID(),
      adminUserId,
      expiresAt,
    });
    return this.adminSessionRepository.save(session);
  }

  async validateSession(token?: string): Promise<boolean> {
    if (!token) {
      return false;
    }
    const session = await this.adminSessionRepository.findOne({
      where: { token },
    });
    if (!session) {
      return false;
    }
    if (new Date(session.expiresAt) < new Date()) {
      await this.adminSessionRepository.delete({ id: session.id });
      return false;
    }
    return true;
  }

  async revokeSession(token?: string) {
    if (!token) {
      return;
    }
    await this.adminSessionRepository.delete({ token });
  }

  private async ensureDefaultAdmin() {
    const count = await this.adminUserRepository.count();
    if (count > 0) {
      return;
    }

    const isProd = process.env.NODE_ENV === 'production';
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    if (isProd && (!username || !password)) {
      throw new Error(
        'ADMIN_USERNAME and ADMIN_PASSWORD must be set in production.',
      );
    }

    const adminUsername = username ?? 'admin';
    const adminPassword = password ?? 'admin123';
    const passwordHash = await hash(adminPassword, 10);

    const admin = this.adminUserRepository.create({
      username: adminUsername,
      passwordHash,
    });
    await this.adminUserRepository.save(admin);
  }
}

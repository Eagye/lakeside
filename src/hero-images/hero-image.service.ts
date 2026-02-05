import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { join } from 'path';
import { LessThan, Repository } from 'typeorm';
import { HeroImageEntity } from './hero-image.entity';

const HERO_IMAGE_LIMIT = 50;
const HERO_IMAGE_EXPIRY_DAYS = 30;

@Injectable()
export class HeroImageService implements OnModuleInit {
  constructor(
    @InjectRepository(HeroImageEntity)
    private readonly heroImageRepository: Repository<HeroImageEntity>,
  ) {}

  async onModuleInit() {
    await this.cleanupExpired();
    setInterval(
      () => {
        this.cleanupExpired().catch(() => undefined);
      },
      6 * 60 * 60 * 1000,
    );
  }

  async listImages(): Promise<HeroImageEntity[]> {
    await this.cleanupExpired();
    return this.heroImageRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async addImages(files: Express.Multer.File[]): Promise<HeroImageEntity[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images uploaded');
    }

    await this.cleanupExpired();
    const count = await this.heroImageRepository.count();
    if (count + files.length > HERO_IMAGE_LIMIT) {
      throw new BadRequestException(`Hero images limit is ${HERO_IMAGE_LIMIT}`);
    }

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + HERO_IMAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const entities = files.map((file) =>
      this.heroImageRepository.create({
        filename: file.filename,
        url: `/uploads/hero/${file.filename}`,
        createdAt: now.toISOString(),
        expiresAt,
      }),
    );

    return this.heroImageRepository.save(entities);
  }

  async deleteImage(id: number) {
    const image = await this.heroImageRepository.findOne({ where: { id } });
    if (!image) {
      return;
    }
    await this.heroImageRepository.delete({ id });
    await this.safeDeleteFile(
      join(process.cwd(), 'public', image.url.replace(/^\//, '')),
    );
  }

  private async cleanupExpired() {
    const nowIso = new Date().toISOString();
    const expired = await this.heroImageRepository.find({
      where: { expiresAt: LessThan(nowIso) },
    });
    if (expired.length === 0) {
      return;
    }
    await this.heroImageRepository.delete({
      expiresAt: LessThan(nowIso),
    });
    await Promise.all(
      expired.map((image) =>
        this.safeDeleteFile(
          join(process.cwd(), 'public', image.url.replace(/^\//, '')),
        ),
      ),
    );
  }

  private async safeDeleteFile(filePath: string) {
    try {
      await fs.unlink(filePath);
    } catch {
      return;
    }
  }
}

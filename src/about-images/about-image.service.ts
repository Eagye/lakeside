import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { AboutImageEntity } from './about-image.entity';

const ABOUT_IMAGE_LIMIT = 10;

@Injectable()
export class AboutImageService {
  constructor(
    @InjectRepository(AboutImageEntity)
    private readonly aboutImageRepository: Repository<AboutImageEntity>,
  ) {}

  async listImages() {
    return this.aboutImageRepository.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async addImages(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images uploaded');
    }
    const count = await this.aboutImageRepository.count();
    if (count + files.length > ABOUT_IMAGE_LIMIT) {
      throw new BadRequestException(
        `Get to know us images limit is ${ABOUT_IMAGE_LIMIT}`,
      );
    }
    const now = new Date().toISOString();
    const existing = await this.aboutImageRepository.find({
      order: { sortOrder: 'DESC', id: 'DESC' },
      take: 1,
    });
    const startOrder = existing[0]?.sortOrder ?? 0;
    const entities = files.map((file, index) =>
      this.aboutImageRepository.create({
        filename: file.filename,
        url: `/uploads/about/${file.filename}`,
        sortOrder: startOrder + index + 1,
        createdAt: now,
      }),
    );
    return this.aboutImageRepository.save(entities);
  }

  async deleteImage(id: number) {
    const image = await this.aboutImageRepository.findOne({ where: { id } });
    if (!image) {
      return;
    }
    await this.aboutImageRepository.delete({ id });
    await this.safeDeleteFile(
      join(process.cwd(), 'public', image.url.replace(/^\//, '')),
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

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { AboutIntroImageEntity } from './about-intro-image.entity';

const IMAGE_LIMIT = 10;

@Injectable()
export class AboutIntroImageService {
  constructor(
    @InjectRepository(AboutIntroImageEntity)
    private readonly repository: Repository<AboutIntroImageEntity>,
  ) {}

  async listImages() {
    return this.repository.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async addImages(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images uploaded');
    }

    const count = await this.repository.count();
    if (count + files.length > IMAGE_LIMIT) {
      throw new BadRequestException(
        `Image limit is ${IMAGE_LIMIT}. You have ${count} images.`,
      );
    }

    const now = new Date().toISOString();
    const existing = await this.repository.find({
      order: { sortOrder: 'DESC', id: 'DESC' },
      take: 1,
    });
    const startOrder = existing[0]?.sortOrder ?? -1;

    const entities = files.map((file, index) =>
      this.repository.create({
        filename: file.filename,
        url: `/uploads/about-intro/${file.filename}`,
        sortOrder: startOrder + index + 1,
        createdAt: now,
      }),
    );
    return this.repository.save(entities);
  }

  async deleteImage(id: number) {
    const image = await this.repository.findOne({ where: { id } });
    if (!image) {
      return;
    }
    await this.repository.delete({ id });
    const filePath = join(process.cwd(), 'public', image.url.replace(/^\//, ''));
    try {
      await fs.unlink(filePath);
    } catch {
      // File might not exist
    }
  }
}

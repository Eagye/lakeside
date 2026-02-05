import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { FeatureImageEntity } from './feature-image.entity';

const FEATURE_IMAGE_LIMIT = 10;

@Injectable()
export class FeatureImageService {
  constructor(
    @InjectRepository(FeatureImageEntity)
    private readonly featureImageRepository: Repository<FeatureImageEntity>,
  ) {}

  async listImages() {
    return this.featureImageRepository.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async addImages(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images uploaded');
    }
    const count = await this.featureImageRepository.count();
    if (count + files.length > FEATURE_IMAGE_LIMIT) {
      throw new BadRequestException(
        `Why Choose Us images limit is ${FEATURE_IMAGE_LIMIT}`,
      );
    }
    const now = new Date().toISOString();
    const existing = await this.featureImageRepository.find({
      order: { sortOrder: 'DESC', id: 'DESC' },
      take: 1,
    });
    const startOrder = existing[0]?.sortOrder ?? 0;
    const entities = files.map((file, index) =>
      this.featureImageRepository.create({
        filename: file.filename,
        url: `/uploads/feature/${file.filename}`,
        sortOrder: startOrder + index + 1,
        createdAt: now,
      }),
    );
    return this.featureImageRepository.save(entities);
  }

  async deleteImage(id: number) {
    const image = await this.featureImageRepository.findOne({ where: { id } });
    if (!image) {
      return;
    }
    await this.featureImageRepository.delete({ id });
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

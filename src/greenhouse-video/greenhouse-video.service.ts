import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { GreenhouseVideoEntity } from './greenhouse-video.entity';

@Injectable()
export class GreenhouseVideoService {
  constructor(
    @InjectRepository(GreenhouseVideoEntity)
    private readonly repository: Repository<GreenhouseVideoEntity>,
  ) {}

  async getVideo() {
    const videos = await this.repository.find({
      order: { id: 'DESC' },
      take: 1,
    });
    return videos[0] || null;
  }

  async uploadVideo(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No video uploaded');
    }

    // Delete old video if exists
    const existing = await this.repository.find({
      order: { id: 'DESC' },
      take: 1,
    });
    if (existing[0]) {
      await this.deleteVideo(existing[0].id);
    }

    const now = new Date().toISOString();
    const entity = this.repository.create({
      filename: file.filename,
      url: `/uploads/greenhouse/${file.filename}`,
      createdAt: now,
    });
    return this.repository.save(entity);
  }

  async deleteVideo(id: number) {
    const video = await this.repository.findOne({ where: { id } });
    if (!video) {
      return;
    }
    await this.repository.delete({ id });
    const filePath = join(
      process.cwd(),
      'public',
      video.url.replace(/^\//, ''),
    );
    try {
      await fs.unlink(filePath);
    } catch {
      // File might not exist
    }
  }
}
